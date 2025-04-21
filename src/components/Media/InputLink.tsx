import { toast } from "react-toastify";
import copy from "copy-to-clipboard";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

import type { FC } from "react";

type InputLinkProps = {
  value: string;
};

export const InputLink: FC<InputLinkProps> = ({ value = "Not Value" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const isCopy = copy(value || "");
    if (isCopy) {
      setCopied(true);
      toast.success("Copied to clipboard", {
        theme: "light",
        autoClose: 2000,
        hideProgressBar: false,
        position: "bottom-center",
        icon: <Check className="text-green-500" size={18} />,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="relative w-full">
      <div className="border-gray-200 relative flex w-full items-center rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
        <div className="text-gray-400 flex h-10 w-10 items-center justify-center">
          <LinkIcon size={16} />
        </div>

        <input
          type="text"
          disabled
          value={value}
          readOnly
          className="text-gray-700 h-10 w-full flex-1 cursor-default overflow-hidden truncate border-0 bg-transparent pr-24 text-sm focus:outline-none focus:ring-0"
        />

        <button
          type="button"
          title="Copy to clipboard"
          className="absolute right-1 top-1/2 flex h-8 w-20 -translate-y-1/2 items-center justify-center gap-1.5 rounded-md bg-blue-500 text-sm font-medium text-white transition-all hover:bg-blue-600 active:scale-95"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
