import Link from "next/link";
import React from "react";
import { Edit2, Trash2, MessageCircle, Reply } from "lucide-react";

type ActionButtonsProps = {
  id: number;
  editLink: string;
  replyLink?: string;
  onDelete?: (id: number) => void;
  isFromSupport?: boolean | null | undefined;
  isReplyToComment?: boolean | null | undefined;
  setSelectedCommentForReply?: any;
  comment?: any;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  id,
  editLink,
  onDelete,
  isFromSupport = false,
  replyLink = "",
  isReplyToComment = false,
  setSelectedCommentForReply,
  comment,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={editLink}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
        title="Edit"
      >
        <Edit2 size={16} />
        <span className="sr-only">Edit</span>
      </Link>

      {onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
          <span className="sr-only">Delete</span>
        </button>
      )}

      {isReplyToComment && (
        <button
          onClick={() => setSelectedCommentForReply(comment)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          title="Reply to comment"
        >
          <MessageCircle size={16} />
          <span className="sr-only">Reply</span>
        </button>
      )}

      {isFromSupport && (
        <Link
          href={replyLink}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          title="Reply"
        >
          <Reply size={16} />
          <span className="sr-only">Reply</span>
        </Link>
      )}
    </div>
  );
};

export default ActionButtons;
