"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { capitalizeFirstLetter } from "@/utils/functions";
import { getCurrentUser } from "../lib/actions/user/user.controller";
import { Mail, Phone, Calendar, Clock, UserCircle } from "lucide-react";
import Image from "next/image";
import constant from "@/constant";
import { GetCurrentUserResponse, User } from "@/types/user";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleGetUserInfo = async () => {
    try {
      setIsLoading(true);
      const response = (await getCurrentUser()) as GetCurrentUserResponse;
      if (response?.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (!dateString || isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl">
        <Breadcrumb pageName="Profile" />

        {user && (
          <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-boxdark">
            {/* Cover Image */}
            <div className="h-48 w-full bg-gradient-to-r from-primary/80 to-primary/40 dark:from-boxdark-2 dark:to-boxdark-2"></div>

            {/* Profile Content */}
            <div className="px-4 pb-8 sm:px-6 lg:px-8">
              {/* Profile Image and Name Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-end sm:space-x-6">
                <div className="bg-gray-100 relative -mt-24 flex h-36 w-36 items-center justify-center rounded-full border-4 border-white p-1 shadow-lg dark:border-boxdark-2 dark:bg-boxdark">
                  {user.profile_image ? (
                    <Image
                      src={
                        user?.profile_image
                          ? `${constant.baseUrl}/api/files?fileName=${user?.profile_image}`
                          : "/images/no_image.png"
                      }
                      alt={user?.name || "User"}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 flex h-full w-full items-center justify-center rounded-full dark:bg-boxdark-2">
                      <UserCircle size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center sm:mt-0 sm:text-left">
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {user.name}
                  </h2>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-lg font-medium text-primary dark:text-white sm:justify-start">
                    {capitalizeFirstLetter(
                      user.role === "super_admin" ? "Super Admin" : "Admin",
                    )}
                  </p>
                </div>
              </div>

              {/* User Information */}
              <div className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-6">
                {/* About Section */}
                <div className="bg-gray-50 col-span-2 rounded-lg p-6 dark:bg-boxdark-2">
                  <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    About Me
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {user.about || "No information provided"}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Contact Information
                  </h3>

                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-primary" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Email
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.contact && (
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-primary" />
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Phone
                        </p>
                        <p className="text-gray-700 dark:text-gray-200">
                          {user.contact}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Account Details
                  </h3>

                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-primary" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Member Since
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-primary" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Last Login
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        {formatDate(user.last_login)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-8 flex justify-center">
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    user.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {capitalizeFirstLetter(user.status)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Profile;
