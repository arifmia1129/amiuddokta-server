import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Plus,
  Trash2,
  Type,
  AlignLeft,
  KeyRound,
  ToggleRight,
  Image as ImageIcon,
  Settings as SettingsIcon,
} from "lucide-react";

import SettingImageUploader from "./SettingImageUploader";
import AsyncSelect from "react-select/async";

export default function AddSetting({
  fields,
  register,
  remove,
  append,
  setValue,
  control,
}: any) {
  const [inputTypes, setInputTypes] = useState(
    fields.map((field: any) => field.type || "text"),
  );
  const [imageUrls, setImageUrls] = useState(
    fields.map((field: any) => field.value || ""),
  );

  useEffect(() => {
    fields.forEach((field: any, index: number) => {
      register(`setting_fields.${index}.name`, { required: true });
      register(`setting_fields.${index}.type`, { required: true });
      register(`setting_fields.${index}.value`, { required: true });
      setValue(`setting_fields.${index}.name`, field.name);
      setValue(`setting_fields.${index}.type`, inputTypes[index]);
      setValue(`setting_fields.${index}.value`, field.value);

      if (inputTypes[index] === "image") {
        setValue(`setting_fields.${index}.value`, imageUrls[index]);
      }
    });
  }, [fields, inputTypes, imageUrls, register, setValue]);

  const handleTypeChange = (index: number, type: string) => {
    const newInputTypes = [...inputTypes];
    newInputTypes[index] = type;
    setInputTypes(newInputTypes);
    setValue(`setting_fields.${index}.type`, type);

    if (type !== "image") {
      setValue(`setting_fields.${index}.value`, "");
    } else {
      setValue(`setting_fields.${index}.value`, imageUrls[index]);
    }
  };

  const handleImageUrlChange = (index: number, url: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = url;
    setImageUrls(newImageUrls);
    setValue(`setting_fields.${index}.value`, url);
  };

  useEffect(() => {
    if (Array.isArray(fields) && fields.length && !inputTypes.length) {
      setInputTypes(fields?.map((field) => field.type));
    }
  }, [fields, inputTypes]);

  useEffect(() => {
    if (Array.isArray(fields) && fields.length && !imageUrls.length) {
      setImageUrls(fields?.map((field) => field.value));
    }
  }, [fields, imageUrls]);

  // Get icon based on input type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type size={18} className="text-gray-500" />;
      case "textarea":
        return <AlignLeft size={18} className="text-gray-500" />;
      case "password":
        return <KeyRound size={18} className="text-gray-500" />;
      case "select":
        return <ToggleRight size={18} className="text-gray-500" />;
      case "image":
        return <ImageIcon size={18} className="text-gray-500" />;
      default:
        return <Type size={18} className="text-gray-500" />;
    }
  };

  return (
    <div className="dark:bg-gray-800 w-full rounded-xl bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center">
        <SettingsIcon className="mr-2 text-primary" size={20} />
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Settings Configuration
        </h2>
      </div>

      {fields.length === 0 ? (
        <div className="border-gray-300 dark:border-gray-600 rounded-lg border-2 border-dashed p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No settings added yet
          </p>
          <button
            type="button"
            onClick={() => {
              append({ name: "", value: "", type: "text" });
              handleTypeChange(inputTypes.length, "text");
            }}
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus size={18} className="mr-2" />
            Add First Setting
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {fields.map((field: any, index: number) => (
              <div
                key={field.id}
                className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg border p-4 transition-all hover:shadow-md"
              >
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                  <div className="w-full md:w-1/4">
                    <label className="text-gray-600 dark:text-gray-400 mb-1 block text-xs font-medium">
                      Setting Type
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {getTypeIcon(inputTypes[index])}
                      </div>
                      <select
                        defaultValue={field.type}
                        {...register(`setting_fields.${index}.type`, {
                          required: true,
                        })}
                        onChange={(e) =>
                          handleTypeChange(index, e.target.value)
                        }
                        value={inputTypes[index]}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="password">Password</option>
                        <option value="select">Yes/No</option>
                        <option value="image">Image</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full md:w-1/4">
                    <label className="text-gray-600 dark:text-gray-400 mb-1 block text-xs font-medium">
                      Setting Name
                    </label>
                    <input
                      {...register(`setting_fields.${index}.name`, {
                        required: true,
                      })}
                      type="text"
                      defaultValue={field.name}
                      placeholder="Setting name"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="text-gray-600 dark:text-gray-400 mb-1 block text-xs font-medium">
                      Setting Value
                    </label>
                    {inputTypes[index] === "text" && (
                      <input
                        defaultValue={field.value}
                        {...register(`setting_fields.${index}.value`, {
                          required: true,
                        })}
                        type="text"
                        placeholder="Setting value"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    )}

                    {inputTypes[index] === "textarea" && (
                      <textarea
                        defaultValue={field.value}
                        {...register(`setting_fields.${index}.value`, {
                          required: true,
                        })}
                        placeholder="Setting value"
                        rows={3}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      ></textarea>
                    )}

                    {inputTypes[index] === "password" && (
                      <input
                        defaultValue={field.value}
                        {...register(`setting_fields.${index}.value`, {
                          required: true,
                        })}
                        type="password"
                        placeholder="Setting value"
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    )}

                    {inputTypes[index] === "select" && (
                      <select
                        {...register(`setting_fields.${index}.value`, {
                          required: true,
                        })}
                        defaultValue={field.value}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value={"true"}>Yes</option>
                        <option value={"false"}>No</option>
                      </select>
                    )}

                    {inputTypes[index] === "image" && (
                      <div className="w-full">
                        <SettingImageUploader
                          imageUrl={imageUrls[index]}
                          setImageUrl={(url: string) =>
                            handleImageUrlChange(index, url)
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex w-full items-end pb-2 md:w-auto md:pb-0">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-red-500 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                      aria-label="Remove setting"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                append({ name: "", value: "", type: "text" });
                handleTypeChange(inputTypes.length, "text");
              }}
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus size={18} className="mr-2" />
              Add Setting
            </button>
          </div>
        </>
      )}
    </div>
  );
}
