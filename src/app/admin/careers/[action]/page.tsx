"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ArrowLeft, Save, Loader2, Briefcase, Info } from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createCareersItem,
  getCareersItemById,
  updateCareersItem,
} from "@/app/lib/actions/careers/careers.controller";
import ImageUploader from "@/components/Editor/ImageUploader";

function CareersAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingCareerInfo, setExistingCareerInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [iconUrl, setIconUrl] = useState("");

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
    setValue,
    getValues,
  } = useForm({ mode: "onChange" });

  const router = useRouter();

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getCareersItemById({ id: id ? id : 0 });
      if (data) {
        data.is_featured = data.is_featured ? 1 : 0;
        setExistingCareerInfo(data);
        if (data.featured_image) {
          setIconUrl(data.featured_image);
        }
        reset(data);
      } else {
        toast.error("Career item not found");
        router.push("/admin/careers");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load career item data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingCareerInfo) {
      handleRetrieveData();
    }
  }, [id, existingCareerInfo]);

  const handleIconUploadSuccess = (url: string) => {
    setValue("featured_image", url);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      data.featured_image = iconUrl;
      let res;
      if (id && existingCareerInfo) {
        res = await updateCareersItem({
          id: id,
          data,
        });
      } else {
        res = await createCareersItem(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/careers");
        if (id && existingCareerInfo) await handleRetrieveData();
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
            <p className="text-gray-600 mt-4">Loading career item data...</p>
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
            onClick={() => router.push("/admin/careers")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Careers
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <Briefcase size={24} className="mr-2 text-blue-600" /> Edit
                  Career Item
                </>
              ) : (
                <>
                  <Briefcase size={24} className="mr-2 text-blue-600" /> Add New
                  Career Item
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit
                ? "Update career item information"
                : "Create a new career item"}
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
                      Career Item Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the career item.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Featured Image
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
                {(errors as any).featured_image?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).featured_image?.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("featured_image")}
                  value={iconUrl}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Title"
                  error={(errors as any).title?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("title", {
                      required: "Title is required",
                    })}
                    placeholder="Enter title"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Company Name"
                  error={(errors as any).company_name?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("company_name", {
                      required: "Company name is required",
                    })}
                    placeholder="Enter company name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Location"
                  error={(errors as any).location?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("location", {
                      required: "Location is required",
                    })}
                    placeholder="Enter location"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Description"
                  error={(errors as any).description?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                    })}
                    placeholder="Enter description"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Responsibilities"
                  error={(errors as any).responsibilities?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("responsibilities")}
                    placeholder="Enter responsibilities"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Qualifications"
                  error={(errors as any).qualifications?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("qualifications")}
                    placeholder="Enter qualifications"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Salary Range"
                  error={(errors as any).salary_range?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("salary_range")}
                    placeholder="Enter salary range"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Benefits"
                  error={(errors as any).benefits?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("benefits")}
                    placeholder="Enter benefits"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Job Type"
                  error={(errors as any).job_type?.message}
                  icon={<Info size={16} />}
                >
                  <select
                    {...register("job_type", {
                      required: "Job type is required",
                    })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Job Type</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
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
                  label="Job Status"
                  error={(errors as any).job_status?.message}
                  icon={<Info size={16} />}
                >
                  <select
                    {...register("job_status", {
                      required: "Job status is required",
                    })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Job Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                    <option value="filled">Filled</option>
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
                  label="Experience Required"
                  error={(errors as any).experience_required?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    type="number"
                    {...register("experience_required", {
                      valueAsNumber: true,
                    })}
                    placeholder="Enter experience required"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Education Level"
                  error={(errors as any).education_level?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("education_level")}
                    placeholder="Enter education level"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Skills Required"
                  error={(errors as any).skills_required?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("skills_required")}
                    placeholder="Enter skills required"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Application Deadline"
                  error={(errors as any).application_deadline?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    type="text"
                    {...register("application_deadline")}
                    placeholder="Enter application deadline"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Contact Email"
                  error={(errors as any).contact_email?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("contact_email", {
                      required: "Contact email is required",
                    })}
                    placeholder="Enter contact email"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Contact Phone"
                  error={(errors as any).contact_phone?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("contact_phone")}
                    placeholder="Enter contact phone"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).is_featured?.message}
                  icon={<Info size={16} />}
                >
                  <select
                    {...register("is_featured", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Status</option>
                    <option value={1}>Featured</option>
                    <option value={0}>Not Featured</option>
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
              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/careers")}
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
                      {isEdit ? "Update Career Item" : "Create Career Item"}
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

export default CareersAction;
