/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  createSettingController,
  retrieveSettingByIdController,
  updateSettingByIdController,
} from "@/app/lib/actions/setting/setting.controller";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "react-slugify";
import AddSetting from "@/components/Editor/AddSetting";
import { useDispatch } from "react-redux";
import { handleSetProjectName } from "@/utils/functions";

function CreateSetting() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingSettingInfo, setExistingSettingInfo] = useState(null);
  const [settingHtml, setSettingHtml] = useState<any>("");
  const [imageUrl, setImageUrl] = useState(null);

  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
    control,
    setValue,
  } = useForm({ mode: "onChange" });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "setting_fields",
  });

  const router = useRouter();

  const dispatch = useDispatch();

  const handleRetrieveData = async () => {
    const { data } = (await retrieveSettingByIdController(
      parseInt(id as any),
    )) as any;

    data[0].setting_fields =
      typeof data[0].setting_fields === "string"
        ? JSON.parse(data[0].setting_fields)
        : data[0].setting_fields;

    setExistingSettingInfo(data[0]);
    setImageUrl(data[0]?.profileImage);
    setSettingHtml(data[0].content);
    reset(data[0]);
  };

  useEffect(() => {
    if (id && !existingSettingInfo) {
      handleRetrieveData();
    }
  }, [id]);

  const onSubmit = async (data: any) => {
    if (Array.isArray(data.setting_fields) && data.setting_fields.length) {
      data.setting_fields = data.setting_fields.map(
        (settingField: { name: string; value: string; type: string }) => ({
          name: slugify(settingField.name, {
            delimiter: "_",
          }),
          type: settingField.type,
          value:
            settingField.type !== "select"
              ? settingField.value
              : settingField.value === "true",
        }),
      );
    }

    setIsLoading(true);
    try {
      let res;

      data.setting_fields = JSON.stringify(data.setting_fields);

      if (id && existingSettingInfo) {
        res = await updateSettingByIdController(data);
      } else {
        res = await createSettingController(data);
      }

      if (data?.module === "Global") {
        handleSetProjectName(dispatch);
      }
      if (res?.success) {
        toast.success(res.message);
        if (id && existingSettingInfo) {
          await handleRetrieveData();
        } else {
          if ((res as any)?.success) {
            router.push("/admin/settings");
            reset();
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      if (id && existingSettingInfo) {
        await handleRetrieveData();
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white py-5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            {id && existingSettingInfo ? "Edit" : "Add new"} setting
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-9 p-6.5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Module
              </label>
              <input
                {...register("module", {
                  required: "Module is required",
                })}
                type="text"
                placeholder="Module"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {errors.module && (
                <p role="alert">
                  <small className="text-rose-500">
                    {errors?.module?.message as string}
                  </small>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="m-2 w-[95%]">
              <AddSetting
                register={register}
                fields={fields}
                append={append}
                remove={remove}
                setValue={setValue}
                control={control}
              />
            </div>
          </div>

          <div className="mx-7 mt-10">
            <input
              type="submit"
              value={id ? "Update" : "Create"}
              className="w-44 cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
            />
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}

export default function WrappedCreateSetting() {
  return (
    <Suspense>
      <CreateSetting />
    </Suspense>
  );
}
