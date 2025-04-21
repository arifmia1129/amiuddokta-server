"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  ButtonFile,
  Dropzone,
  InputLink,
  PreviewImage,
  ProgressCard,
} from "@/components/Media";
import { useUpload } from "@/hooks/use-upload.hook";
import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle,
  Copy,
  Link as LinkIcon,
  FileImage,
  AlertCircle,
} from "lucide-react";

export default function MediaUpload() {
  const u = useUpload(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    if (u.image) {
      navigator.clipboard.writeText(u.image);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex w-full justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {!u.isFetching && (
            <div
              {...u.getRootProps({ className: "dropzone" })}
              className={`h-auto min-h-[480px] w-full rounded-xl border-4 transition-all duration-300 ease-in-out ${u.isDragActive ? "border-blue-400 bg-blue-50" : "border-dashed border-blue-200"} ${u.isSuccess ? "bg-white" : "bg-gradient-to-b from-white to-slate-50"} p-6 shadow-lg hover:shadow-xl sm:p-8`}
            >
              <div className="flex h-full w-full flex-col items-center justify-between gap-6 py-4">
                {u.isSuccess ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 rounded-full bg-green-100 p-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-gray-800 mb-2 text-2xl font-semibold">
                      Upload Complete!
                    </h2>
                    <p className="text-gray-500 max-w-md">
                      Your image has been successfully uploaded and is ready to
                      share
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 rounded-full bg-blue-50 p-4">
                      <UploadCloud className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-gray-800 mb-2 text-2xl font-semibold">
                      Upload your image
                    </h2>
                    <p className="text-gray-500 max-w-md">
                      Drag & drop your image here, or click to browse
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      <span className="flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <FileImage className="mr-1 h-3 w-3" />
                        JPEG
                      </span>
                      <span className="flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <FileImage className="mr-1 h-3 w-3" />
                        PNG
                      </span>
                      <span className="flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <FileImage className="mr-1 h-3 w-3" />
                        GIF
                      </span>
                    </div>
                  </div>
                )}

                {u.image ? (
                  <div className="group relative mx-auto w-full max-w-md">
                    <div className="border-gray-200 overflow-hidden rounded-lg border-2 shadow-md">
                      <PreviewImage imageUrl={u.image} />
                    </div>
                    {!u.isSuccess && (
                      <button
                        className="absolute right-2 top-2 rounded-full bg-white p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <AlertCircle className="text-red-500 h-5 w-5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mx-auto flex w-full max-w-md justify-center">
                    <Dropzone
                      isActive={u.isDragActive}
                      onInputProps={u.getInputProps}
                    />
                  </div>
                )}

                {!u.isSuccess && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center">
                      <div className="bg-gray-300 h-px w-16"></div>
                      <span className="text-gray-500 px-3 text-sm">Or</span>
                      <div className="bg-gray-300 h-px w-16"></div>
                    </div>
                    <ButtonFile
                      onClick={() => u.inputRef.current?.click()}
                      inputRef={u.inputRef}
                      onChange={u.onChangeFile}
                    />
                  </div>
                )}

                {u.isSuccess && (
                  <div className="w-full max-w-md">
                    <div className="text-gray-700 mb-2 flex items-center text-sm font-medium">
                      <LinkIcon className="mr-1.5 h-4 w-4" />
                      Image Link
                    </div>
                    <div className="relative">
                      <InputLink value={u.image!} />
                      <button
                        onClick={handleCopyLink}
                        className="bg-gray-100 hover:bg-gray-200 absolute right-2 top-1/2 -translate-y-1/2 transform rounded-md p-2 transition-colors"
                        aria-label="Copy link"
                      >
                        {copySuccess ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="text-gray-600 h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {copySuccess && (
                      <p className="animate-fade-in mt-1 text-xs text-green-600">
                        Link copied to clipboard!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {u.isFetching && (
            <div className="flex justify-center rounded-xl bg-white p-6 shadow-lg">
              <ProgressCard progressStatus={u.progressStatus} />
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
