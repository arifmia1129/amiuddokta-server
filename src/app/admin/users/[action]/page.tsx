"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { getSessionController } from "@/app/lib/actions/auth/auth.controller";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProfileImageUploader from "@/components/Editor/ProfileImageUploader";

import {
  User,
  Phone,
  Lock,
  Users,
  AlertCircle,
  Info,
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  BadgeCheck,
  ImagePlus,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createUser,
  getUserById,
  updateUser,
} from "@/app/lib/actions/user/user.controller";

function UserAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingUserInfo, setExistingUserInfo] = useState(null);
  const [imageUrl, setImageUrl] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleGetUserInfo = async () => {
    const user = await getSessionController();
    if (user?.id) {
      const res = await getUserById(user?.id);
      if (res?.success) setUser(res.data[0]);
    }
  };

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (params.action === "edit" && id) {
      setIsEdit(true);
    }
  }, [params.action, id]);

  const {
    register,
    watch,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = useForm({ mode: "onChange" });

  const router = useRouter();
  const role = watch("role");

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getUserById({ id: id ? id : 0 });
      if (data) {
        setExistingUserInfo(data);
        setImageUrl(data?.profile_image);
        reset(data);
      } else {
        toast.error("User not found");
        router.push("/admin/users");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingUserInfo) {
      handleRetrieveData();
    }
  }, [id, existingUserInfo]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;
      data.profile_image = imageUrl;

      if (id && existingUserInfo) {
        delete data.pin;
        res = await updateUser({
          id: id,
          data,
        });
      } else {
        res = await createUser(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/users");
        if (id && existingUserInfo) await handleRetrieveData();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: "super_admin",
      label: "Super Admin",
      icon: <Shield size={16} className="mr-2" />,
    },
    {
      value: "admin",
      label: "Admin",
      icon: <BadgeCheck size={16} className="mr-2" />,
    },
    {
      value: "entrepreneur",
      label: "Entrepreneur",
      icon: <User size={16} className="mr-2" />,
    },
  ];

  const statusOptions = [
    { value: "active", label: "Active", color: "text-green-500" },
    { value: "inactive", label: "Inactive", color: "text-gray-500" },
    { value: "suspended", label: "Suspended", color: "text-red-500" },
  ];

  if (isLoading && id) {
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center rounded-lg bg-white p-8 shadow-lg dark:bg-black">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
            <p className="text-gray-600 mt-4">Loading user data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl dark:bg-black">
        <div className="mb-4">
          <button
            onClick={() => router.push("/admin/users")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Users
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit User
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  User
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit ? "Update user information" : "Create a new user account"}
            </p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <ProfileImageUploader
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      User Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the user account.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Full Name"
                  error={(errors as any).name?.message}
                  icon={<User size={16} />}
                >
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter user's full name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  error={(errors as any).phone?.message}
                  icon={<Phone size={16} />}
                >
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^01[3-9]\d{8}$/,
                        message: "Invalid phone number",
                      },
                    })}
                    placeholder="Enter user's phone number"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                {!isEdit && (
                  <FormField
                    label="PIN"
                    error={(errors as any).pin?.message}
                    icon={<Lock size={16} />}
                  >
                    <input
                      {...register("pin", {
                        required: "PIN is required",
                        minLength: {
                          value: 4,
                          message: "PIN must be at least 4 digits",
                        },
                        maxLength: {
                          value: 5,
                          message: "PIN must be at most 5 digits",
                        },
                      })}
                      placeholder="Enter user's PIN"
                      className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                      type="password"
                    />
                  </FormField>
                )}

                <FormField
                  label="Role"
                  error={(errors as any).role?.message}
                  icon={<Shield size={16} />}
                >
                  <select
                    {...register("role", { required: "Role is required" })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-gray-500 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).status?.message}
                  icon={<BadgeCheck size={16} />}
                >
                  <select
                    {...register("status", { required: "Status is required" })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                        className={status.color}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-gray-500 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </FormField>
              </div>

              <FormField
                label="About"
                error={(errors as any).about?.message}
                icon={<Info size={16} />}
              >
                <textarea
                  {...register("about")}
                  placeholder="Write about the user"
                  rows={4}
                  className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                />
              </FormField>

              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/users")}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center rounded-md border px-5 py-2.5 font-medium transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {isEdit ? "Update User" : "Create User"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default UserAction;
