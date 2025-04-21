import axios from "axios";

type ImageResponse = {
  success: boolean;
  url: string;
  fileName: string;
  title: string;
};

type UploadFileProps = {
  formData: FormData | null;
  onUploadProgress: (progress: number) => void;
};

export const uploadFile = async ({
  formData,
  onUploadProgress,
}: UploadFileProps): Promise<ImageResponse> => {
  const { data } = await axios.request<ImageResponse>({
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    url: "/api/upload",
    // url: process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || "",
    data: formData,
    onUploadProgress(progressEvent) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total!,
      );
      onUploadProgress(percentCompleted);
    },
  });

  return data;
};
