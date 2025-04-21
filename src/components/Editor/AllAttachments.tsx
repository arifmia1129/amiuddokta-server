/* eslint-disable react-hooks/exhaustive-deps */

import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { RiAttachmentFill } from "react-icons/ri";

export default function AllAttachments({
  imageIds,
  setSelectedImageUrl,
  setIsModalOpen,
}: any) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const retrieveImageUrls = async () => {
    const allImageUrls = [...imageUrls];
    for (const id of typeof imageIds === "string"
      ? JSON.parse(imageIds)
      : imageIds) {
      const data = [] as any;

      if (data[0]?.url) {
        allImageUrls.push(data[0].url);
      }
    }
    setImageUrls(allImageUrls);
  };

  useEffect(() => {
    if (
      Array.isArray(
        typeof imageIds === "string" ? JSON.parse(imageIds) : imageIds,
      ) &&
      (typeof imageIds === "string" ? JSON.parse(imageIds) : imageIds).length
    ) {
      retrieveImageUrls();
    }
  }, [imageIds]);

  return (
    <div>
      <div className="flex flex-wrap justify-center">
        {Array.isArray(imageUrls) && imageUrls.length
          ? imageUrls.map((url: string, index: number) => (
              <div
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedImageUrl(url);
                }}
                key={index}
                className="relative m-2 cursor-pointer"
              >
                <Image
                  src={url as string}
                  height={100}
                  width={100}
                  alt={`Attachment ${index + 1}`}
                  className="object-cover"
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
