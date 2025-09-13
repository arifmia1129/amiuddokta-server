"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Hash,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  MapPin,
  Building,
  Eye,
  Edit,
  RefreshCw,
} from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";

interface BdrisApplicationDetails {
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
    center_name?: string;
    center_address?: string;
  };
}

// Application status configuration
const STATUS_CONFIG = {
  submitted: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    label: "Submitted", 
    icon: <Clock className="h-4 w-4" /> 
  },
  under_review: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    label: "Under Review", 
    icon: <Eye className="h-4 w-4" /> 
  },
  approved: { 
    color: "bg-green-100 text-green-800 border-green-200", 
    label: "Approved", 
    icon: <CheckCircle className="h-4 w-4" /> 
  },
  rejected: { 
    color: "bg-red-100 text-red-800 border-red-200", 
    label: "Rejected", 
    icon: <XCircle className="h-4 w-4" /> 
  },
  expired: { 
    color: "bg-gray-100 text-gray-800 border-gray-200", 
    label: "Expired", 
    icon: <AlertTriangle className="h-4 w-4" /> 
  },
};

// Application type configuration
const TYPE_CONFIG = {
  birth_registration: { label: "Birth Registration", color: "bg-green-50 text-green-700 border-green-200" },
  birth_correction: { label: "Birth Correction", color: "bg-orange-50 text-orange-700 border-orange-200" },
  death_registration: { label: "Death Registration", color: "bg-purple-50 text-purple-700 border-purple-200" },
  death_correction: { label: "Death Correction", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function BdrisApplicationDetails() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<BdrisApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRawHtml, setShowRawHtml] = useState(false);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bdris-applications/${params.id}?admin=true`);
      const data = await response.json();
      
      if (data.success) {
        setApplication(data.data);
      } else {
        toast.error("Failed to fetch application details");
      }
    } catch (error) {
      toast.error("Failed to fetch application details");
      console.error("Error fetching application details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchApplicationDetails();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    if (!application) return;

    try {
      const response = await fetch(`/api/bdris-applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplication(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Application marked as ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <Loader />
      </DefaultLayout>
    );
  }

  if (!application) {
    return (
      <DefaultLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
          <p className="text-gray-500 mb-4">The application you're looking for doesn't exist.</p>
          <Link
            href="/admin/bdris-applications"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Applications</span>
          </Link>
        </div>
      </DefaultLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status];
  const typeConfig = TYPE_CONFIG[application.applicationType];

  return (
    <DefaultLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/bdris-applications"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Applications</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {application.status === "submitted" && (
                <>
                  <button
                    onClick={() => handleStatusChange("approved")}
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              <button
                onClick={fetchApplicationDetails}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Hash className="h-5 w-5 text-gray-400" />
                    <h1 className="text-2xl font-bold text-gray-900">
                      {application.applicationId}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center space-x-1 border rounded-lg px-3 py-1 text-sm font-medium ${typeConfig.color}`}>
                      <FileText className="h-4 w-4" />
                      <span>{typeConfig.label}</span>
                    </span>
                    <span className={`inline-flex items-center space-x-1 border rounded-lg px-3 py-1 text-sm font-medium ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Submitted:</span>
                    <span className="text-gray-600">{formatDate(application.submittedAt)}</span>
                  </div>
                  {application.lastChecked && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Last Checked:</span>
                      <span className="text-gray-600">{formatDate(application.lastChecked)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="text-gray-600">{formatDate(application.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {application.additionalInfo && Object.keys(application.additionalInfo).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.additionalInfo.applicationType && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Application Type (Bengali)</label>
                      <p className="text-sm text-gray-900">{application.additionalInfo.applicationType}</p>
                    </div>
                  )}
                  {application.additionalInfo.officeName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned Office</label>
                      <p className="text-sm text-gray-900">{application.additionalInfo.officeName}</p>
                    </div>
                  )}
                  {application.additionalInfo.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-sm text-gray-900">{application.additionalInfo.phoneNumber}</p>
                    </div>
                  )}
                  {application.additionalInfo.submissionDeadline && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submission Deadline</label>
                      <p className="text-sm text-gray-900">{application.additionalInfo.submissionDeadline}</p>
                    </div>
                  )}
                  {application.additionalInfo.officeAddress && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Office Address</label>
                      <p className="text-sm text-gray-900">{application.additionalInfo.officeAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Data */}
            {application.formData && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(application.formData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Raw HTML Response */}
            {application.rawHtmlResponse && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">HTML Response</h3>
                  <button
                    onClick={() => setShowRawHtml(!showRawHtml)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showRawHtml ? "Hide" : "Show"} HTML
                  </button>
                </div>
                {showRawHtml && (
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {application.rawHtmlResponse}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{application.user?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{application.user?.phone || "N/A"}</p>
                  </div>
                </div>
                {application.user?.center_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Center</label>
                    <div className="flex items-start space-x-2">
                      <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{application.user.center_name}</p>
                        {application.user.center_address && (
                          <p className="text-xs text-gray-600">{application.user.center_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Print Link */}
            {application.printLink && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Link</h3>
                <div className="space-y-3">
                  <a
                    href={application.printLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-600 hover:text-green-800 font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Certificate</span>
                  </a>
                  {application.printLinkExpiry && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expires</label>
                      <p className="text-sm text-gray-900">{formatDate(application.printLinkExpiry)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Application ID</label>
                  <p className="text-gray-900 font-mono">{application.id}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900">{application.userId}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Response Extracted</label>
                  <p className="text-gray-900">
                    {application.responseExtracted ? (
                      <span className="text-green-600">✓ Yes</span>
                    ) : (
                      <span className="text-red-600">✗ No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}