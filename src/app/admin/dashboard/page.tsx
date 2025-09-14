/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Award,
  Calendar,
  Briefcase,
  Globe,
  FileText,
  BookOpen,
  ChevronRight,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SimpleLayout from "@/components/Layouts/SimpleLayout";

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: "Total Applications",
      value: "1,234",
      change: "+8%",
      icon: <FileText className="h-5 w-5 text-emerald-500" />,
    },
    {
      title: "Pending Applications",
      value: "45",
      change: "+12%",
      icon: <Clock className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "Approved Applications",
      value: "987",
      change: "+5%",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Registered Users",
      value: "856",
      change: "+15%",
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
  ];

  const recentApplications = [
    {
      id: "BDRIS-2025-001",
      name: "Mohammad Rahman",
      type: "Birth Certificate",
      nid: "1234567890123",
      status: "pending",
      date: "Sep 12, 2025",
    },
    {
      id: "BDRIS-2025-002",
      name: "Fatima Khatun",
      type: "Death Certificate",
      nid: "9876543210987",
      status: "approved",
      date: "Sep 11, 2025",
    },
    {
      id: "BDRIS-2025-003",
      name: "Abdul Karim",
      type: "Birth Certificate",
      nid: "5678901234567",
      status: "failed",
      date: "Sep 10, 2025",
    },
    {
      id: "BDRIS-2025-004",
      name: "Rashida Begum",
      type: "Death Certificate",
      nid: "3456789012345",
      status: "approved",
      date: "Sep 09, 2025",
    },
    {
      id: "BDRIS-2025-005",
      name: "Shahid Ahmed",
      type: "Birth Certificate",
      nid: "7890123456789",
      status: "pending",
      date: "Sep 09, 2025",
    },
  ];

  const announcements = [
    {
      title: "BDRIS API Update",
      description: "New birth certificate validation rules implemented",
      date: "Sep 12, 2025",
    },
    {
      title: "System maintenance",
      description:
        "Scheduled downtime on Sep 15, 2025 from 2:00 AM to 4:00 AM UTC",
      date: "Sep 11, 2025",
    },
    {
      title: "Monthly report reminder",
      description: "Please review and process pending applications by Sep 20",
      date: "Sep 10, 2025",
    },
  ];

  const tasks = [
    { title: "Review pending BDRIS applications", priority: "high", count: 45 },
    { title: "Process failed applications", priority: "high", count: 12 },
    { title: "Update user profiles", priority: "medium", count: 8 },
    { title: "Generate monthly report", priority: "low", count: 1 },
  ];

  return (
    <SimpleLayout>
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Welcome header section */}
        <div className="border-b border-slate-200 bg-white px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center space-x-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-slate-500">
                    Dashboard / Welcome
                  </p>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">
                  BDRIS Admin Dashboard
                </h1>
                <p className="mt-1 text-slate-500">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  |
                  {" " +
                    currentTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-800">
                        {stat.value}
                      </h3>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium">
                    <span className="flex items-center text-emerald-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {stat.change}
                    </span>
                    <span className="ml-2 text-slate-500">vs. last month</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Recent applications */}
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-800">
                        Recent Applications
                      </h2>
                      <Link
                        href="/admin/bdris-applications"
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {recentApplications.map((app, index) => (
                      <div
                        key={index}
                        className="p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-700">
                              {app.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-slate-800">
                                  {app.name}
                                </p>
                                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                  {app.id}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500">
                                {app.type} • NID: {app.nid}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="hidden text-right md:block">
                              <p className="text-xs text-slate-500">
                                Submitted
                              </p>
                              <p className="text-sm text-slate-700">
                                {app.date}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                app.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </span>
                            <button className="rounded p-1 hover:bg-slate-200">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                    <Link
                      href="/admin/bdris-applications"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      See all BDRIS applications
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Tasks */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h2 className="text-lg font-bold text-slate-800">
                      Tasks & Priorities
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {tasks.map((task, index) => (
                      <div
                        key={index}
                        className="p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            ></span>
                            <p className="font-medium text-slate-700">
                              {task.title}
                            </p>
                          </div>
                          <div className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {task.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 p-4">
                    <button className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      Add New Task
                    </button>
                  </div>
                </div>

                {/* Announcements */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h2 className="text-lg font-bold text-slate-800">
                      Announcements
                    </h2>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {announcements.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 transition-colors hover:bg-slate-50"
                      >
                        <h3 className="font-medium text-slate-800">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {item.date}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                    <Link
                      href="/admin/announcements"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View all announcements
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick access section */}
            <div className="mt-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-800">
                  Quick Access
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {[
                    {
                      title: "Users",
                      icon: <Users className="h-5 w-5" />,
                      href: "/admin/users",
                      count: "856",
                    },
                    {
                      title: "BDRIS Applications",
                      icon: <FileText className="h-5 w-5" />,
                      href: "/admin/bdris-applications",
                      count: "1,234",
                    },
                    {
                      title: "Pending Reviews",
                      icon: <Clock className="h-5 w-5" />,
                      href: "/admin/bdris-applications?status=pending",
                      count: "45",
                    },
                    {
                      title: "Failed Applications",
                      icon: <AlertCircle className="h-5 w-5" />,
                      href: "/admin/bdris-applications?status=failed",
                      count: "12",
                    },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <div className="text-blue-600">{item.icon}</div>
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {item.title}
                      </span>
                      {item.count && (
                        <span className="mt-1 text-xs text-slate-500">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Service stats section */}
            <div className="mt-6">
              <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 shadow-lg md:p-8">
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">
                      BDRIS Management System
                    </h2>
                    <p className="mb-6 text-blue-100">
                      Streamline birth and death certificate processing with our
                      comprehensive BDRIS integration. Monitor applications,
                      manage users, and ensure efficient service delivery.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {stats.slice(0, 2).map((stat, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
                        >
                          <p className="text-sm text-blue-100">{stat.title}</p>
                          <p className="text-2xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">
                          Success Rate
                        </p>
                        <p className="text-2xl font-bold text-white">94%</p>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-sm text-blue-100">Processing Time</p>
                        <p className="text-2xl font-bold text-white">2.5d</p>
                      </div>
                    </div>
                    <div className="relative flex h-full items-center justify-center">
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                          <Image
                            src="/logo.png"
                            alt="Go Network Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Dashboard;
