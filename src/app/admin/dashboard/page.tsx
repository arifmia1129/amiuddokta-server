/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader,
} from "lucide-react";
import Link from "next/link";
import SimpleLayout from "@/components/Layouts/SimpleLayout";
import { getDashboardStatsController } from "@/app/lib/actions/dashboard/dashboard.controller";
import type { DashboardStats } from "@/app/lib/actions/dashboard/dashboard.service";

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await getDashboardStatsController();
        
        if (response.success) {
          setDashboardData(response.data);
          setError(null);
        } else {
          setError(response.message || "Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  // Helper function to get application type display name
  const getApplicationTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      birth_registration: "Birth Certificate",
      death_registration: "Death Certificate", 
      birth_correction: "Birth Correction",
      death_correction: "Death Correction",
    };
    return typeMap[type] || type;
  };

  // Generate stats array from real data
  const stats = dashboardData ? [
    {
      title: "Total Applications",
      value: formatNumber(dashboardData.totalApplications),
      change: dashboardData.monthlyStats.length > 1 ? 
        `${Math.round(((dashboardData.monthlyStats[dashboardData.monthlyStats.length - 1]?.applications || 0) - 
        (dashboardData.monthlyStats[dashboardData.monthlyStats.length - 2]?.applications || 0)) / 
        Math.max(dashboardData.monthlyStats[dashboardData.monthlyStats.length - 2]?.applications || 1, 1) * 100)}%` : "0%",
      icon: <FileText className="h-5 w-5 text-emerald-500" />,
    },
    {
      title: "Failed Applications",
      value: formatNumber(dashboardData.failedApplications),
      change: dashboardData.errorStats.unresolved > 0 ? 
        `${dashboardData.errorStats.unresolved} unresolved` : "All resolved",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Successful Applications",
      value: formatNumber(dashboardData.approvedApplications),
      change: `${Math.round((dashboardData.approvedApplications / Math.max(dashboardData.totalApplications, 1)) * 100)}% success rate`,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Registered Users",
      value: formatNumber(dashboardData.registeredUsers),
      change: `${formatNumber(dashboardData.activeUsers)} active`,
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
  ] : [];

  // Generate recent applications from real data
  const recentApplications = dashboardData?.recentApplications?.map((app) => ({
    id: app.applicationId,
    name: app.userName,
    type: getApplicationTypeDisplay(app.applicationType),
    nid: app.userPhone || "N/A", // Using phone instead of NID as we don't store NID
    status: "submitted", // All applications in our system are submitted
    date: new Date(app.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    additionalInfo: app.additionalInfo,
  })) || [];


  // Loading state
  if (isLoading) {
    return (
      <SimpleLayout>
        <div className="flex min-h-screen flex-col bg-slate-50 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <SimpleLayout>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-6 py-8">
            <div className="mx-auto max-w-7xl">
              <h1 className="text-2xl font-bold text-slate-800">
                Quick Apply Dashboard
              </h1>
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">BDRIS Application Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">{stat.icon}</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Applications</h2>
              <Link href="/admin/bdris-applications" className="text-sm text-blue-600 hover:text-blue-700">
                View all <ChevronRight className="inline h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {recentApplications.slice(0, 5).map((app, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-600">{app.type} • {app.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Submitted</span>
                    <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SimpleLayout>
  );
};

export default Dashboard;