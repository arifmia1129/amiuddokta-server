"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBdrisApplications, getBdrisApplicationErrors } from "@/app/lib/actions/bdris-applications/bdris-applications.service";
import Link from "next/link";
import {
  Search as SearchIcon,
  Eye,
  FileText,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Clock,
  RefreshCw,
} from "lucide-react";
import SimpleLayout from "@/components/Layouts/SimpleLayout";
import Pagination from "@/components/Share/Pagination";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";

interface BdrisApplication {
  id: string;
  userId: number;
  applicationId: string;
  applicationType: "birth_registration" | "birth_correction" | "death_registration" | "death_correction";
  submittedAt: string;
  user?: {
    name: string;
    phone: string;
  };
}

interface FailedApplication {
  id: string;
  userId: number;
  errorType: string;
  errorMessage: string;
  applicationType: "birth_registration" | "birth_correction" | "death_registration" | "death_correction";
  attemptedAt: string;
  user?: {
    name: string;
    phone: string;
  };
}

// Application type configuration
const TYPE_CONFIG = {
  birth_registration: { label: "Birth Registration", color: "bg-green-50 text-green-700 border-green-200" },
  birth_correction: { label: "Birth Correction", color: "bg-orange-50 text-orange-700 border-orange-200" },
  death_registration: { label: "Death Registration", color: "bg-purple-50 text-purple-700 border-purple-200" },
  death_correction: { label: "Death Correction", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function BdrisApplicationList() {
  const [applicationList, setApplicationList] = useState<BdrisApplication[]>([]);
  const [failedApplications, setFailedApplications] = useState<FailedApplication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [failedTotal, setFailedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");

  const handleGetData = async () => {
    setIsLoading(true);
    try {
      const [appsData, errorsData] = await Promise.all([
        getBdrisApplications({
          page: currentPage,
          limit,
          type: selectedType,
          isAdminContext: true
        }),
        getBdrisApplicationErrors()
      ]);
      
      setApplicationList(appsData.applications || []);
      setTotal(appsData.total || 0);
      setFailedApplications(errorsData || []);
      setFailedTotal(errorsData.length || 0);
    } catch (error) {
      toast.error("Failed to fetch applications");
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, selectedType]);

  const onSearch = async (searchText: string) => {
    setIsLoading(true);
    try {
      const data = await getBdrisApplications({
        page: 1,
        limit,
        search: searchText,
        isAdminContext: true
      });
      
      setApplicationList(data.applications);
      setTotal(data.total);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const statusCounts = {
    total: total,
    failed: failedTotal,
    successful: total, // All applications in main table are successful submissions
  };

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">BDRIS Applications</h1>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Submitted: <span className="font-medium">{statusCounts.total}</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Successful: <span className="font-medium">{statusCounts.successful}</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Failed: <span className="font-medium">{statusCounts.failed}</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/bdris-applications/errors"
                className="flex items-center space-x-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Failed Apps</span>
              </Link>
              <button
                onClick={handleGetData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Search onSearch={onSearch} placeholder="Search by application ID, name, or phone..." />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="p-12">
              <Loader />
            </div>
          ) : applicationList.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {applicationList.map((app) => {
                const typeConfig = TYPE_CONFIG[app.applicationType];
                
                return (
                  <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - Application Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm font-medium text-gray-900">{app.applicationId}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                            <FileText className="h-3 w-3 mr-1" />
                            {typeConfig.label}
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            <span>Submitted</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{app.user?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(app.submittedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/bdris-applications/details/${app.id}`}
                          className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">No BDRIS applications match your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
        )}
      </div>
    </SimpleLayout>
  );
}