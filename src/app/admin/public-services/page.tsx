"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import { formatDate, shortenWithLastWord } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import {
  deletePublicService,
  getPublicServices,
} from "@/app/lib/actions/publicService/publicService.controller";
import {
  Users,
  PlusCircle,
  Search as SearchIcon,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";

import Pagination from "@/components/Share/Pagination";
import Search from "@/components/Share/Search";
import constant from "@/constant";

type FilterOptions = {
  category: "new_services" | "notices" | "important_links" | "";
  status: "active" | "inactive" | "";
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const categoryOptions = [
  { value: "new_services", label: "New Services" },
  { value: "notices", label: "Notices" },
  { value: "important_links", label: "Important Links" },
];

export default function PublicServiceList() {
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: "",
    status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const sortByOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
  ];

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await getPublicServices({
        page: currentPage,
        limit: limit,
        search: searchText || undefined,
        category:
          filterOptions.category === "" ? undefined : filterOptions.category,
        status: filterOptions.status === "" ? undefined : filterOptions.status,
        sortBy: filterOptions.sortBy,
        sortOrder: filterOptions.sortOrder,
      });

      const { data, meta } = res;
      setServiceList(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch public services");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, searchText, filterOptions]);

  useEffect(() => {
    const newActiveFilters = [];
    if (filterOptions.category !== "")
      newActiveFilters.push(
        `Category: ${categoryOptions.find((opt) => opt.value === filterOptions.category)?.label}`,
      );
    if (filterOptions.status !== "")
      newActiveFilters.push(`Status: ${filterOptions.status}`);
    if (filterOptions.sortBy) {
      const sortLabel = sortByOptions.find(
        (opt) => opt.value === filterOptions.sortBy,
      )?.label;
      newActiveFilters.push(
        `Sort: ${sortLabel} (${filterOptions.sortOrder === "asc" ? "A-Z" : "Z-A"})`,
      );
    }

    setActiveFilters(newActiveFilters);
  }, [filterOptions]);

  const handleDelete = async (id: number, source = "single") => {
    if (source === "single") {
      confirmAlert({
        title: "Confirm Deletion",
        message:
          "Are you sure you want to delete this public service? This action cannot be undone.",
        buttons: [
          {
            label: "Delete",
            className: "bg-red-500 text-white px-4 py-2 rounded-md",
            onClick: async () => {
              try {
                const res = await deletePublicService({ id });
                if (res?.success) {
                  toast.success(res?.message);
                  handleGetData();
                  setSelectedIds(
                    selectedIds.filter((selectedId) => selectedId !== id),
                  );
                } else {
                  toast.error(res?.message);
                }
              } catch (error) {
                toast.error("Failed to delete public service");
              }
            },
          },
          {
            label: "Cancel",
            className: "bg-gray-200 text-gray-800 px-4 py-2 rounded-md ml-2",
          },
        ],
      });
    } else {
      await deletePublicService({ id });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.info("No public services selected");
      return;
    }

    confirmAlert({
      title: "Confirm Bulk Deletion",
      message: `Are you sure you want to delete ${selectedIds.length} selected public service(s)? This action cannot be undone.`,
      buttons: [
        {
          label: "Delete All",
          className: "bg-red-500 text-white px-4 py-2 rounded-md",
          onClick: async () => {
            setIsLoading(true);
            try {
              const deletePromises = selectedIds.map((id) =>
                deletePublicService({ id }),
              );
              await Promise.all(deletePromises);
              toast.success(
                `${selectedIds.length} public services deleted successfully`,
              );
              setSelectedIds([]);
              setIsAllSelected(false);
              handleGetData();
            } catch (error) {
              toast.error("Failed to delete some public services");
            } finally {
              setIsLoading(false);
            }
          },
        },
        {
          label: "Cancel",
          className: "bg-gray-200 text-gray-800 px-4 py-2 rounded-md ml-2",
        },
      ],
    });
  };

  const handleSelectAll = (value: boolean) => {
    const checked = value;
    setIsAllSelected(checked);
    if (checked) {
      const allIds = serviceList.map((service: any) => service.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (serviceId: number) => {
    const isExist = selectedIds?.find((id) => id === serviceId);
    if (!isExist) {
      setSelectedIds([...selectedIds, serviceId]);
    } else {
      setSelectedIds(
        selectedIds.filter((selectedId) => selectedId !== serviceId),
      );
    }
  };

  const onSearch = async (keyword: string) => {
    setSearchText(keyword);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterOptions({
      category: "",
      status: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchText("");
    setCurrentPage(1);
  };

  const removeFilter = (filterText: string) => {
    if (filterText.startsWith("Category:")) {
      handleFilterChange("category", "");
    } else if (filterText.startsWith("Status:")) {
      handleFilterChange("status", "");
    } else if (filterText.startsWith("Sort:")) {
      handleFilterChange("sortBy", "created_at");
      handleFilterChange("sortOrder", "desc");
    }
  };

  const toggleSort = () => {
    handleFilterChange(
      "sortOrder",
      filterOptions.sortOrder === "asc" ? "desc" : "asc",
    );
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-6 shadow-md dark:bg-black">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 dark:bg-black sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
              Public Service Management
            </h4>
            <span className="bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 text-sm dark:bg-meta-4">
              {total} {total === 1 ? "service" : "services"}
            </span>
          </div>
          <Link
            href="/admin/public-services/add"
            className="hover:bg-primary-dark inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Link>
        </div>

        <div className="bg-gray-50 mb-6 rounded-lg p-4 dark:bg-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center">
              <Search
                onSearch={onSearch}
                placeholder="Search services by title..."
                debounceDelay={400}
              />

              <div className="relative ml-2">
                <button
                  className="border-gray-200 dark:border-gray-700 flex items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="text-gray-500 h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown className="text-gray-500 h-4 w-4" />
                </button>

                {showFilters && (
                  <div className="border-gray-200 dark:border-gray-700 absolute right-0 z-10 mt-2 w-64 rounded-md border bg-white p-4 shadow-lg dark:bg-black">
                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        Category
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={filterOptions.category}
                        onChange={(e) =>
                          handleFilterChange("category", e.target.value)
                        }
                      >
                        <option value="">All Categories</option>
                        {categoryOptions.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        Status
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={filterOptions.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <select
                          className="border-gray-300 dark:border-gray-700 flex-1 rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                          value={filterOptions.sortBy}
                          onChange={(e) =>
                            handleFilterChange("sortBy", e.target.value)
                          }
                        >
                          {sortByOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="border-gray-300 dark:border-gray-700 rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                          onClick={toggleSort}
                        >
                          {filterOptions.sortOrder === "asc" ? "A-Z" : "Z-A"}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 text-sm dark:hover:text-white"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </button>
                      <button
                        className="hover:text-primary-dark text-sm font-medium text-primary"
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="border-gray-200 dark:border-gray-700 flex items-center gap-2 rounded-md border bg-white px-3 py-2 dark:bg-black">
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {(activeFilters.length > 0 || searchText) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Active filters:
              </span>

              {searchText && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Search: {searchText}
                  <button onClick={() => setSearchText("")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {filter}
                  <button onClick={() => removeFilter(filter)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs underline"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="border-gray-200 dark:border-gray-700 overflow-x-auto rounded-lg border bg-white dark:bg-black">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader />
            </div>
          ) : Array.isArray(serviceList) && serviceList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="text-gray-400 mb-2 h-12 w-12" />
              <h3 className="text-gray-900 mb-1 text-lg font-medium dark:text-white">
                No public services found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchText || activeFilters.length > 0
                  ? `No services match your current filters. Try different search terms or clear your filters.`
                  : "There are no public services in the system yet. Click 'Add New Service' to create one."}
              </p>
            </div>
          ) : (
            <table className="divide-gray-200 dark:divide-gray-700 w-full min-w-full divide-y dark:bg-black">
              <thead className="bg-gray-50 dark:bg-black">
                <tr>
                  <th className="px-4 py-3.5 text-left">
                    <div className="flex items-center">
                      <button
                        className="rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={(e: any) => handleSelectAll(!isAllSelected)}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="text-gray-400 h-5 w-5" />
                        )}
                      </button>
                      <span className="text-gray-500 dark:text-gray-400 ml-3 text-xs font-medium uppercase tracking-wider">
                        Service Details
                      </span>
                    </div>
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Short Description
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-gray-200 dark:divide-gray-700 divide-y bg-white dark:bg-black">
                {serviceList.map((service: any) => (
                  <tr
                    key={service?.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition duration-150"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center">
                        <button
                          className="rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={() => handleSelectOne(service?.id)}
                        >
                          {selectedIds.includes(service?.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="text-gray-400 h-5 w-5" />
                          )}
                        </button>
                        <div className="ml-3 flex items-center">
                          <div className="ml-4">
                            <div className="text-gray-900 font-medium dark:text-white">
                              {service?.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-full px-4 py-3.5">
                      <div className="text-gray-900 max-w-52 text-sm dark:text-white">
                        {shortenWithLastWord(service?.short_description, 100)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service?.category === "new_services"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            : service?.category === "notices"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        }`}
                      >
                        {service?.category === "new_services"
                          ? "New Services"
                          : service?.category === "notices"
                            ? "Notices"
                            : "Important Links"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service?.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {service?.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/public-services/edit?id=${service?.id}`}
                          className="rounded-full p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(service?.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && serviceList.length > 0 && (
          <div className="mt-5">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={limit}
              setLimit={setLimit}
              total={total}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
