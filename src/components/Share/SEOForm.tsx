"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Tag,
  Link,
  Image as ImageIcon,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import ImageUploader from "@/components/Editor/ImageUploader";

interface SEOFormProps {
  register: any;
  errors: any;
  setValue: any;
  getValues: any;
}

const SEOForm: React.FC<SEOFormProps> = ({
  register,
  errors,
  setValue,
  getValues,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState(getValues("og_image") || "");

  const handleOgImageUploadSuccess = (url: string) => {
    setOgImageUrl(url);
    setValue("og_image", url);
  };

  return (
    <div className="border-gray-200 dark:border-gray-700 mt-8 rounded-lg border bg-white shadow-sm dark:bg-black">
      <div
        className="bg-gray-50 dark:bg-gray-800 flex cursor-pointer items-center justify-between p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Search className="h-5 w-5 text-blue-600" />
          <h3 className="text-gray-800 ml-2 text-lg font-medium dark:text-white">
            SEO Settings
          </h3>
        </div>
        <button type="button" className="text-gray-500 hover:text-gray-700">
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="mb-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Optimize your content for search engines to improve visibility.
              Fields left empty will default to their respective content values.
            </p>
          </div>

          <div className="space-y-6">
            {/* Meta Title */}
            <FormField
              label="Meta Title"
              error={errors?.meta_title?.message}
              icon={<Tag size={16} />}
            >
              <input
                {...register("meta_title", {
                  maxLength: {
                    value: 70,
                    message: "Meta title should be less than 70 characters",
                  },
                })}
                placeholder="Enter meta title"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            {/* Meta Description */}
            <FormField
              label="Meta Description"
              error={errors?.meta_description?.message}
              icon={<Search size={16} />}
            >
              <textarea
                {...register("meta_description", {
                  maxLength: {
                    value: 160,
                    message:
                      "Meta description should be less than 160 characters",
                  },
                })}
                placeholder="Enter meta description"
                rows={3}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            {/* Meta Keywords */}
            <FormField
              label="Meta Keywords"
              error={errors?.meta_keywords?.message}
              icon={<Tag size={16} />}
            >
              <input
                {...register("meta_keywords")}
                placeholder="keyword1, keyword2, keyword3"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            <hr className="border-gray-200 dark:border-gray-700 my-4" />

            <h4 className="text-gray-700 dark:text-gray-300 mb-3 flex items-center text-base font-medium">
              <Globe size={16} className="mr-2 text-blue-600" />
              Open Graph Data (Social Sharing)
            </h4>

            {/* OG Title */}
            <FormField
              label="OG Title"
              error={errors?.og_title?.message}
              icon={<Tag size={16} />}
            >
              <input
                {...register("og_title")}
                placeholder="Title for social media sharing"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            {/* OG Description */}
            <FormField
              label="OG Description"
              error={errors?.og_description?.message}
              icon={<Search size={16} />}
            >
              <textarea
                {...register("og_description")}
                placeholder="Description for social media sharing"
                rows={3}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            {/* OG Image */}
            <div className="space-y-2">
              <label className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
                OG Image
              </label>
              <ImageUploader
                imageUrl={ogImageUrl}
                setImageUrl={setOgImageUrl}
                onUploadSuccess={handleOgImageUploadSuccess}
                title=""
                description="Recommended: 1200x630px image for optimal social sharing"
                maxSize={2}
                previewSize="md"
                aspectRatio="1.91:1"
                rounded={false}
                className="mb-2"
                id="seo-image-uploader"
              />
              {errors?.og_image?.message && (
                <p className="text-red-500 text-xs">
                  {errors?.og_image?.message}
                </p>
              )}
              <input type="hidden" {...register("og_image")} />
            </div>

            <hr className="border-gray-200 dark:border-gray-700 my-4" />

            <h4 className="text-gray-700 dark:text-gray-300 mb-3 flex items-center text-base font-medium">
              <Code size={16} className="mr-2 text-blue-600" />
              Advanced SEO Settings
            </h4>

            {/* Canonical URL */}
            <FormField
              label="Canonical URL"
              error={errors?.canonical_url?.message}
              icon={<Link size={16} />}
            >
              <input
                {...register("canonical_url")}
                placeholder="https://example.com/canonical-path"
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>

            {/* Indexing Status */}
            <FormField
              label="Indexing Status"
              error={errors?.index_status?.message}
              icon={<Search size={16} />}
            >
              <select
                {...register("index_status")}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              >
                <option value="index">Index</option>
                <option value="noindex">No Index</option>
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

            {/* Sitemap Priority */}
            <FormField
              label="Sitemap Priority"
              error={errors?.sitemap_priority?.message}
              icon={<Globe size={16} />}
            >
              <select
                {...register("sitemap_priority")}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full appearance-none rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              >
                <option value="0.1">0.1 (Low)</option>
                <option value="0.3">0.3</option>
                <option value="0.5">0.5 (Default)</option>
                <option value="0.7">0.7</option>
                <option value="0.9">0.9</option>
                <option value="1.0">1.0 (High)</option>
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

            {/* Schema Markup */}
            <FormField
              label="Schema Markup (JSON-LD)"
              error={errors?.schema_markup?.message}
              icon={<Code size={16} />}
            >
              <textarea
                {...register("schema_markup", {
                  validate: (value: any) => {
                    if (!value) return true;
                    try {
                      JSON.parse(value);
                      return true;
                    } catch (e) {
                      return "Invalid JSON format";
                    }
                  },
                })}
                placeholder='{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "Service description"
}'
                rows={6}
                className="font-mono border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOForm;
