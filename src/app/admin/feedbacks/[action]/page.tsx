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
  createFeedback,
  getFeedbackById,
  updateFeedback,
} from "@/app/lib/actions/feedback/feedback.controller";
import { getCurrentUser } from "@/app/lib/actions/user/user.controller";
import ImageUploader from "@/components/Editor/ImageUploader";

function FeedbackAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingFeedbackInfo, setExistingFeedbackInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [iconUrl, setIconUrl] = useState("");

  const handleGetFeedbackInfo = async () => {
    const { data: user } = await getCurrentUser();
    if (user?.id) {
      const res = await getFeedbackById(user?.id);
      if (res?.success) setExistingFeedbackInfo(res.data);
    }
  };

  useEffect(() => {
    handleGetFeedbackInfo();
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
    setValue,
    getValues,
  } = useForm({ mode: "onChange" });

  const router = useRouter();

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getFeedbackById({ id: id ? id : 0 });
      if (data) {
        setExistingFeedbackInfo(data);
        if (data.profile_image) {
          setIconUrl(data.profile_image);
        }
        reset(data);
        if (data.is_featured) {
          setValue("is_featured", 1);
        }
      } else {
        toast.error("Feedback not found");
        router.push("/admin/feedbacks");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load feedback data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingFeedbackInfo) {
      handleRetrieveData();
    }
  }, [id, existingFeedbackInfo]);

  const handleIconUploadSuccess = (url: string) => {
    setValue("profile_image", url);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;
      data.is_featured = data?.is_featured ? true : false;
      data.profile_image = iconUrl;

      if (id && existingFeedbackInfo) {
        res = await updateFeedback({
          id: id,
          data,
        });
      } else {
        res = await createFeedback(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/feedbacks");
        if (id && existingFeedbackInfo) await handleRetrieveData();
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
            <p className="text-gray-600 mt-4">Loading feedback data...</p>
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
            onClick={() => router.push("/admin/feedbacks")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Feedbacks
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit
                  Feedback
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  Feedback
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit ? "Update feedback information" : "Create a new feedback"}
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
                      Feedback Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the feedback.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Profile Image
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
                {(errors as any).profile_image?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).profile_image?.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("profile_image")}
                  value={iconUrl}
                />
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
                    })}
                    placeholder="Enter feedback name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Designation"
                  error={(errors as any).designation?.message}
                  icon={<Mail size={16} />}
                >
                  <input
                    {...register("designation")}
                    placeholder="Enter designation"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Company"
                  error={(errors as any).company?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("company")}
                    placeholder="Enter company name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Stars"
                  error={(errors as any).stars?.message}
                  icon={<BadgeCheck size={16} />}
                >
                  <input
                    {...register("stars", {
                      required: "Stars are required",
                      min: 1,
                      max: 5,
                    })}
                    type="number"
                    placeholder="Enter stars (1-5)"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Feedback"
                  error={(errors as any).feedback?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("feedback", {
                      required: "Feedback is required",
                    })}
                    placeholder="Enter feedback"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).is_featured?.message}
                  icon={<BadgeCheck size={16} />}
                >
                  <select
                    {...register("is_featured", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
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
                  onClick={() => router.push("/admin/feedbacks")}
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
                      {isEdit ? "Update Feedback" : "Create Feedback"}
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

export default FeedbackAction;
