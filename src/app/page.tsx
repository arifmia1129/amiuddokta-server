"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import sendEmail from "./lib/utils/sendMailer";

// This would typically come from your API or state management
const dashboardData = {
  totalApplications: 150,
  verifiedToday: 45,
  pendingRecharges: 12,
  totalAgents: 78,
  recentApplications: [
    { id: 1, name: "John Doe", type: "type1", status: "approved" },
    { id: 2, name: "Jane Smith", type: "type2", status: "pending" },
    { id: 3, name: "Alice Johnson", type: "type3", status: "rejected" },
  ],
};

function WelcomeDashboard() {
  const handleSendEmail = async () => {
    const res = await sendEmail("arif.vtti@gmail.com", "Hello", "checking");
    console.log(res);
  };

  useEffect(() => {
    // handleSendEmail();
  }, []);
  return (
    <DefaultLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        <h1 className="text-gray-800 mb-6 text-3xl font-bold">
          Welcome to Admin Dashboard
        </h1>

        {/* <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Applications"
            value={dashboardData.totalApplications}
            icon={<FileCheck className="h-8 w-8 text-blue-500" />}
          />
          <DashboardCard
            title="Verified Today"
            value={dashboardData.verifiedToday}
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          />
          <DashboardCard
            title="Pending Recharges"
            value={dashboardData.pendingRecharges}
            icon={<CreditCard className="h-8 w-8 text-yellow-500" />}
          />
          <DashboardCard
            title="Total Agents"
            value={dashboardData.totalAgents}
            icon={<Users className="h-8 w-8 text-purple-500" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center text-xl font-semibold">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Recent Applications
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentApplications.map((app) => (
                    <tr key={app.id} className="border-b">
                      <td className="px-4 py-2">{app.name}</td>
                      <td className="px-4 py-2">{app.type}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center text-xl font-semibold">
              <Settings className="text-gray-500 mr-2 h-5 w-5" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <button className="w-full rounded bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600">
                Verify Applications
              </button>
              <button className="w-full rounded bg-green-500 px-4 py-2 text-white transition duration-300 hover:bg-green-600">
                Process Recharges
              </button>
              <button className="w-full rounded bg-purple-500 px-4 py-2 text-white transition duration-300 hover:bg-purple-600">
                Manage Agents
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </DefaultLayout>
  );
}

function DashboardCard({ title, value, icon }: any) {
  return (
    <div className="flex items-center rounded-lg bg-white p-6 shadow-md">
      <div className="mr-4">{icon}</div>
      <div>
        <h3 className="text-gray-800 text-lg font-semibold">{title}</h3>
        <p className="text-gray-900 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    approved: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="mr-1 h-4 w-4" />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertCircle className="mr-1 h-4 w-4" />,
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="mr-1 h-4 w-4" />,
    },
  };

  const { color, icon } = (statusConfig as any)[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default WelcomeDashboard;
