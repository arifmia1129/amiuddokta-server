"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import {
  Search as SearchIcon,
  Edit,
  Eye,
  Trash2,
  FileText,
  ChevronDown,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Pagination from "@/components/Share/Pagination";
import {
  retrieveApplicationListController,
  searchApplicationController,
  updateApplicationController,
} from "@/app/lib/actions/application/application.controller";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";
import { getSessionController } from "@/app/lib/actions/auth/auth.controller";

interface ApplicationStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW";
  createdAt: string;
}

// Application status configuration
const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  APPROVED: { color: "bg-green-100 text-green-800", label: "Approved" },
  REJECTED: { color: "bg-red text-pink-800", label: "Rejected" },
  IN_REVIEW: { color: "bg-blue-100 text-blue-800", label: "In Review" },
};

export default function ApplicationList() {
  const [applicationList, setApplicationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const res = await retrieveApplicationListController({
        page: currentPage,
        pageSize: limit,
        sort: sortField,
        order: sortOrder,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });

      const { data, totalLength } = res.data;
      setApplicationList(data);
      setTotal(totalLength);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, sortField, sortOrder, selectedStatus]);

  const handleDelete = async (id: string) => {
    confirmAlert({
      title: "Delete Application",
      message: "Are you sure you want to delete this application?",
      buttons: [
        {
          label: "Delete",
          className: "bg-red text-white px-4 py-2 rounded hover:bg-red-600",
          onClick: async () => {
            // Implement delete logic
            toast.success("Application deleted successfully");
            handleGetData();
          },
        },
        {
          label: "Cancel",
          className:
            "bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 ml-2",
        },
      ],
    });
  };

  const onSearch = async (searchText: string) => {
    setIsLoading(true);
    try {
      const res = await searchApplicationController(
        { keyword: searchText },
        { page: currentPage, pageSize: limit },
      );
      const { data, totalLength } = res.data;
      setApplicationList(data);
      setTotal(totalLength);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    const user = await getSessionController();

    confirmAlert({
      title: `Mark Application as ${newStatus}`,
      message: `Are you sure you want to mark this application as ${newStatus.toLowerCase()}?`,
      buttons: [
        {
          label: "Yes",
          className:
            "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
          onClick: async () => {
            await updateApplicationController({
              id,
              status: newStatus.toLowerCase(),
              action_by: user?.id,
            });
            handleGetData();
            toast.success(`Application marked as ${newStatus.toLowerCase()}`);
          },
        },
        {
          label: "No",
          className:
            "bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 ml-2",
        },
      ],
    });
  };

  const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CONFIG[status]?.color}`}
      >
        {STATUS_CONFIG[status]?.label}
      </span>
    );
  };

  const renderTableHeader = (label: string, field: string) => (
    <th
      className="hover:bg-gray-200 cursor-pointer p-4 transition-colors dark:hover:bg-meta-4"
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
          setSortField(field);
          setSortOrder("asc");
        }
      }}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            sortField === field && sortOrder === "desc"
              ? "rotate-180 transform"
              : ""
          }`}
        />
      </div>
    </th>
  );

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <h4 className="text-xl font-semibold">Applications</h4>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <select
                className="form-select border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                {Object.keys(STATUS_CONFIG).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
                  </option>
                ))}
              </select>
            </div>
            <Search onSearch={onSearch} />
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="border-gray-200 dark:border-gray-700 overflow-x-auto rounded-lg border">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left font-semibold uppercase dark:bg-meta-4">
                  {renderTableHeader("Name", "name")}
                  {renderTableHeader("Type", "type")}
                  {renderTableHeader("Status", "status")}
                  {renderTableHeader("Fee Applied", "feeApplied")}
                  <th className="p-4">Details</th>
                  {renderTableHeader("Created At", "createdAt")}
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicationList.map((application: any) => (
                  <tr
                    key={application.id}
                    className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 border-b"
                  >
                    <td className="p-4 font-medium">
                      {application.data.fullName || "N/A"}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm">
                        {application.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={application.status.toUpperCase() || "PENDING"}
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-medium">
                        ৳{Number(application.feeApplied).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs truncate">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {application.data.passportNo &&
                            `Passport: ${application.data.passportNo}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(application.createdAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/applications/details/${application.id}`}
                          className="text-green-500 transition-colors hover:text-green-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {application.status.toUpperCase() === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(application.id, "APPROVED")
                              }
                              className="text-green-500 transition-colors hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(application.id, "REJECTED")
                              }
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
            total={total}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
