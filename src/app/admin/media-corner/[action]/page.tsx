"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createMediaCornerItem,
  getMediaCornerItemById,
  updateMediaCornerItem,
} from "@/app/lib/actions/mediaCorner/mediaCorner.controller";
import ImageUploader from "@/components/Editor/ImageUploader";

function MediaCornerAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingMediaInfo, setExistingMediaInfo] = useState(null);
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
      const { data } = await getMediaCornerItemById({ id: id ? id : 0 });
      if (data) {
        setExistingMediaInfo(data);
        if (data.thumbnail) {
          setIconUrl(data.thumbnail);
        }
        reset(data);
      } else {
        toast.error("Media corner item not found");
        router.push("/admin/media-corner");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load media corner item data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingMediaInfo) {
      handleRetrieveData();
    }
  }, [id, existingMediaInfo]);

  const handleIconUploadSuccess = (url: string) => {
    setValue("thumbnail", url);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      data.thumbnail = iconUrl;

      let res;
      if (id && existingMediaInfo) {
        res = await updateMediaCornerItem({
          id: id,
          data,
        });
      } else {
        res = await createMediaCornerItem(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/media-corner");
        if (id && existingMediaInfo) await handleRetrieveData();
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
              Loading media corner item data...
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
            onClick={() => router.push("/admin/media-corner")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Media Corner
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <ImageIcon size={24} className="mr-2 text-blue-600" /> Edit
                  Media Corner Item
                </>
              ) : (
                <>
                  <VideoIcon size={24} className="mr-2 text-blue-600" /> Add New
                  Media Corner Item
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit
                ? "Update media corner item information"
                : "Create a new media corner item"}
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
                      Media Corner Item Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the media corner
                      item.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Thumbnail
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
                {(errors as any).thumbnail?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).thumbnail?.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("thumbnail")}
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
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Description"
                  error={(errors as any).description?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("description")}
                    placeholder="Enter description"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Type"
                  error={(errors as any).type?.message}
                  icon={<Info size={16} />}
                >
                  <select
                    {...register("type", {
                      required: "Type is required",
                    })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Type</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
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
                  label="Link"
                  error={(errors as any).link?.message}
                  icon={<LinkIcon size={16} />}
                >
                  <input
                    {...register("link", {
                      required: "Link is required",
                    })}
                    placeholder="Enter link"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).is_featured?.message}
                  icon={<Info size={16} />}
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
                  onClick={() => router.push("/admin/media-corner")}
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
                      {isEdit
                        ? "Update Media Corner Item"
                        : "Create Media Corner Item"}
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

export default MediaCornerAction;
