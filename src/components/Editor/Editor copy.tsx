/* eslint-disable react/display-name */
// @ts-nocheck

import React, { useMemo, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Loader from "../common/Loader";
import { createMediaController } from "@/app/lib/actions/media-bk/media.controller";
import { confirmAlert } from "react-confirm-alert";
import dynamic from "next/dynamic";
import constant from "@/constant";
import "@/css/editor.css";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
  },
);

/** Debounce function */
function debounce(
  func: (...args: any[]) => void,
  wait: number,
  immediate: boolean = false,
) {
  let timeout: NodeJS.Timeout | null;
  return function (...args: any[]) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout as any);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function Editor({
  placeholder,
  setPageHtml,
  pageHtml,
  isNeedImage = true,
  isLoading = false,
}: any) {
  const quillRef = useRef();

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
  } = useForm();

  const handleImageUpload = async () => {
    confirmAlert({
      title: "Image source",
      message: "Where do you want to take the image from?",
      buttons: [
        {
          label: "From device",
          onClick: async () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = (input as any).files[0];
              const formData = new FormData();
              formData.append("file", file);

              try {
                const { data } = await axios.request({
                  method: "POST",
                  headers: { "Content-Type": "multipart/form-data" },
                  url: "/api/upload",
                  data: formData,
                });

                const imageUrl = `${constant.baseUrl}/api/files?fileName=${data?.fileName}`;

                const mediaInfo = {
                  title: data?.title,
                  alt_text: data?.title,
                  url: imageUrl,
                };

                await createMediaController(mediaInfo);

                const range = (quillRef as any).current
                  .getEditor()
                  .getSelection();
                (quillRef as any).current
                  .getEditor()
                  .insertEmbed(range.index, "image", imageUrl);
              } catch (error) {
                console.error(error);
              }
            };
          },
        },
        {
          label: "External link",
          onClick: async () => {
            const imageUrl = prompt("External link");

            const fileSplitArr = imageUrl?.split("/");

            const fileName = fileSplitArr[fileSplitArr.length - 1];

            const splitArr = fileName?.split(".");

            const mediaInfo = {
              title: splitArr,
              alt_text: splitArr[0],
              url: imageUrl,
            };

            await createMediaController(mediaInfo);

            const range = (quillRef as any).current.getEditor().getSelection();
            (quillRef as any).current
              .getEditor()
              .insertEmbed(range.index, "image", imageUrl);
          },
        },
      ],
    });
  };

  const insertHtml = () => {
    const html = prompt("Enter HTML:");
    if (html) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(range.index, html, "api");
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ script: "sub" }, { script: "super" }],
          [{ color: [] }, { background: [] }],
          ["bold", "italic", "underline"],
          ["link"],
          [{ font: [] }],
          [{ align: [] }],
          [isNeedImage && "image", "code-block", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ direction: "rtl" }],
          ["custom-html"], // Custom HTML button
        ],
        handlers: {
          image: handleImageUpload,
          "custom-html": insertHtml, // Link the custom handler function
        },
      },
    }),
    [],
  );

  const rteChange = useCallback(
    debounce((content: string) => {
      setPageHtml(content);
    }, 200),
    [],
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="relative mb-20">
      <div className="quill-toolbar absolute right-50 mt-[3px]">
        <button type="button" onClick={insertHtml} className="ql-custom-html">
          HTML
        </button>
      </div>

      <ReactQuill
        forwardedRef={quillRef as any}
        placeholder={placeholder || "Writing here..."}
        modules={modules}
        defaultValue={pageHtml as any}
        onChange={rteChange}
        className="custom-quill" // Apply the custom CSS class
      />
    </div>
  );
}
export default Editor;
