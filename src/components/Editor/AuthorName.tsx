import { retrieveUserByIdController } from "@/app/lib/actions/user/user.controller";
import React, { useEffect, useState } from "react";

const AuthorInfo = ({ authorId }: { authorId: number }) => {
  const [author, setAuthor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAuthorInfo = async (id: any) => {
    setIsLoading(true);
    const res = await retrieveUserByIdController(id);
    if (res?.data) {
      setIsLoading(false);
      return res.data[0];
    } else {
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      const authorInfo = await handleGetAuthorInfo(authorId);
      setAuthor(authorInfo);
    };

    if (authorId) {
      fetchAuthor();
    }
  }, [authorId]);

  return (
    <div className="flex items-center justify-center p-2.5 xl:p-5">
      <p className="text-black dark:text-white">
        {isLoading ? "Loading..." : author ? author.name : "N/A"}
      </p>
    </div>
  );
};

export default AuthorInfo;
