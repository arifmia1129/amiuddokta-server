"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import {
  Search as SearchIcon,
  Eye,
  FileText,
  ChevronDown,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Clock,
  Download,
  MoreHorizontal,
  Trash2,
  Archive,
} from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Pagination from "@/components/Share/Pagination";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";

interface BdrisApplication {
  id: string;
  userId: number;
  applicationId: string;
  applicationType: "birth_registration" | "birth_correction" | "death_registration" | "death_correction";
  printLink?: string;
  printLinkExpiry?: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "expired";
  additionalInfo?: {
    applicationType?: string;
    officeName?: string;
    phoneNumber?: string;
    submissionDeadline?: string;
    officeAddress?: string;
    assignedOffice?: string;
    documentSubmissionRequired?: boolean;
  };
  formData?: any;
  rawHtmlResponse?: string;
  responseExtracted: boolean;
  submittedAt: string;
  lastChecked?: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    phone: string;
  };
}

// Application status configuration
const STATUS_CONFIG = {
  submitted: { color: "bg-blue-100 text-blue-800", label: "Submitted", icon: <Clock className="h-4 w-4" /> },
  under_review: { color: "bg-yellow-100 text-yellow-800", label: "Under Review", icon: <Eye className="h-4 w-4" /> },
  approved: { color: "bg-green-100 text-green-800", label: "Approved", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { color: "bg-red-100 text-red-800", label: "Rejected", icon: <XCircle className="h-4 w-4" /> },
  expired: { color: "bg-gray-100 text-gray-800", label: "Expired", icon: <AlertTriangle className="h-4 w-4" /> },
};

// Application type configuration
const TYPE_CONFIG = {
  birth_registration: { label: "Birth Registration", color: "bg-green-50 text-green-700" },
  birth_correction: { label: "Birth Correction", color: "bg-orange-50 text-orange-700" },
  death_registration: { label: "Death Registration", color: "bg-purple-50 text-purple-700" },
  death_correction: { label: "Death Correction", color: "bg-red-50 text-red-700" },
};

export default function BdrisApplicationList() {
  const [applicationList, setApplicationList] = useState<BdrisApplication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showHtmlPreview, setShowHtmlPreview] = useState<string | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort: sortField,
        order: sortOrder,
        ...(selectedStatus !== "ALL" && { status: selectedStatus }),
        ...(selectedType !== "ALL" && { type: selectedType }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      });

      const response = await fetch(`/api/bdris-applications?admin=true&${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setApplicationList(data.data.applications);
        setTotal(data.data.total);
      } else {
        toast.error("Failed to fetch applications");
      }
    } catch (error) {
      toast.error("Failed to fetch applications");
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, sortField, sortOrder, selectedStatus, selectedType, dateRange]);

  const onSearch = async (searchText: string) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        limit: limit.toString(),
        search: searchText,
      });

      const response = await fetch(`/api/bdris-applications?admin=true&${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setApplicationList(data.data.applications);
        setTotal(data.data.total);
        setCurrentPage(1);
      } else {
        toast.error("Search failed");
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "approved" | "rejected") => {
    confirmAlert({
      title: `Mark Application as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `Are you sure you want to mark this application as ${newStatus}?`,
      buttons: [
        {
          label: "Yes",
          className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
          onClick: async () => {
            try {
              const response = await fetch(`/api/bdris-applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
              });

              if (response.ok) {
                handleGetData();
                toast.success(`Application marked as ${newStatus}`);
              } else {
                toast.error("Failed to update status");
              }
            } catch (error) {
              toast.error("Failed to update status");
            }
          },
        },
        {
          label: "No",
          className: "bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 ml-2",
        },
      ],
    });
  };

  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applicationList.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applicationList.map(app => app.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) {
      toast.error("Please select applications to perform bulk action");
      return;
    }

    const actionText = action === "approve" ? "approve" : action === "reject" ? "reject" : "delete";
    
    confirmAlert({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `Are you sure you want to ${actionText} ${selectedApplications.length} selected applications?`,
      buttons: [
        {
          label: "Yes",
          className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
          onClick: async () => {
            try {
              const promises = selectedApplications.map(id => {
                if (action === "delete") {
                  return fetch(`/api/bdris-applications/${id}`, {
                    method: "DELETE",
                  });
                } else {
                  return fetch(`/api/bdris-applications/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
                  });
                }
              });

              await Promise.all(promises);
              setSelectedApplications([]);
              setShowBulkActions(false);
              handleGetData();
              toast.success(`Successfully ${actionText}d ${selectedApplications.length} applications`);
            } catch (error) {
              toast.error(`Failed to ${actionText} applications`);
            }
          },
        },
        {
          label: "No",
          className: "bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 ml-2",
        },
      ],
    });
  };

  const exportApplications = () => {
    const csvContent = [
      ["Application ID", "User Name", "Phone", "Type", "Status", "Submitted At", "Print Link"].join(","),
      ...applicationList.map(app => [
        app.applicationId,
        app.user?.name || "",
        app.user?.phone || "",
        app.applicationType.replace(/_/g, " "),
        app.status,
        formatDate(app.submittedAt),
        app.printLink || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bdris_applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Applications exported successfully");
  };

  const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => {
    const config = STATUS_CONFIG[status];
    return (
      <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const TypeBadge = ({ type }: { type: keyof typeof TYPE_CONFIG }) => {
    const config = TYPE_CONFIG[type];
    return (
      <span className={`rounded-lg px-2 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderTableHeader = (label: string, field: string) => (
    <th
      className="hover:bg-gray-200 cursor-pointer p-4 transition-colors dark:hover:bg-meta-4 text-left"
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
        <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            sortField === field && sortOrder === "desc" ? "rotate-180 transform" : ""
          }`}
        />
      </div>
    </th>
  );

  const HtmlPreviewModal = ({ htmlContent, onClose }: { htmlContent: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">HTML Response Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[70vh]">
          <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {htmlContent}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h4 className="text-xl font-semibold">BDRIS Applications</h4>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {total} Total
            </span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
            {/* Bulk Actions */}
            {selectedApplications.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-blue-700">
                  {selectedApplications.length} selected
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span>Actions</span>
                  </button>
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleBulkAction("approve")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Approve Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction("reject")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Reject Selected
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleBulkAction("delete")}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                className="form-select border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              className="form-select border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                className="form-input border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="form-input border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={exportApplications}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <Search onSearch={onSearch} />
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="border-gray-200 dark:border-gray-700 overflow-x-auto rounded-lg border">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-left dark:bg-meta-4">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === applicationList.length && applicationList.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {renderTableHeader("Application ID", "applicationId")}
                  {renderTableHeader("User", "userId")}
                  {renderTableHeader("Type", "applicationType")}
                  {renderTableHeader("Status", "status")}
                  <th className="p-4 text-left">
                    <span className="text-sm font-semibold uppercase tracking-wider">Print Link</span>
                  </th>
                  {renderTableHeader("Submitted", "submittedAt")}
                  <th className="p-4 text-left">
                    <span className="text-sm font-semibold uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applicationList.map((application) => (
                  <tr
                    key={application.id}
                    className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 border-b"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-semibold text-blue-600">
                          {application.applicationId}
                        </span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{application.user?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{application.user?.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <TypeBadge type={application.applicationType} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={application.status} />
                    </td>

                    <td className="p-4">
                      {application.printLink ? (
                        <div className="flex items-center space-x-2">
                          <a
                            href={application.printLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="text-sm">View</span>
                          </a>
                          {application.printLinkExpiry && (
                            <div className="text-xs text-gray-500">
                              Expires: {formatDate(application.printLinkExpiry)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(application.submittedAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/bdris-applications/details/${application.id}`}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {application.rawHtmlResponse && (
                          <button
                            onClick={() => setShowHtmlPreview(application.rawHtmlResponse!)}
                            className="text-purple-500 hover:text-purple-700 transition-colors"
                            title="View HTML Response"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}

                        {application.status === "submitted" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, "approved")}
                              className="text-green-500 hover:text-green-700 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, "rejected")}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Reject"
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

        {applicationList.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">No BDRIS applications match your current filters.</p>
          </div>
        )}

        <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * limit + 1, total)} to {Math.min(currentPage * limit, total)} of {total} applications
          </div>
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
            total={total}
          />
        </div>
      </div>

      {/* HTML Preview Modal */}
      {showHtmlPreview && (
        <HtmlPreviewModal
          htmlContent={showHtmlPreview}
          onClose={() => setShowHtmlPreview(null)}
        />
      )}
    </DefaultLayout>
  );
}