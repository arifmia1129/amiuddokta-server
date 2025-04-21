"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import {
  deleteCareersItem,
  getCareersItems,
} from "@/app/lib/actions/careers/careers.controller";
import {
  Briefcase,
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
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import constant from "@/constant";

type FilterOptions = {
  is_featured: boolean | "";
  sortBy: string;
  sortOrder: "asc" | "desc";
  job_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "internship"
    | "remote"
    | undefined;
  job_status: "open" | "closed" | "draft" | "expired" | "filled" | undefined;
};

const statusOptions = [
  { value: true, label: "Featured" },
  { value: false, label: "Not Featured" },
];

const jobTypeOptions = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

const jobStatusOptions = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
  { value: "filled", label: "Filled" },
];

export default function CareersList() {
  const [careerList, setCareerList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    is_featured: "",
    sortBy: "created_at",
    sortOrder: "desc",
    job_type: undefined,
    job_status: undefined,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const sortByOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "title", label: "Title" },
  ];

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await getCareersItems({
        page: currentPage,
        limit: limit,
        search: searchText || undefined,
        is_featured:
          filterOptions.is_featured === ""
            ? undefined
            : filterOptions.is_featured,
        sortBy: filterOptions.sortBy,
        sortOrder: filterOptions.sortOrder,
        job_type: filterOptions.job_type,
        job_status: filterOptions.job_status,
      });

      const { data, meta } = res;
      setCareerList(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch career items");
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
    if (filterOptions.is_featured !== "")
      newActiveFilters.push(
        `Status: ${filterOptions.is_featured ? "Featured" : "Not Featured"}`,
      );
    if (filterOptions.job_type) {
      const jobTypeLabel = jobTypeOptions.find(
        (opt) => opt.value === filterOptions.job_type,
      )?.label;
      newActiveFilters.push(`Job Type: ${jobTypeLabel}`);
    }
    if (filterOptions.job_status) {
      const jobStatusLabel = jobStatusOptions.find(
        (opt) => opt.value === filterOptions.job_status,
      )?.label;
      newActiveFilters.push(`Job Status: ${jobStatusLabel}`);
    }
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
          "Are you sure you want to delete this career item? This action cannot be undone.",
        buttons: [
          {
            label: "Delete",
            className: "bg-red-500 text-white px-4 py-2 rounded-md",
            onClick: async () => {
              try {
                const res = await deleteCareersItem({ id });
                if (res?.success) {
                  toast.success(res?.message);
                  handleGetData();
                  setSelectedIds(
                    selectedIds.filter((selectedId) => selectedId !== id),
                  );
                }
              } catch (error) {
                toast.error("Failed to delete career item");
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
      await deleteCareersItem({ id });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.info("No career items selected");
      return;
    }

    confirmAlert({
      title: "Confirm Bulk Deletion",
      message: `Are you sure you want to delete ${selectedIds.length} selected career item(s)? This action cannot be undone.`,
      buttons: [
        {
          label: "Delete All",
          className: "bg-red-500 text-white px-4 py-2 rounded-md",
          onClick: async () => {
            setIsLoading(true);
            try {
              const deletePromises = selectedIds.map((id) =>
                deleteCareersItem({ id }),
              );
              await Promise.all(deletePromises);
              toast.success(
                `${selectedIds.length} career items deleted successfully`,
              );
              setSelectedIds([]);
              setIsAllSelected(false);
              handleGetData();
            } catch (error) {
              toast.error("Failed to delete some career items");
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
      const allIds = careerList.map((career: any) => career.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (careerId: number) => {
    const isExist = selectedIds?.find((id) => id === careerId);
    if (!isExist) {
      setSelectedIds([...selectedIds, careerId]);
    } else {
      setSelectedIds(
        selectedIds.filter((selectedId) => selectedId !== careerId),
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
      [key]:
        key === "is_featured"
          ? value === "true"
            ? true
            : value === "false"
              ? false
              : ""
          : value,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterOptions({
      is_featured: "",
      sortBy: "created_at",
      sortOrder: "desc",
      job_type: undefined,
      job_status: undefined,
    });
    setSearchText("");
    setCurrentPage(1);
  };

  const removeFilter = (filterText: string) => {
    if (filterText.startsWith("Status:")) {
      handleFilterChange("is_featured", "");
    } else if (filterText.startsWith("Job Type:")) {
      handleFilterChange("job_type", "");
    } else if (filterText.startsWith("Job Status:")) {
      handleFilterChange("job_status", "");
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
            <Briefcase className="h-6 w-6 text-primary" />
            <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
              Careers Management
            </h4>
            <span className="bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 text-sm dark:bg-meta-4">
              {total} {total === 1 ? "career item" : "career items"}
            </span>
          </div>
          <Link
            href="/admin/careers/add"
            className="hover:bg-primary-dark inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Career Item
          </Link>
        </div>

        <div className="bg-gray-50 mb-6 rounded-lg p-4 dark:bg-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center">
              <Search
                onSearch={onSearch}
                placeholder="Search career items by title..."
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
                        Status
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={
                          filterOptions.is_featured === ""
                            ? ""
                            : filterOptions.is_featured.toString()
                        }
                        onChange={(e) =>
                          handleFilterChange("is_featured", e.target.value)
                        }
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                          <option
                            key={`key-${status.value}`}
                            value={status.value.toString()}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        Job Type
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={filterOptions.job_type}
                        onChange={(e) =>
                          handleFilterChange("job_type", e.target.value)
                        }
                      >
                        <option value="">All Job Types</option>
                        {jobTypeOptions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        Job Status
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={filterOptions.job_status}
                        onChange={(e) =>
                          handleFilterChange("job_status", e.target.value)
                        }
                      >
                        <option value="">All Job Statuses</option>
                        {jobStatusOptions.map((status) => (
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
          ) : Array.isArray(careerList) && careerList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="text-gray-400 mb-2 h-12 w-12" />
              <h3 className="text-gray-900 mb-1 text-lg font-medium dark:text-white">
                No career items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchText || activeFilters.length > 0
                  ? `No career items match your current filters. Try different search terms or clear your filters.`
                  : "There are no career items in the system yet. Click 'Add New Career Item' to create one."}
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
                        Career Item Details
                      </span>
                    </div>
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Job Type
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Job Status
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
                {careerList.map((career: any) => (
                  <tr
                    key={career?.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition duration-150"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center">
                        <button
                          className="rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={() => handleSelectOne(career?.id)}
                        >
                          {selectedIds.includes(career?.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="text-gray-400 h-5 w-5" />
                          )}
                        </button>
                        <div className="ml-3 flex items-center">
                          <div className="ml-4">
                            <div className="text-gray-900 font-medium dark:text-white">
                              {career?.title}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              {career?.company_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="text-gray-900 text-sm dark:text-white">
                        {career?.job_type}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="text-gray-900 text-sm dark:text-white">
                        {career?.job_status}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          career?.is_featured
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {career?.is_featured ? "Featured" : "Not Featured"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/careers/edit?id=${career?.id}`}
                          className="rounded-full p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(career?.id)}
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

        {!isLoading && careerList.length > 0 && (
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
