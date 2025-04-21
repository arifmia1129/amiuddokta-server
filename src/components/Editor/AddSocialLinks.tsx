import React from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function AddSocialLinks({
  fields,
  register,
  remove,
  append,
}: any) {
  const socialLinkOptions = [
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
  ];
  return (
    <div className="m-6">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        Social Links
      </label>
      {fields.map((field: any, index: number) => (
        <div key={field.id} className="mb-4 flex items-center space-x-4">
          <div className="relative w-1/3">
            <select
              {...register(`social_links.${index}.name`, {
                required: true,
              })}
              className="w-full appearance-none rounded border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option
                value=""
                disabled
                className="text-body dark:text-bodydark"
              >
                Select Social Link
              </option>

              {socialLinkOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-body dark:text-bodydark"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <MdKeyboardArrowDown
              size={30}
              className="absolute right-2 top-1.5"
            />
          </div>
          <input
            {...register(`social_links.${index}.link`, {
              required: true,
            })}
            type="text"
            placeholder="Enter link"
            className="w-2/3 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="mt-4 flex w-full justify-center rounded-lg border px-4 py-2 text-white transition hover:bg-opacity-90">
        <button
          className="w-44 rounded border border-primary bg-primary px-2 py-2 text-center"
          type="button"
          onClick={() => append({ name: "", link: "" })}
        >
          Add Social Link
        </button>
      </div>
    </div>
  );
}
