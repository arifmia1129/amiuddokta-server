/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import Pagination from "@/components/Share/Pagination";
import Loader from "@/components/common/Loader";
import {
  deleteSettingByIdController,
  retrieveSettingListController,
} from "@/app/lib/actions/setting/setting.controller";
import { formatDate } from "@/utils/functions";
import ActionButtons from "@/components/Editor/ActionButtons";
import AuthorInfo from "@/components/Editor/AuthorName";
import {
  Settings,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  Database,
  Calendar,
  User,
} from "lucide-react";

export default function SettingList() {
  const [settingList, setSettingList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await retrieveSettingListController({
        page: currentPage,
        pageSize: limit,
        searchTerm: searchTerm || undefined,
      });

      const { data, totalLength } = res.data;
      setSettingList(data);
      setTotal(totalLength);
    } catch (error) {
      toast.error("Failed to retrieve settings.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleGetData();
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    handleGetData();
  };

  const handleDelete = async (id: number) => {
    confirmAlert({
      title: "Confirmation",
      message:
        "You are about to delete this setting, and this action cannot be undone.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const res = await deleteSettingByIdController(id);
            if (res?.success) {
              toast.success(res?.message);
              handleGetData();
            }
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  return (
    <DefaultLayout>
      <div className="rounded-xl bg-white px-6 py-6 shadow-lg dark:bg-boxdark">
        {/* Header with Stats */}
        <div className="mb-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Settings className="mr-3 text-primary" size={24} />
              <h2 className="text-gray-800 dark:text-gray-200 text-2xl font-semibold">
                Settings Management
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 inline-flex items-center rounded-lg border bg-white px-3 py-2 transition dark:bg-boxdark"
                disabled={isRefreshing}
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <Link
                href="/admin/settings/add"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Plus size={18} className="mr-2" />
                Add New Setting
              </Link>
            </div>
          </div>

          {/* Search and Stats Bar */}
          <div className="bg-gray-50 mb-6 flex flex-col items-center justify-between gap-4 rounded-xl p-4 dark:bg-meta-4 md:flex-row">
            <form onSubmit={handleSearch} className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-900 w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm text-black outline-none focus:border-primary dark:text-white"
                />
                <Search
                  className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  size={16}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-primary px-2 py-1 text-xs text-white"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4 md:justify-end">
              <div className="border-gray-100 dark:border-gray-700 flex items-center space-x-3 rounded-lg border bg-white p-3 shadow-sm dark:bg-meta-4">
                <Database size={18} className="text-blue-500" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Total Settings
                  </p>
                  <p className="font-semibold">{total}</p>
                </div>
              </div>
              <div className="border-gray-100 dark:border-gray-700 flex items-center space-x-3 rounded-lg border bg-white p-3 shadow-sm dark:bg-meta-4">
                <Info size={18} className="text-green-500" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Items Per Page
                  </p>
                  <p className="font-semibold">{limit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader />
          </div>
        ) : (
          <div className="border-gray-100 dark:border-gray-800 overflow-hidden rounded-xl border bg-white dark:bg-boxdark">
            {/* Table Header */}
            <div className="bg-gray-50 text-gray-600 dark:text-gray-300 grid grid-cols-4 gap-4 p-5 text-left text-sm font-medium dark:bg-meta-4">
              <div className="flex items-center space-x-2">
                <Settings size={16} />
                <span>MODULE</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Database size={16} />
                <span>FIELDS</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <User size={16} />
                <span>AUTHOR</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Calendar size={16} />
                <span>UPDATED</span>
              </div>
            </div>

            {/* Table Body */}
            {settingList.length > 0 ? (
              <div className="divide-gray-100 dark:divide-gray-800 divide-y">
                {settingList.map((setting: any, index: number) => (
                  <div
                    key={setting?.id}
                    className={`hover:bg-gray-50 grid grid-cols-4 items-center gap-4 p-5 transition dark:hover:bg-meta-4`}
                  >
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 mb-1 font-medium">
                        {setting?.module}
                      </p>
                      <div className="mt-2">
                        <ActionButtons
                          editLink={`/admin/settings/add?id=${setting.id}`}
                          id={setting.id}
                          onDelete={handleDelete}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {setting?.setting_fields?.length}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <AuthorInfo authorId={setting?.created_by} />
                    </div>
                    <div className="flex justify-center">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm">
                        <Calendar size={14} />
                        {formatDate(setting?.updated_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={36} className="text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">
                  No settings found
                </p>
                <p className="text-gray-400 dark:text-gray-500 mb-4 max-w-sm text-sm">
                  No settings match your criteria. Try adjusting your search or
                  create a new setting.
                </p>
                <Link
                  href="/admin/settings/add"
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm text-white transition hover:bg-primary/90"
                >
                  <Plus size={16} className="mr-2" />
                  Create Setting
                </Link>
              </div>
            )}

            {/* Pagination */}
            <div className="border-gray-100 dark:border-gray-800 border-t p-4">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
                total={total}
              />
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
