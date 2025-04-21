import NextImage from "next/image";
import { ArrowUpFromLine, ImageIcon } from "lucide-react";
import c from "clsx";

import BackgroundSvg from "../../../public/background.svg";

import type { FC } from "react";
import type { DropzoneInputProps } from "react-dropzone";

type DropzoneProps = {
  isActive?: boolean;
  onInputProps: <T extends DropzoneInputProps>(props?: T) => T;
};

export const Dropzone: FC<DropzoneProps> = ({
  isActive = false,
  onInputProps,
}) => {
  return (
    <div
      className={c(
        "relative flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 transition-all duration-300 sm:h-[240px] sm:w-[360px] sm:gap-6",
        isActive
          ? "scale-[0.98] border-blue-500 bg-blue-50/70"
          : "border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/30",
      )}
    >
      <input
        {...onInputProps()}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute -z-10">
            <NextImage
              src={BackgroundSvg}
              width={140}
              height={105}
              alt="background upload"
              priority
              className="opacity-90"
            />
          </div>

          <div
            className={c(
              "rounded-full p-4 transition-all",
              isActive ? "bg-blue-100" : "bg-blue-50",
            )}
          >
            <ArrowUpFromLine
              className={c(
                "h-8 w-8 transition-all",
                isActive ? "text-blue-600" : "text-blue-400",
              )}
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <p
            className={c(
              "text-center text-sm font-semibold sm:text-base",
              isActive ? "text-blue-700" : "text-gray-700",
            )}
          >
            Drag & Drop your image here
          </p>

          <p
            className={c(
              "text-center text-xs font-medium",
              isActive ? "text-blue-500" : "text-gray-400",
            )}
          >
            or click to browse files
          </p>
        </div>
      </div>

      <div className="text-gray-500 absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
        <ImageIcon className="h-3 w-3" />
        <span>PNG, JPG, GIF</span>
      </div>
    </div>
  );
};
