"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  User,
  Mail,
  Lock,
  Users,
  Info,
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  BadgeCheck,
  File,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createService,
  getServiceById,
  updateService,
} from "@/app/lib/actions/service/service.controller";
import { getCurrentUser } from "@/app/lib/actions/user/user.controller";
import ImageUploader from "@/components/Editor/ImageUploader";
import EditorComponent from "@/components/Editor/Editor";
import SEOForm from "@/components/Share/SEOForm";
import { getServiceCategories } from "@/app/lib/actions/serviceCategory/serviceCategory.controller";
import slugify from "react-slugify";

function ServiceAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingServiceInfo, setExistingServiceInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [iconUrl, setIconUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [pageHtml, setPageHtml] = useState("");
  const [serviceCategories, setServiceCategories] = useState<any>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm({ mode: "onChange" });

  const handleGetServiceInfo = async () => {
    const { data: user } = await getCurrentUser();
    if (user?.id) {
      const res = await getServiceById(user?.id);
      if (res?.success) setExistingServiceInfo(res.data);
    }
  };
  const handleGetServiceCategories = async () => {
    const { data } = await getServiceCategories({
      page: 1,
      limit: 100,
    });

    if (Array.isArray(data) && data.length) {
      setServiceCategories(data);
    }
  };

  useEffect(() => {
    handleGetServiceInfo();
    handleGetServiceCategories();
  }, []);

  useEffect(() => {
    if (params.action === "edit" && id) {
      setIsEdit(true);
    }
  }, [params.action, id]);

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getServiceById({ id: id ? id : 0 });
      if (data) {
        setExistingServiceInfo(data);

        data.schema_markup = data.schema_markup
          ? JSON.stringify(data.schema_markup)
          : null;

        // Set form data
        reset(data);

        // Set image URLs separately
        if (data.icon) {
          setIconUrl(data.icon);
        }
        if (data.featured_image) {
          setFeaturedImageUrl(data.featured_image);
        }
        if (data.description) {
          setPageHtml(data.description);
        }
        if (data.is_active) {
          setValue("is_active", 1);
        }
        if (data.is_featured) {
          setValue("is_featured", 1);
        }
      } else {
        toast.error("Service not found");
        router.push("/admin/services");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load service data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingServiceInfo) {
      handleRetrieveData();
    }
  }, [id, existingServiceInfo]);

  // This useEffect ensures form values are updated when image URLs change
  useEffect(() => {
    setValue("icon", iconUrl);
  }, [iconUrl, setValue]);

  useEffect(() => {
    setValue("featured_image", featuredImageUrl);
  }, [featuredImageUrl, setValue]);

  useEffect(() => {
    setValue("page_html", pageHtml);
  }, [pageHtml, setValue]);

  const onSubmit = async (data: any) => {
    console.log("Submit data: ", data);
    setIsLoading(true);
    try {
      // Ensure the latest image URLs and page HTML are included in the form data
      data.icon = iconUrl;
      data.featured_image = featuredImageUrl;
      data.description = pageHtml;
      data.is_active = data?.is_active ? true : false;
      data.is_featured = data?.is_featured ? true : false;

      let res;
      if (id && existingServiceInfo) {
        res = await updateService({
          id: id,
          data,
        });
      } else {
        res = await createService(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/services");
        if (id && existingServiceInfo) await handleRetrieveData();
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
            <p className="text-gray-600 mt-4">Loading service data...</p>
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
            onClick={() => router.push("/admin/services")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Services
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit Service
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  Service
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit ? "Update service information" : "Create a new service"}
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
                      Service Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the service.
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon Uploader */}
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Icon
                </label>
                <ImageUploader
                  imageUrl={iconUrl}
                  setImageUrl={setIconUrl}
                  title=""
                  description="Recommended: Square image, max 1MB (JPG, PNG)"
                  maxSize={1}
                  previewSize="sm"
                  aspectRatio="1:1"
                  className="mb-2"
                  id="icon-uploader"
                />
                {(errors as any).icon?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).icon?.message}
                  </p>
                )}
              </div>

              {/* Featured Image Uploader */}
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Featured Image
                </label>
                <ImageUploader
                  imageUrl={featuredImageUrl}
                  setImageUrl={setFeaturedImageUrl}
                  title=""
                  description="Recommended: Rectangular image, max 2MB (JPG, PNG)"
                  maxSize={2}
                  previewSize="md"
                  aspectRatio="16:9"
                  className="mb-2"
                  id="feature-image-uploader"
                />
                {(errors as any).featured_image?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).featured_image?.message}
                  </p>
                )}
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
                        setValue("slug", slugify(nameValue));
                      },
                    })}
                    placeholder="Enter service name"
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
                    placeholder="Enter service slug"
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
                  label="Category"
                  error={(errors as any).category_id?.message}
                  icon={<File size={16} />}
                >
                  <select
                    {...register("category_id", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Category</option>
                    {serviceCategories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
                  label="Price"
                  error={(errors as any).price?.message}
                  icon={<Lock size={16} />}
                >
                  <input
                    {...register("price", {
                      valueAsNumber: true,
                      required: "Price is required",
                    })}
                    placeholder="Enter price"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                    type="number"
                    step="0.01"
                  />
                </FormField>

                <FormField
                  label="Featured"
                  error={(errors as any).is_featured?.message}
                  icon={<Shield size={16} />}
                >
                  <select
                    {...register("is_featured", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Featured</option>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
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
                  label="Short Description"
                  error={(errors as any).short_description?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("short_description")}
                    placeholder="Enter short description"
                    rows={2}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>
              </div>

              <EditorComponent
                setPageHtml={setPageHtml}
                pageHtml={pageHtml}
                isLoading={isLoading}
              />

              <SEOForm
                getValues={getValues}
                register={register}
                setValue={setValue}
                errors={errors}
              />

              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/services")}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center rounded-md border px-5 py-2.5 font-medium transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center rounded-md hover:bg-primary hover:px-5 hover:py-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                      {isEdit ? "Update Service" : "Create Service"}
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

export default ServiceAction;
