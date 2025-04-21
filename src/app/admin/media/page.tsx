"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/common/Loader";
import {
  getMedia,
  deleteMedia,
} from "@/app/lib/actions/media/media.controller";
import {
  Image as ImageIcon,
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
  Download,
  Eye,
  ClipboardCopy, // Import the copy icon
} from "lucide-react";

// Improved Pagination component import
import Pagination from "@/components/Share/Pagination";
// Improved Search component import
import Search from "@/components/Share/Search";
import constant from "@/constant";

// Define types for filter options
type FilterOptions = {
  status: string;
  file_type: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

// Status options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

// File type options
const fileTypeOptions = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/gif", label: "GIF" },
];

export default function MediaList() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "",
    file_type: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const sortByOptions = [
    { value: "created_at", label: "Date Uploaded" },
    { value: "title", label: "Title" },
    { value: "size", label: "File Size" },
  ];

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await getMedia({
        page: currentPage,
        limit: limit,
        search: searchText || undefined,
        status: filterOptions.status || undefined,
        file_type: filterOptions.file_type || undefined,
        sortBy: filterOptions.sortBy,
        sortOrder: filterOptions.sortOrder,
      });

      const { data, meta } = res;
      setMediaList(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch media items");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, searchText, filterOptions]);

  useEffect(() => {
    // Update active filters for display
    const newActiveFilters = [];
    if (filterOptions.status)
      newActiveFilters.push(
        `Status: ${statusOptions.find((opt) => opt.value === filterOptions.status)?.label || filterOptions.status}`,
      );
    if (filterOptions.file_type)
      newActiveFilters.push(
        `Type: ${fileTypeOptions.find((opt) => opt.value === filterOptions.file_type)?.label || filterOptions.file_type}`,
      );
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
          "Are you sure you want to delete this media item? This action cannot be undone.",
        buttons: [
          {
            label: "Delete",
            className: "bg-red-500 text-white px-4 py-2 rounded-md",
            onClick: async () => {
              try {
                const res = await deleteMedia({ id });
                if (res?.success) {
                  toast.success(res?.message);
                  handleGetData();
                  setSelectedIds(
                    selectedIds.filter((selectedId) => selectedId !== id),
                  );
                }
              } catch (error) {
                toast.error("Failed to delete media item");
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
      await deleteMedia({ id });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.info("No media items selected");
      return;
    }

    confirmAlert({
      title: "Confirm Bulk Deletion",
      message: `Are you sure you want to delete ${selectedIds.length} selected media item(s)? This action cannot be undone.`,
      buttons: [
        {
          label: "Delete All",
          className: "bg-red-500 text-white px-4 py-2 rounded-md",
          onClick: async () => {
            setIsLoading(true);
            try {
              const deletePromises = selectedIds.map((id) =>
                deleteMedia({ id }),
              );
              await Promise.all(deletePromises);
              toast.success(
                `${selectedIds.length} media items deleted successfully`,
              );
              setSelectedIds([]);
              setIsAllSelected(false);
              handleGetData();
            } catch (error) {
              toast.error("Failed to delete some media items");
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
      const allIds = mediaList.map((media: any) => media.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (mediaId: number) => {
    const isExist = selectedIds?.find((id) => id === mediaId);
    if (!isExist) {
      setSelectedIds([...selectedIds, mediaId]);
    } else {
      setSelectedIds(
        selectedIds.filter((selectedId) => selectedId !== mediaId),
      );
    }
  };

  const onSearch = async (keyword: string) => {
    setSearchText(keyword);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setFilterOptions({
      status: "",
      file_type: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchText("");
    setCurrentPage(1);
  };

  const removeFilter = (filterText: string) => {
    if (filterText.startsWith("Status:")) {
      handleFilterChange("status", "");
    } else if (filterText.startsWith("Type:")) {
      handleFilterChange("file_type", "");
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

  // Format file size from bytes to readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to copy file path to clipboard
  const copyFilePath = (filePath: string) => {
    navigator.clipboard
      .writeText(filePath)
      .then(() => {
        toast.success("File path copied to clipboard");
      })
      .catch((error) => {
        toast.error("Failed to copy file path");
        console.error("Copy error:", error);
      });
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-6 shadow-md dark:bg-black">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 dark:bg-black sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
              Media Library
            </h4>
            <span className="bg-gray-100 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 text-sm dark:bg-meta-4">
              {total} {total === 1 ? "item" : "items"}
            </span>
          </div>
          <Link
            href="/admin/media/upload"
            className="hover:bg-primary-dark inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Media
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-50 mb-6 rounded-lg p-4 dark:bg-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center">
              <Search
                onSearch={onSearch}
                placeholder="Search media by title..."
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
                        value={filterOptions.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                          <option
                            key={`key-${status.value}`}
                            value={status.value}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-gray-700 dark:text-gray-300 mb-1 block text-xs font-medium">
                        File Type
                      </label>
                      <select
                        className="border-gray-300 dark:border-gray-700 w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-black"
                        value={filterOptions.file_type}
                        onChange={(e) =>
                          handleFilterChange("file_type", e.target.value)
                        }
                      >
                        <option value="">All Types</option>
                        {fileTypeOptions.map((type) => (
                          <option key={`key-${type.value}`} value={type.value}>
                            {type.label}
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

            {/* Bulk Actions */}
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

          {/* Active Filters Display */}
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

        {/* Media Grid */}
        <div className="border-gray-200 dark:border-gray-700 rounded-lg border bg-white p-4 dark:bg-black">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader />
            </div>
          ) : Array.isArray(mediaList) && mediaList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="text-gray-400 mb-2 h-12 w-12" />
              <h3 className="text-gray-900 mb-1 text-lg font-medium dark:text-white">
                No media items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {searchText || activeFilters.length > 0
                  ? `No media items match your current filters. Try different search terms or clear your filters.`
                  : "There are no media items in the system yet. Click 'Upload Media' to add one."}
              </p>
            </div>
          ) : (
            <>
              {/* Select All Checkbox */}
              <div className="mb-4 flex items-center">
                <button
                  className="rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => handleSelectAll(!isAllSelected)}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="text-gray-400 h-5 w-5" />
                  )}
                </button>
                <span className="text-gray-600 dark:text-gray-300 ml-2 text-sm">
                  Select All
                </span>
              </div>

              {/* Media Grid Display */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mediaList.map((media: any) => (
                  <div
                    key={media.id}
                    className="border-gray-200 dark:border-gray-700 group relative overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-black"
                  >
                    <div className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute left-2 top-2 z-10">
                        <button
                          className="rounded bg-white/80 p-1 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-black/80"
                          onClick={() => handleSelectOne(media.id)}
                        >
                          {selectedIds.includes(media.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="text-gray-400 h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Media Preview */}
                      <div className="bg-gray-100 dark:bg-gray-800 relative aspect-square overflow-hidden">
                        <Image
                          src={`${constant.baseUrl}/api/files?fileName=${media.file_name}`}
                          alt={media.alt_text || media.title}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-opacity group-hover:bg-opacity-40 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/media/edit?id=${media.id}`}
                            className="text-gray-800 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full bg-white p-2 shadow-lg dark:text-white"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(media.id)}
                            className="text-red-500 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full bg-white p-2 shadow-lg"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <a
                            href={`${constant.baseUrl}/api/files?fileName=${media.file_name}&download=true`}
                            className="dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full bg-white p-2 text-blue-500 shadow-lg"
                            download
                          >
                            <Download className="h-5 w-5" />
                          </a>
                          <a
                            href={`${constant.baseUrl}/api/files?fileName=${media.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full bg-white p-2 shadow-lg dark:text-white"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() =>
                              copyFilePath(
                                `${constant.baseUrl}/api/files?fileName=${media.file_name}`,
                              )
                            }
                            className="text-gray-800 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full bg-white p-2 shadow-lg dark:text-white"
                          >
                            <ClipboardCopy className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Media Info */}
                    <div className="p-3">
                      <h3 className="text-gray-900 truncate font-medium dark:text-white">
                        {media.title}
                      </h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {formatFileSize(media.size)}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            media.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : media.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {media.status.charAt(0).toUpperCase() +
                            media.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && mediaList.length > 0 && (
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
