"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import constant from "@/constant";
import {
  Loader2,
  X,
  Image as ImageIcon,
  AlertCircle,
  Camera,
  FileImage,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";

interface ImageUploaderProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onUploadSuccess?: (url: string) => void;
  title?: string;
  description?: string;
  maxSize?: number; // in MB
  aspectRatio?: string; // e.g., "1:1", "16:9", etc.
  previewSize?: "sm" | "md" | "lg";
  allowedTypes?: string[]; // e.g., ["image/jpeg", "image/png"]
  rounded?: boolean;
  className?: string;
  id?: string;
}

export default function ImageUploader({
  imageUrl,
  setImageUrl,
  onUploadSuccess,
  title = "Upload Image",
  description = "Supported formats: JPG, PNG, GIF (Max 2MB)",
  maxSize = 2, // 2MB default
  aspectRatio,
  previewSize = "md",
  allowedTypes = ["image/jpeg", "image/png", "image/gif"],
  rounded = false,
  className = "",
  id,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Preview size dimensions
  const sizeMap = {
    sm: { height: "h-24", width: "w-24" },
    md: { height: "h-36", width: "w-36" },
    lg: { height: "h-48", width: "w-48" },
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image size should be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      setError(`Only ${allowedTypes.join(", ")} files are allowed`);
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file: File) => {
    if (!validateFile(file)) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      setLoading(true);
      setUploadSuccess(false);

      const { data } = await axios.request({
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        url: "/api/upload",
        data: formData,
      });

      const newImageUrl = data?.fileName;
      setImageUrl(newImageUrl);
      setUploadSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

      if (onUploadSuccess) {
        onUploadSuccess(newImageUrl);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  return (
    <div className={`${className} font-sans`}>
      {title && (
        <h3 className="text-gray-800 mb-2 flex items-center text-sm font-semibold">
          <Camera size={16} className="mr-1.5 text-blue-600" />
          {title}
        </h3>
      )}

      <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
        {/* Image Preview */}
        <div
          className={`relative ${sizeMap[previewSize].height} ${
            sizeMap[previewSize].width
          } overflow-hidden ${
            rounded ? "rounded-full" : "rounded-lg"
          } border-gray-200 bg-gray-50 group border-2 shadow-sm transition-all hover:border-blue-500`}
        >
          {imageUrl ? (
            <>
              <Image
                src={`${constant.baseUrl}/api/files?fileName=${imageUrl}`}
                alt="Uploaded image"
                fill
                className={`object-cover ${loading ? "opacity-50" : ""}`}
              />
              {!loading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={16} className="text-red-500" />
                </button>
              )}
            </>
          ) : (
            <div className="from-gray-50 to-gray-100 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br">
              <FileImage
                size={sizeMap[previewSize].width === "w-24" ? 24 : 36}
                className="text-gray-400"
              />
              <span className="text-gray-500 mt-2 text-xs font-medium">
                Preview area
              </span>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="w-full">
          <div
            className={`border-gray-300 relative w-full cursor-pointer rounded-lg border-2 border-dashed p-5 transition-all duration-300 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : imageUrl
                  ? "bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  : "bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <UploadCloud
                size={32}
                className={`${
                  isDragging
                    ? "text-blue-600"
                    : imageUrl
                      ? "text-green-600"
                      : "text-gray-400"
                } transition-colors duration-300`}
              />
              <p
                className={`text-sm font-medium ${
                  isDragging
                    ? "text-blue-700"
                    : imageUrl
                      ? "text-green-700"
                      : "text-gray-700"
                }`}
              >
                {isDragging
                  ? "Drop your image here"
                  : imageUrl
                    ? "Update image"
                    : "Drag & drop your image here"}
              </p>
              <p className="text-gray-500 text-xs">or</p>
              <label
                htmlFor={id ? id : "file-upload"}
                className={`cursor-pointer rounded-md ${
                  imageUrl
                    ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                } px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors`}
              >
                {imageUrl ? "Replace Image" : "Browse Files"}
                <input
                  id={id ? id : "file-upload"}
                  name={id ? id : "file-upload"}
                  type="file"
                  accept={allowedTypes.join(",")}
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              <div className="mt-3 flex flex-col gap-1">
                <p className="text-gray-500 text-xs">{description}</p>
                {aspectRatio && (
                  <p className="text-gray-500 flex items-center justify-center text-xs">
                    <span className="border-gray-400 mr-1 inline-block h-3 w-3 rounded-sm border"></span>
                    Recommended aspect ratio: {aspectRatio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 bg-red-50 border-red-200 mt-2 flex items-start gap-1.5 rounded-md border p-2 text-xs">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <p className="mt-2 flex items-center rounded-md border border-blue-200 bg-blue-50 p-2 text-sm text-blue-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading your image...
            </p>
          )}

          {uploadSuccess && !loading && (
            <p className="mt-2 flex items-center rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Image uploaded successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
