"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { getBdrisApplicationById } from "@/app/lib/actions/bdris-applications/bdris-applications.service";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Hash,
  FileText,
  CheckCircle,
  Phone,
  Building,
  RefreshCw,
} from "lucide-react";
import SimpleLayout from "@/components/Layouts/SimpleLayout";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";

interface BdrisApplicationDetails {
  id: string;
  userId: number;
  applicationId: string;
  applicationType:
    | "birth_registration"
    | "birth_correction"
    | "death_registration"
    | "death_correction";
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

// Application type configuration
const TYPE_CONFIG = {
  birth_registration: {
    label: "Birth Registration",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  birth_correction: {
    label: "Birth Correction",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  death_registration: {
    label: "Death Registration",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  death_correction: {
    label: "Death Correction",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function BdrisApplicationDetails() {
  const params = useParams();
  const [application, setApplication] =
    useState<BdrisApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getBdrisApplicationById(params.id as string);
      setApplication(data);
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

  if (isLoading) {
    return (
      <SimpleLayout>
        <Loader />
      </SimpleLayout>
    );
  }

  if (!application) {
    return (
      <SimpleLayout>
        <div className="py-12 text-center">
          <FileText className="text-gray-400 mx-auto mb-4 h-12 w-12" />
          <h3 className="text-gray-900 mb-2 text-lg font-medium">
            Application not found
          </h3>
          <p className="text-gray-500 mb-4">
            The application you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/bdris-applications"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Applications</span>
          </Link>
        </div>
      </SimpleLayout>
    );
  }

  const typeConfig = TYPE_CONFIG[application.applicationType];

  return (
    <SimpleLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/bdris-applications"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Applications</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchApplicationDetails}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Application Overview */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center space-x-3">
                    <Hash className="text-gray-400 h-5 w-5" />
                    <h1 className="text-gray-900 text-2xl font-bold">
                      {application.applicationId}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center space-x-1 rounded-lg border px-3 py-1 text-sm font-medium ${typeConfig.color}`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>{typeConfig.label}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 rounded-lg border border-green-200 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>Submitted</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-gray-900 mb-4 text-lg font-semibold">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Submitted:</span>
                    <span className="text-gray-600">
                      {formatDate(application.submittedAt)}
                    </span>
                  </div>
                  {application.lastChecked && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">Last Checked:</span>
                      <span className="text-gray-600">
                        {formatDate(application.lastChecked)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="bg-gray-400 h-2 w-2 rounded-full"></div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="text-gray-600">
                      {formatDate(application.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {application.additionalInfo &&
              Object.keys(application.additionalInfo).length > 0 && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="text-gray-900 mb-4 text-lg font-semibold">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {application.additionalInfo.applicationType && (
                      <div>
                        <label className="text-gray-500 text-sm font-medium">
                          Application Type (Bengali)
                        </label>
                        <p className="text-gray-900 text-sm">
                          {application.additionalInfo.applicationType}
                        </p>
                      </div>
                    )}
                    {application.additionalInfo.officeName && (
                      <div>
                        <label className="text-gray-500 text-sm font-medium">
                          Assigned Office
                        </label>
                        <p className="text-gray-900 text-sm">
                          {application.additionalInfo.officeName}
                        </p>
                      </div>
                    )}
                    {application.additionalInfo.phoneNumber && (
                      <div>
                        <label className="text-gray-500 text-sm font-medium">
                          Contact Number
                        </label>
                        <p className="text-gray-900 text-sm">
                          {application.additionalInfo.phoneNumber}
                        </p>
                      </div>
                    )}
                    {application.additionalInfo.submissionDeadline && (
                      <div>
                        <label className="text-gray-500 text-sm font-medium">
                          Submission Deadline
                        </label>
                        <p className="text-gray-900 text-sm">
                          {application.additionalInfo.submissionDeadline}
                        </p>
                      </div>
                    )}
                    {application.additionalInfo.officeAddress && (
                      <div className="md:col-span-2">
                        <label className="text-gray-500 text-sm font-medium">
                          Office Address
                        </label>
                        <p className="text-gray-900 text-sm">
                          {application.additionalInfo.officeAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Form Data */}
            {application.formData && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="text-gray-900 mb-4 text-lg font-semibold">
                  Form Data
                </h3>
                <div className="bg-gray-50 max-h-96 overflow-auto rounded-lg p-4">
                  <pre className="text-gray-700 whitespace-pre-wrap text-sm">
                    {JSON.stringify(application.formData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4 flex items-center space-x-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-500 text-sm font-medium">
                    Name
                  </label>
                  <p className="text-gray-900 text-sm">
                    {application.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm font-medium">
                    Phone
                  </label>
                  <div className="flex items-center space-x-2">
                    <Phone className="text-gray-400 h-4 w-4" />
                    <p className="text-gray-900 text-sm">
                      {application.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                {application.user?.center_name && (
                  <div>
                    <label className="text-gray-500 text-sm font-medium">
                      Center
                    </label>
                    <div className="flex items-start space-x-2">
                      <Building className="text-gray-400 mt-0.5 h-4 w-4" />
                      <div>
                        <p className="text-gray-900 text-sm">
                          {application.user.center_name}
                        </p>
                        {application.user.center_address && (
                          <p className="text-gray-600 text-xs">
                            {application.user.center_address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Technical Details */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-gray-900 mb-4 text-lg font-semibold">
                Technical Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-500 font-medium">
                    Application ID
                  </label>
                  <p className="text-gray-900 font-mono">{application.id}</p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">User ID</label>
                  <p className="text-gray-900">{application.userId}</p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">
                    Response Extracted
                  </label>
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
    </SimpleLayout>
  );
}
