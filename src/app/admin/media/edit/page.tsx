"use client";

import {
  getMediaById,
  updateMedia,
} from "@/app/lib/actions/media/media.controller";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Image from "next/image";
import constant from "@/constant";

function EditMedia() {
  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState<any>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  // Fetch media data
  const fetchMedia = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await getMediaById({ id });

      if (response.success && response.data) {
        setMedia(response.data);

        // Reset form with media data
        reset({
          title: response.data.title,
          alt_text: response.data.alt_text,
          description: response.data.description,
          status: response.data.status,
          file_path: response.data.file_path,
          mime_type: response.data.mime_type,
        });
      } else {
        toast.error(response.message || "Failed to load media");
        router.push("/media"); // Redirect back to media list on error
      }
    } catch (error) {
      console.error("Error loading media:", error);
      toast.error("An error occurred while loading media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [id]);

  // Handle form submission
  const onSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await updateMedia({
        id,
        data: {
          title: formData.title,
          alt_text: formData.alt_text,
          description: formData.description,
          status: formData.status,
        },
      } as any);

      if (response.success) {
        toast.success(response.message || "Media updated successfully");
        await fetchMedia(); // Refresh media data
      } else {
        toast.error(response.message || "Failed to update media");
      }
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("An error occurred while updating media");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !media) {
    return (
      <DefaultLayout>
        <Loader />
      </DefaultLayout>
    );
  }

  // Status options according to the new schema
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ];

  // Function to get file size in human-readable format
  const formatFileSize = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Edit Media</h3>
        </div>

        {media && (
          <div className="p-6.5">
            <div className="mb-8">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                <div className="w-full max-w-xs overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
                  <Image
                    src={`${constant.baseUrl}/api/files?fileName=${media.file_path}`}
                    width={300}
                    height={300}
                    alt={media.alt_text || media.title}
                    className="h-auto w-full object-contain"
                  />
                </div>

                <div className="w-full">
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    File Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">File name:</span>{" "}
                      {media.file_name}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {media.mime_type}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span>{" "}
                      {media.size ? formatFileSize(media.size) : "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium">Uploaded:</span>{" "}
                      {new Date(media.created_at).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Last updated:</span>{" "}
                      {new Date(media.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Title <span className="text-meta-1">*</span>
                  </label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    type="text"
                    placeholder="Media title"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-meta-1">
                      {(errors as any).title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Alt Text
                  </label>
                  <input
                    {...register("alt_text")}
                    type="text"
                    placeholder="Alternative text for accessibility"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    File Path
                  </label>
                  <input
                    {...register("file_path")}
                    type="text"
                    disabled
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Description of the media"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-3 text-center font-medium text-white hover:bg-opacity-90"
                >
                  Update Media
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/media")}
                  className="inline-flex items-center justify-center rounded-md border border-stroke px-10 py-3 text-center font-medium text-black hover:bg-opacity-90 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default function EditMediaPage() {
  return (
    <Suspense fallback={<Loader />}>
      <EditMedia />
    </Suspense>
  );
}
