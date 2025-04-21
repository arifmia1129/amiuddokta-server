import constant from "@/constant";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { RiAttachmentFill } from "react-icons/ri";

export default function MultipleAttachmentsUploader({
  attachmentIds,
  setAttachmentIds,
  setAttachmentUrls,
  attachmentUrls = [],
  isFromSupportReply = false,
}: any) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (
      (Array.isArray(attachmentIds) && !attachmentIds.length) ||
      !attachmentIds
    ) {
      setImageUrls([]);
      return;
    }
  }, [attachmentIds]);

  const uploadImages = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "multiple");
    input.click();

    input.onchange = async () => {
      const files = Array.from((input as any).files);
      const newImageUrls = [...imageUrls];
      const newAttachmentIds = [...attachmentIds];
      const newAttachmentUrls = [...attachmentUrls];

      try {
        setIsLoading(true);
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file as any);

          try {
            const { data } = await axios.request({
              method: "POST",
              headers: { "Content-Type": "multipart/form-data" },
              url: "/api/upload",
              data: formData,
            });

            const imageUrl = `${constant.baseUrl}/api/files?fileName=${data?.fileName}`;
            newImageUrls.push(imageUrl);

            const mediaInfo = {
              title: data?.title,
              alt_text: data?.title,
              url: imageUrl,
            };
            newAttachmentUrls.push({ name: data?.title, url: imageUrl });
          } catch (error) {
            // console.error(error);
            setIsLoading(false);
          }
        }
      } catch (error) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }

      setImageUrls(newImageUrls);
      if (setAttachmentUrls) {
        setAttachmentUrls(newAttachmentUrls);
      }
      setAttachmentIds(JSON.stringify(newAttachmentIds));
    };
  };

  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_: any, i: number) => i !== index);
    const newIds = attachmentIds.filter((_: any, i: number) => i !== index);
    setImageUrls(newImageUrls);
    setAttachmentIds(newIds);

    if (attachmentUrls && setAttachmentUrls) {
      const newImageUrls = attachmentUrls.filter(
        (_: any, i: number) => i !== index,
      );
      setAttachmentUrls(newImageUrls);
    }
  };

  return !isLoading ? (
    <>
      <div className="m-10">
        <div
          onClick={uploadImages}
          className="flex cursor-pointer items-center justify-center rounded-md"
        >
          <div
            className={isFromSupportReply ? "absolute bottom-32 right-10" : ""}
          >
            <div className="flex justify-center">
              <RiAttachmentFill size={30} />
            </div>

            {!isFromSupportReply && (
              <p className="text-center text-sm">Upload attachments</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center">
          {imageUrls.map((url: string, index: number) => (
            <div key={index} className="relative m-2">
              <Image
                src={url as string}
                height={100}
                width={100}
                alt={`Attachment ${index + 1}`}
                className="object-cover"
              />
              <div
                onClick={() => removeImage(index)}
                className="bg-red-500 absolute right-0 top-0 mr-1 mt-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black p-1 text-white"
              >
                <p>X</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  ) : (
    <div className="flex h-32 items-center justify-center">
      <p>Uploading...</p>
    </div>
  );
}
