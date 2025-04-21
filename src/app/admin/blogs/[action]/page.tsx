"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  User,
  Mail,
  Users,
  Info,
  ArrowLeft,
  Save,
  Loader2,
  BadgeCheck,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "@/app/lib/actions/blogPosts/blogPosts.controller";
import { getCurrentUser } from "@/app/lib/actions/user/user.controller";
import ImageUploader from "@/components/Editor/ImageUploader";
import SEOForm from "@/components/Share/SEOForm";
import Slugify from "react-slugify";
import { getBlogCategories } from "@/app/lib/actions/blogCategory/blogCategory.controller";
import { getUsers } from "@/app/lib/actions/user/user.controller";

function BlogPostAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingPostInfo, setExistingPostInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [iconUrl, setIconUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const handleGetPostInfo = async () => {
    const { data: user } = await getCurrentUser();
    if (user?.id) {
      const res = await getBlogPostById(user?.id);
      if (res?.success) setExistingPostInfo(res.data);
    }
  };

  useEffect(() => {
    handleGetPostInfo();
  }, []);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (params.action === "edit" && id) {
      setIsEdit(true);
    }
  }, [params.action, id]);

  const {
    register,
    watch,
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm({ mode: "onChange" });

  const router = useRouter();

  const handleRetrieveData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getBlogPostById({ id: id ? id : 0 });
      if (data) {
        setExistingPostInfo(data);
        if (data.featured_image) {
          setIconUrl(data.featured_image);
        }
        data.schema_markup = data.schema_markup
          ? JSON.stringify(data.schema_markup)
          : null;
        reset(data);
        if (data.is_published) {
          setValue("is_published", 1);
        }
      } else {
        toast.error("Blog post not found");
        router.push("/admin/blogs");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load blog post data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingPostInfo) {
      handleRetrieveData();
    }
  }, [id, existingPostInfo]);

  const handleIconUploadSuccess = (url: string) => {
    setValue("icon", url);
  };

  const fetchCategories = async () => {
    const res = await getBlogCategories({});
    if (res.success) {
      setCategories(res.data);
    }
  };

  const fetchAuthors = async () => {
    const res = await getUsers({});
    if (res.success) {
      setAuthors(res.data);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;
      data.is_published = data?.is_published ? true : false;
      data.featured_image = iconUrl;

      if (id && existingPostInfo) {
        res = await updateBlogPost({
          id: id,
          data,
        });
      } else {
        res = await createBlogPost(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/blogs");
        if (id && existingPostInfo) await handleRetrieveData();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && id) {
    return (
      <DefaultLayout>
        <div className="flex h-64 items-center justify-center rounded-lg bg-white p-8 shadow-lg dark:bg-black">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
            <p className="text-gray-600 mt-4">Loading blog post data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl dark:bg-black">
        <div className="mb-4">
          <button
            onClick={() => router.push("/admin/blogs")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Blog Posts
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit Blog
                  Post
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  Blog Post
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit
                ? "Update blog post information"
                : "Create a new blog post"}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Blog Post Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the blog post.
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Icon
                </label>
                <ImageUploader
                  imageUrl={iconUrl}
                  setImageUrl={setIconUrl}
                  onUploadSuccess={handleIconUploadSuccess}
                  title=""
                  description="Recommended: Square image, max 1MB (JPG, PNG)"
                  maxSize={1}
                  previewSize="sm"
                  aspectRatio="1:1"
                  rounded={true}
                  className="mb-2"
                />
                {(errors as any).icon?.message && (
                  <p className="text-red-500 text-xs">
                    {(errors as any).icon?.message}
                  </p>
                )}
                <input type="hidden" {...register("icon")} value={iconUrl} />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Title"
                  error={(errors as any).title?.message}
                  icon={<User size={16} />}
                >
                  <input
                    {...register("title", {
                      required: "Title is required",
                      onChange: (e) => {
                        const titleValue = e.target.value;
                        setValue("slug", Slugify(titleValue));
                      },
                    })}
                    placeholder="Enter post title"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Slug"
                  error={(errors as any).slug?.message}
                  icon={<Mail size={16} />}
                >
                  <input
                    {...register("slug", {
                      required: "Slug is required",
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message: "Invalid slug format",
                      },
                    })}
                    placeholder="Enter post slug"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Excerpt"
                  error={(errors as any).excerpt?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("excerpt")}
                    placeholder="Enter post excerpt"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Content"
                  error={(errors as any).content?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("content")}
                    placeholder="Enter post content"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Author"
                  error={(errors as any).author_id?.message}
                  icon={<User size={16} />}
                >
                  <select
                    {...register("author_id", {
                      required: "Author is required",
                      valueAsNumber: true,
                    })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Author</option>
                    {authors.map((author:any) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Category"
                  error={(errors as any).category_id?.message}
                  icon={<User size={16} />}
                >
                  <select
                    {...register("category_id", {
                      required: "Category is required",
                      valueAsNumber: true,
                    })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category:any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Status"
                  error={(errors as any).is_published?.message}
                  icon={<BadgeCheck size={16} />}
                >
                  <select
                    {...register("is_published", { valueAsNumber: true })}
                    className="border-gray-300 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  >
                    <option value="">Select Status</option>
                    <option value={1}>Published</option>
                    <option value={0}>Draft</option>
                  </select>

                  <div className="text-gray-500 pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </FormField>

                <FormField
                  label="Published At"
                  error={(errors as any).published_at?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("published_at")}
                    placeholder="Enter publish date"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                    type="datetime-local"
                  />
                </FormField>
              </div>
              <SEOForm
                getValues={getValues}
                register={register}
                setValue={setValue}
                errors={errors}
              />
              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/blogs")}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center rounded-md border px-5 py-2.5 font-medium transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {isEdit ? "Update Post" : "Create Post"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default BlogPostAction;
