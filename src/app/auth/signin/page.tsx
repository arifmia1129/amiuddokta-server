/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { handleSetProjectName } from "@/utils/functions";
import { login } from "@/app/lib/actions/user/user.controller";
import {
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  Loader,
  AlertCircle,
} from "lucide-react";

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { global } = useSelector((state: any) => state.setting);
  const dispatch = useDispatch();

  useEffect(() => {
    handleSetProjectName(dispatch);
  }, [dispatch]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await login(data);
      if (res?.success) {
        toast.success("Successfully logged in");
        router.push("/admin/dashboard");
      } else {
        toast.error(res?.message || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="to-gray-200 flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl md:grid-cols-5">
        {/* Left side - Admin Dashboard Illustration */}
        <div className="relative hidden bg-slate-800 md:col-span-2 md:block">
          <div className="absolute inset-0 bg-slate-800 opacity-90"></div>
          <div className="relative z-10 flex h-full flex-col p-8">
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  height={40}
                  width={40}
                  className="mb-1"
                />
                <h2 className="text-xl font-bold text-white">Go Network</h2>
              </div>
              <div className="mt-2 h-1 w-12 rounded bg-blue-500"></div>
            </div>

            <div className="flex flex-grow flex-col justify-center">
              <div className="mb-6">
                <ShieldCheck size={40} className="mb-4 text-blue-400" />
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Admin Dashboard
                </h3>
                <p className="text-sm text-slate-300">
                  Secure management portal for Go Network administrators
                </p>
              </div>

              <Image
                src="https://img.freepik.com/free-vector/illustration-social-media-concept_53876-18383.jpg"
                alt="Admin Dashboard Illustration"
                width={400}
                height={280}
                className="rounded-lg object-cover"
              />
            </div>

            <div className="mt-8 border-t border-slate-700/50 pt-6">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Go Network. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Admin Login Form */}
        <div className="flex flex-col justify-center p-6 md:col-span-3 md:p-10">
          <div className="mb-6 flex justify-center md:hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              height={60}
              width={60}
              className="mb-2"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Administrator Access
            </h2>
            <p className="mb-8 text-slate-500">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@gonetwork.com"
                  {...register("email", {
                    required: "Email Address is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 pl-10 shadow-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              {errors.email && (
                <div className="text-red-600 mt-1.5 flex items-center text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  <span>{errors.email.message as string}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Admin Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 pl-10 shadow-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              {errors.password && (
                <div className="text-red-600 mt-1.5 flex items-center text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  <span>{errors.password.message as string}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-600"
              >
                Keep me signed in
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="mr-2" />
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-center md:justify-start">
              <ShieldCheck size={16} className="mr-2 text-slate-400" />
              <p className="text-xs text-slate-500">
                This is a secure admin-only access point. Unauthorized access
                attempts are monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
