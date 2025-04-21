"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  User,
  Mail,
  Info,
  ArrowLeft,
  Save,
  Loader2,
  Users,
} from "lucide-react";
import FormField from "@/components/Share/Form/FormField";
import {
  createContactForm,
  getContactFormById,
  updateContactForm,
} from "@/app/lib/actions/contactForm/contactForm.controller";

function ContactAction({ params }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [existingContactInfo, setExistingContactInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (params.action === "edit" && id) {
      setIsEdit(true);
    }
  }, [params.action, id]);

  const {
    register,
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
      const { data } = await getContactFormById({ id: id ? id : 0 });
      if (data) {
        setExistingContactInfo(data);
        reset(data);
      } else {
        toast.error("Contact form not found");
        router.push("/admin/contact-forms");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load contact form data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && !existingContactInfo) {
      handleRetrieveData();
    }
  }, [id, existingContactInfo]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res;
      if (id && existingContactInfo) {
        res = await updateContactForm({
          id: id,
          data,
        });
      } else {
        res = await createContactForm(data);
      }

      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/contact-forms");
        if (id && existingContactInfo) await handleRetrieveData();
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
            <p className="text-gray-600 mt-4">Loading contact form data...</p>
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
            onClick={() => router.push("/admin/contact-forms")}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Contact Forms
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-black">
          <div className="border-b bg-gradient-to-r from-blue-50 to-white p-6 dark:bg-black">
            <h3 className="text-gray-800 flex items-center text-2xl font-bold">
              {isEdit ? (
                <>
                  <User size={24} className="mr-2 text-blue-600" /> Edit
                  Contact Form
                </>
              ) : (
                <>
                  <Users size={24} className="mr-2 text-blue-600" /> Add New
                  Contact Form
                </>
              )}
            </h3>
            <p className="text-gray-500 mt-1">
              {isEdit ? "Update contact form information" : "Create a new contact form"}
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
                      Contact Form Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      Please fill in all required fields for the contact form.
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Name"
                  error={(errors as any).name?.message}
                  icon={<User size={16} />}
                >
                  <input
                    {...register("name", {
                      required: "Name is required",
                    })}
                    placeholder="Enter your name"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Email"
                  error={(errors as any).email?.message}
                  icon={<Mail size={16} />}
                >
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="Enter your email"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 pl-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Subject"
                  error={(errors as any).subject?.message}
                  icon={<Info size={16} />}
                >
                  <input
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                    placeholder="Enter the subject"
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>

                <FormField
                  label="Message"
                  error={(errors as any).message?.message}
                  icon={<Info size={16} />}
                >
                  <textarea
                    {...register("message", {
                      required: "Message is required",
                    })}
                    placeholder="Enter your message"
                    rows={4}
                    className="border-gray-300 w-full rounded-md border px-4 py-2.5 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black"
                  />
                </FormField>
              </div>
              <div className="flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/contact-forms")}
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
                      {isEdit ? "Update Contact Form" : "Create Contact Form"}
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

export default ContactAction;
