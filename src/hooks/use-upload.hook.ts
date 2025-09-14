import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import axios from "axios";

import { DROPZONE_OPTIONS, uploadFile } from "../lib";
import constant from "@/constant";

type ImageRes = {
  public_id: string;
  secure_url: string;
};

const imageTypeRegex = /image\/(png|gif|jpg|jpeg)/gm;

export const useUpload = (userId: number) => {
  const [formatImage, setFormatImage] = useState<FormData | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progressStatus, setProgressStatus] = useState(0);
  const [mediaId, setMediaId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    // Add title as filename by default (can be changed later)
    formData.append("title", acceptedFiles[0].name.split(".")[0]);

    setFormatImage(formData);
  }, []);

  const { getRootProps, getInputProps, fileRejections, isDragActive } =
    useDropzone({ ...DROPZONE_OPTIONS, onDrop });

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target?.files!;

    const formData = new FormData();
    const file = files?.[0];

    if (!file?.type.match(imageTypeRegex)) return;

    formData.append("file", file);
    // Add title as filename by default
    formData.append("title", file.name.split(".")[0]);

    setFormatImage(formData);
  };

  useEffect(() => {
    if (fileRejections.length) {
      fileRejections
        .map((el) => el.errors)
        .map((err) => {
          err.map((el) => {
            if (el.code.includes("file-invalid-type")) {
              toast.error("File type must be .png,.jpg,.jpeg,.gif", {
                theme: "light",
              });
              return;
            }
            if (el.code.includes("file-too-large")) {
              toast.error("File is larger than 10MB", { theme: "light" });
              return;
            }
          });
        });
    }
  }, [fileRejections]);

  const saveMedia = async (mediaInfo: {
    fileName: string;
    url: string;
    title: string;
    fileType: string;
    mimeType: string;
    size: number;
  }) => {
    try {
      // Prepare database media object
      const mediaData = {
        title: mediaInfo.title,
        alt_text: mediaInfo.title,
        file_name: mediaInfo.fileName,
        file_path: mediaInfo.url,
        file_type: mediaInfo.fileType,
        mime_type: mediaInfo.mimeType,
        size: mediaInfo.size,
        status: "active",
        user_id: 0,
      };

      return mediaData;
    } catch (error) {
      console.error("Error saving media:", error);
      if (error instanceof Error) {
        toast.error(`Failed to save media: ${error.message}`);
      }
      throw error;
    }
  };

  useEffect(() => {
    (async () => {
      if (!formatImage) return;

      try {
        setIsFetching(true);
        const data = await uploadFile({
          formData: formatImage,
          onUploadProgress(progress) {
            setProgressStatus(progress);
          },
        });

        if (data.success) {
          const url = `${constant.baseUrl}/api/files?fileName=${data?.fileName}`;
          const fileNameParts = data?.fileName?.split(".");
          const fileType = fileNameParts
            ? fileNameParts[fileNameParts.length - 1]
            : "";

          // Get file details from the form data
          const fileObject = formatImage.get("file") as File;

          // Save media information to database
          await saveMedia({
            fileName: data.fileName,
            url: data?.fileName,
            title: data.title,
            fileType: fileType,
            mimeType: fileObject.type,
            size: fileObject.size,
          });

          setFormatImage(null);
          setImage(url);
          setIsFetching(false);
          setIsSuccess(true);

          toast.success("Media successfully uploaded and saved!");
        }
      } catch (err) {
        if (axios.isAxiosError<{ message: string }>(err)) {
          toast.error(err.response?.data.message);
        }
        if (err instanceof Error) {
          toast.error(err.message);
        }
        setFormatImage(null);
        setImage(null);
        setIsFetching(false);
        setIsSuccess(false);
      }
    })();
  }, [formatImage, userId]);

  return {
    isFetching,
    isDragActive,
    isSuccess,
    image,
    progressStatus,
    inputRef,
    mediaId,
    onChangeFile,
    getRootProps,
    getInputProps,
  };
};
