"use client";
import constant from "@/constant";
import axios from "axios";
import { Editor } from "novel-lightweight";
import { useState, useEffect } from "react";
import { Loader2, Image as ImageIcon, Save } from "lucide-react";

export default function EditorComponent({
  setPageHtml,
  pageHtml = "",
  isNeedImage = true,
  isLoading = false,
}: {
  placeholder?: string;
  setPageHtml: (html: string) => void;
  pageHtml?: string;
  isNeedImage?: boolean;
  isLoading?: boolean;
  autoSave?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Simple notification function (replace with your preferred notification library)
  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    // You can implement a simple alert, or integrate your preferred notification system
    console.log(`${type}: ${message}`);
    // If you want to add a simple notification system:
    const notificationEl = document.createElement("div");
    notificationEl.className = `fixed top-4 right-4 p-2 rounded ${type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`;
    notificationEl.textContent = message;
    document.body.appendChild(notificationEl);
    setTimeout(() => document.body.removeChild(notificationEl), 3000);
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      showNotification(
        "Please upload a valid image (JPEG, PNG, GIF, WEBP)",
        "error",
      );
      return "";
    }

    if (file.size > maxSize) {
      showNotification("Image size should be less than 5MB", "error");
      return "";
    }

    setIsUploading(true);
    try {
      const image = await uploadImage(file);
      if (image.url) {
        showNotification("Image uploaded successfully");
        return image.url;
      }
      showNotification("Failed to upload image", "error");
      return "";
    } catch (error) {
      showNotification("Error uploading image", "error");
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={`relative rounded-md border ${isLoading ? "opacity-70" : ""}`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        <Editor
          className="min-h-96 w-full rounded-md p-4 focus:outline-none"
          defaultValue={pageHtml}
          disableLocalStorage={true}
          onUpdate={(editor) => {
            const markdown = editor?.storage.markdown.getMarkdown();
            setPageHtml(markdown);
            setUnsavedChanges(true);
          }}
          handleImageUpload={isNeedImage ? handleImageUpload : undefined}
          editorProps={{
            attributes: {
              class:
                "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none",
            },
          }}
        />
      </div>
    </div>
  );
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await axios.request({
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      url: "/api/upload",
      data: formData,
      timeout: 30000, // 30 second timeout
      onUploadProgress: (progressEvent) => {
        // You could use this to show upload progress if needed
      },
    });

    const imageUrl = `${constant.baseUrl}/api/files?fileName=${data?.fileName}`;

    return {
      title: data?.title || file.name,
      alt_text: data?.title || file.name,
      url: imageUrl,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error; // Let the caller handle the error
  }
}
