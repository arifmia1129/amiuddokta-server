import NextImage from "next/image";
import { useState } from "react";
import { Eye, Download, X } from "lucide-react";

import type { FC } from "react";

type PreviewImageProps = {
  imageUrl: string;
  onRemove?: () => void;
};

export const PreviewImage: FC<PreviewImageProps> = ({
  imageUrl = "",
  onRemove,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="border-gray-100 relative overflow-hidden rounded-xl border bg-white/50 shadow-sm transition-all hover:shadow-md">
      <div className="relative h-[220px] w-[338px]">
        {/* Loading state placeholder */}
        {isLoading && (
          <div className="bg-gray-50 absolute inset-0 flex items-center justify-center">
            <div className="border-gray-200 h-8 w-8 animate-spin rounded-full border-2 border-t-blue-500"></div>
          </div>
        )}

        <NextImage
          src={imageUrl}
          fill
          alt="Preview image"
          priority
          className="object-contain"
          sizes="(min-width: 768px) 100vw, 338px"
          onLoadingComplete={() => setIsLoading(false)}
        />
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        {/* View original button */}
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-blue-500 hover:text-white"
          title="View original"
        >
          <Eye size={16} />
        </a>

        {/* Download button */}
        <a
          href={imageUrl}
          download
          className="text-gray-600 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-blue-500 hover:text-white"
          title="Download image"
        >
          <Download size={16} />
        </a>
      </div>

      {/* Remove button (only shown if onRemove prop is provided) */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-600 hover:bg-red-500 absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:text-white"
          title="Remove image"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
