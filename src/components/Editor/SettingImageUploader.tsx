import constant from "@/constant";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { confirmAlert } from "react-confirm-alert";

export default function SettingImageUploader({ imageUrl, setImageUrl }: any) {
  const uploadImage = async () => {
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

                setImageUrl(imageUrl);

                const mediaInfo = {
                  title: data?.title,
                  alt_text: data?.title,
                  url: imageUrl,
                };
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

            const fileSplitArr = imageUrl?.split("/") as any;

            const fileName = fileSplitArr[fileSplitArr.length - 1];

            const splitArr = fileName?.split(".");

            const mediaInfo = {
              title: splitArr,
              alt_text: splitArr[0],
              url: imageUrl,
            };

            setImageUrl(imageUrl);
          },
        },
      ],
    });
  };

  return (
    <div className="relative">
      <div
        onClick={uploadImage}
        className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-stroke dark:border-form-strokedark"
      >
        {imageUrl ? (
          <Image
            src={imageUrl as string}
            height={100}
            width={100}
            alt="Featured image"
            className="h-full w-full"
          />
        ) : (
          <p>Set setting image</p>
        )}
      </div>
      {imageUrl && (
        <div className="mt-[-50px] flex justify-center">
          <div
            onClick={() => setImageUrl("")}
            className="mx-2 cursor-pointer rounded-lg bg-[#EEF0F0] px-5 py-2 text-black"
          >
            <p>Remove</p>
          </div>
          <div
            onClick={uploadImage}
            className="mx-2 cursor-pointer rounded-lg bg-[#EEF0F0] px-5 py-2 text-black"
          >
            <p>Replace</p>
          </div>
        </div>
      )}
    </div>
  );
}
