"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  User,
  Mail,
  Users,
  Info,
  ArrowLeft,
  Save,
  Loader2,
  BadgeCheck,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createServiceCategory,
  getServiceCategoryById,
  updateServiceCategory,
} from "@/app/lib/actions/serviceCategory/serviceCategory.controller";
import { getCurrentUser } from "@/app/lib/actions/user/user.controller";
import ImageUploader from "@/components/Editor/ImageUploader";
import SEOForm from "@/components/Share/SEOForm";
import Slugify from "react-slugify";

function ServiceCategoryAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingCategoryInfo, setExistingCategoryInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [iconUrl, setIconUrl] = useState(""); // New state for icon URL

  const handleGetCategoryInfo = async () => {
    const { data: user } = await getCurrentUser();
    if (user?.id) {
      const res = await getServiceCategoryById(user?.id);
      if (res?.success) setExistingCategoryInfo(res.data);
    }
  };

  useEffect(() => {
    handleGetCategoryInfo();
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
    setValue, // Add setValue to update form values programmatically
    getValues,
  } = useForm({ mode: "onChange" });

  const router = useRouter();

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getServiceCategoryById({ id: id ? id : 0 });
      if (data) {
        setExistingCategoryInfo(data);
        // Set the icon URL for the ImageUploader
        if (data.icon) {
          setIconUrl(data.icon);
        }
        data.schema_markup = data.schema_markup
          ? JSON.stringify(data.schema_markup)
          : null;
        reset(data);
        if (data.is_active) {
          setValue("is_active", 1);
        }
      } else {
        toast.error("Service category not found");
        router.push("/admin/services/categories");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load service category data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingCategoryInfo) {
      handleRetrieveData();
    }
  }, [id, existingCategoryInfo]);

  // Handle icon upload success
  const handleIconUploadSuccess = (url: string) => {
    setValue("icon", url); // Update the form value when icon is uploaded
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;

      if (id && existingCategoryInfo) {
        res = await updateServiceCategory({
          id: id,
          data,
        });
      } else {
        res = await createServiceCategory(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/services/categories");
        if (id && existingCategoryInfo) await handleRetrieveData();
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

  if (isLoading && id) {
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center rounded-lg bg-white p-8 shadow-lg dark:bg-black">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
            <p className="text-gray-600 mt-4">
              Loading service category data...
            </p>
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
            onClick={() => router.push("/admin/service-categories")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Service Categories
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit Service
                  Category
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  Service Category
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit
                ? "Update service category information"
                : "Create a new service category"}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Service Category Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the service
                      category.
                    </div>
                  </div>
                </div>
              </div>
              {/* Replace the original icon input with the new ImageUploader */}
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Icon
                </label>
                <ImageUploader
                  imageUrl={iconUrl}
                  setImageUrl={setIconUrl}
                  onUploadSuccess={handleIconUploadSuccess}
                  title=""
                  description="Recommended: Square image, max 1MB (JPG, PNG)"
                  maxSize={1}
                  previewSize="sm"
                  aspectRatio="1:1"
                  rounded={true}
                  className="mb-2"
                />
                {(errors as any).icon?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).icon?.message}
                  </p>
                )}

                {/* Keep a hidden input for form submission */}
                <input type="hidden" {...register("icon")} value={iconUrl} />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Name"
                  error={(errors as any).name?.message}
                  icon={<User size={16} />}
                >
                  <input
                    {...register("name", {
                      required: "Name is required",
                      onChange: (e) => {
                        const nameValue = e.target.value;
                        setValue("slug", Slugify(nameValue));
                      },
                    })}
                    placeholder="Enter category name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Slug"
                  error={(errors as any).slug?.message}
                  icon={<Mail size={16} />}
                >
                  <input
                    {...register("slug", {
                      required: "Slug is required",
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message: "Invalid slug format",
                      },
                    })}
                    placeholder="Enter category slug"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Sort Order"
                  error={(errors as any).sort_order?.message}
                  icon={<ArrowLeft size={16} />}
                >
                  <input
                    {...register("sort_order", {
                      valueAsNumber: true,
                    })}
                    placeholder="Enter sort order"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                    type="number"
                  />
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).is_active?.message}
                  icon={<BadgeCheck size={16} />}
                >
                  <select
                    {...register("is_active", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Status</option>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
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
                  label="Description"
                  error={(errors as any).description?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("description")}
                    placeholder="Enter category description"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>
              </div>
              <SEOForm
                getValues={getValues}
                register={register}
                setValue={setValue}
                errors={errors}
              />
              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/service-categories")}
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
                      {isEdit ? "Update Category" : "Create Category"}
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

export default ServiceCategoryAction;
