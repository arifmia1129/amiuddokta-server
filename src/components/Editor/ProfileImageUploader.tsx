import { updateUserByIdController } from "@/app/lib/actions/user/user.controller";
import constant from "@/constant";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProfileImageUploader({
  imageUrl,
  setImageUrl,
  isNeedUpload = false,
  userId = 0,
  title = "Profile Image",
}: {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  isNeedUpload?: boolean;
  userId?: number;
  title?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      setLoading(true);
      const { data } = await axios.request({
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        url: "/api/upload",
        data: formData,
      });

      const imageUrl = data?.fileName;
      // const imageUrl = `${constant.baseUrl}/api/files?fileName=${data?.fileName}`;
      setImageUrl(imageUrl);

      if (isNeedUpload && userId) {
        await updateUserByIdController({
          id: userId,
          data: {
            profile_image: imageUrl,
          },
        });
      }
    } catch (error) {
      console.error(error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-gray-200 mb-8 border-b pb-6">
      <h2 className="text-gray-700 mb-4 text-xl font-semibold">{title}</h2>
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-8 sm:space-y-0">
        <div className="border-gray-200 relative h-36 w-36 overflow-hidden rounded-full border-4 shadow-md transition-all hover:border-primary">
          {imageUrl ? (
            <Image
              src={
                loading
                  ? "/images/user/Loading.gif"
                  : `${constant.baseUrl}/api/files?fileName=${imageUrl}`
              }
              alt="Profile picture"
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-gray-100 text-gray-500 flex h-full w-full items-center justify-center">
              <span className="text-xs">No Image</span>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="w-full max-w-md">
          <label className="text-gray-700 mb-2 block text-sm font-medium">
            Upload Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border-gray-300 bg-gray-50 text-gray-900 block w-full cursor-pointer rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-red-500 mt-1 text-xs">{error}</p>}
          <p className="text-gray-500 mt-1 text-xs">
            Recommended: Square image, max 2MB (JPG, PNG, GIF)
          </p>
          {loading && (
            <p className="mt-2 flex items-center text-sm text-primary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading image...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
