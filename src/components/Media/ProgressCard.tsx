import type { FC } from "react";
import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";

type ProgressCardProps = {
  progressStatus: number;
  fileName?: string;
  fileSize?: string;
  onCancel?: () => void;
};

export const ProgressCard: FC<ProgressCardProps> = ({
  progressStatus,
  fileName = "File",
  fileSize = "",
  onCancel,
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const width = progressStatus.toString().concat("%");

  useEffect(() => {
    if (progressStatus >= 100) {
      setIsComplete(true);
    }
  }, [progressStatus]);

  return (
    <div className="shadow-gray-200/80 flex h-[160px] w-[402px] flex-col justify-between rounded-xl bg-white p-6 shadow-lg">
      <div className="flex w-full items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-semibold">
            {isComplete ? "Upload Complete" : "Uploading..."}
          </h2>
          {(fileName || fileSize) && (
            <p className="text-gray-500 mt-1 text-sm">
              {fileName}
              {fileSize && ` • ${fileSize}`}
            </p>
          )}
        </div>

        {!isComplete && onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full p-2"
            aria-label="Cancel upload"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mt-4 w-full">
        <div className="bg-gray-100 relative h-2 w-full overflow-hidden rounded">
          <div
            className={`absolute inset-y-0 left-0 h-full rounded transition-all duration-300 ease-out ${isComplete ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">{width}</span>
          {isComplete && (
            <span className="flex items-center gap-1 font-medium text-green-500">
              <CheckCircle size={14} />
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
