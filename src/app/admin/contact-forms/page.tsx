"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import {
  deleteContactForm,
  getContactForms,
} from "@/app/lib/actions/contactForm/contactForm.controller";
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
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";

type FilterOptions = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export default function ContactList() {
  const [contactList, setContactList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const sortByOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "name", label: "Name" },
  ];

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await getContactForms({
        page: currentPage,
        limit: limit,
        search: searchText || undefined,
        sortBy: filterOptions.sortBy,
        sortOrder: filterOptions.sortOrder,
      });

      const { data, meta } = res;
      setContactList(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch contact forms");
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
          "Are you sure you want to delete this contact form submission? This action cannot be undone.",
        buttons: [
          {
            label: "Delete",
            className: "bg-red-500 text-white px-4 py-2 rounded-md",
            onClick: async () => {
              try {
                const res = await deleteContactForm({ id });
                if (res?.success) {
                  toast.success(res?.message);
                  handleGetData();
                  setSelectedIds(
                    selectedIds.filter((selectedId) => selectedId !== id),
                  );
                }
              } catch (error) {
                toast.error("Failed to delete contact form submission");
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
      await deleteContactForm({ id });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.info("No contact form submissions selected");
      return;
    }

    confirmAlert({
      title: "Confirm Bulk Deletion",
      message: `Are you sure you want to delete ${selectedIds.length} selected contact form submission(s)? This action cannot be undone.`,
      buttons: [
        {
          label: "Delete All",
          className: "bg-red-500 text-white px-4 py-2 rounded-md",
          onClick: async () => {
            setIsLoading(true);
            try {
              const deletePromises = selectedIds.map((id) =>
                deleteContactForm({ id }),
              );
              await Promise.all(deletePromises);
              toast.success(
                `${selectedIds.length} contact form submissions deleted successfully`,
              );
              setSelectedIds([]);
              setIsAllSelected(false);
              handleGetData();
            } catch (error) {
              toast.error("Failed to delete some contact form submissions");
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
      const allIds = contactList.map((contact: any) => contact.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (contactId: number) => {
    const isExist = selectedIds?.find((id) => id === contactId);
    if (!isExist) {
      setSelectedIds([...selectedIds, contactId]);
    } else {
      setSelectedIds(
        selectedIds.filter((selectedId) => selectedId !== contactId),
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
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchText("");
    setCurrentPage(1);
  };

  const removeFilter = (filterText: string) => {
    if (filterText.startsWith("Sort:")) {
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
              Contact Form Management
            </h4>
            <span className="bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 text-sm dark:bg-meta-4">
              {total} {total === 1 ? "contact form" : "contact forms"}
            </span>
          </div>
          <Link
            href="/admin/contact-forms/add"
            className="hover:bg-primary-dark inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Contact Form
          </Link>
        </div>

        <div className="bg-gray-50 mb-6 rounded-lg p-4 dark:bg-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center">
              <Search
                onSearch={onSearch}
                placeholder="Search contact forms by name..."
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
          ) : Array.isArray(contactList) && contactList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="text-gray-400 mb-2 h-12 w-12" />
              <h3 className="text-gray-900 mb-1 text-lg font-medium dark:text-white">
                No contact forms found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchText || activeFilters.length > 0
                  ? `No contact forms match your current filters. Try different search terms or clear your filters.`
                  : "There are no contact forms in the system yet. Click 'Add New Contact Form' to create one."}
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
                        Contact Form Details
                      </span>
                    </div>
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                    Message
                  </th>
                  <th className="text-gray-500 dark:text-gray-400 px-4 py-3.5 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-gray-200 dark:divide-gray-700 divide-y bg-white dark:bg-black">
                {contactList.map((contact: any) => (
                  <tr
                    key={contact?.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition duration-150"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center">
                        <button
                          className="rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={() => handleSelectOne(contact?.id)}
                        >
                          {selectedIds.includes(contact?.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="text-gray-400 h-5 w-5" />
                          )}
                        </button>
                        <div className="ml-3 flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              src={
                                "/images/no_image.png"
                              }
                              alt={contact?.name || "Contact Form"}
                              width={40}
                              height={40}
                              className="border-gray-200 dark:border-gray-700 h-10 w-10 rounded-full border object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-gray-900 font-medium dark:text-white">
                              {contact?.name}
                            </div>
                            <div className="text-gray-500 text-sm dark:text-gray-400">
                              {contact?.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="text-gray-900 text-sm dark:text-white">
                        {contact?.message}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/contact-forms/edit?id=${contact?.id}`}
                          className="rounded-full p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(contact?.id)}
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

        {!isLoading && contactList.length > 0 && (
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
