"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBdrisApplicationErrors } from "@/app/lib/actions/bdris-applications/bdris-applications.service";
import Link from "next/link";
import {
  AlertTriangle,
  Eye,
  FileText,
  ArrowLeft,
  RefreshCw,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import SimpleLayout from "@/components/Layouts/SimpleLayout";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";

interface FailedApplication {
  id: string;
  userId: number;
  errorType: string;
  errorMessage: string;
  applicationType: "birth_registration" | "birth_correction" | "death_registration" | "death_correction";
  attemptedAt: string;
  formData?: any;
  user?: {
    name: string;
    phone: string;
  };
}

export default function FailedApplications() {
  const [applications, setApplications] = useState<FailedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState<string | null>(null);

  const fetchFailedApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getBdrisApplicationErrors();
      setApplications(data || []);
    } catch (error) {
      toast.error("Failed to fetch failed applications");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFailedApplications();
  }, []);

  const HtmlPreviewModal = ({ htmlContent, onClose }: { htmlContent: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Data Preview</h3>
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

  if (isLoading) {
    return (
      <SimpleLayout>
        <Loader />
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/bdris-applications"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Applications</span>
            </Link>
          </div>
          <button
            onClick={fetchFailedApplications}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Failed Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Failed Applications</h1>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {applications.length} applications
              </span>
            </div>
            <p className="text-gray-600 mt-2">Applications that failed during BDRIS processing</p>
          </div>

          <div className="divide-y divide-gray-200">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm font-medium">Error #{app.id}</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          {app.errorType}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm text-red-600 font-medium mb-1">Error Message:</div>
                        <div className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                          {app.errorMessage}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{app.user?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{app.applicationType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(app.attemptedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {app.formData && (
                        <button
                          onClick={() => setShowHtmlPreview(JSON.stringify(app.formData, null, 2))}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Form Data</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Applications</h3>
                <p className="text-gray-500">All applications are processing successfully.</p>
              </div>
            )}
          </div>
        </div>

        {/* HTML Preview Modal */}
        {showHtmlPreview && (
          <HtmlPreviewModal
            htmlContent={showHtmlPreview}
            onClose={() => setShowHtmlPreview(null)}
          />
        )}
      </div>
    </SimpleLayout>
  );
}