"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  createPaymentMethodController,
  retrievePaymentMethodByIdController,
  updatePaymentMethodController,
} from "@/app/lib/actions/paymentMethod/paymentMethod.controller";
import FeatureImageUploader from "@/components/Editor/FeatureImageUploader";

const PaymentMethodForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const paymentMethodId = parseInt(id ? id : "");

  useEffect(() => {
    if (paymentMethodId) {
      const fetchPaymentMethod = async () => {
        setIsLoading(true);
        const res = await retrievePaymentMethodByIdController(paymentMethodId);
        if (res.success) {
          const { data } = res;
          setValue("payment_method", data.payment_method);
          setValue("type", data.type);
          setValue("account", data.account);
          setValue("details", data.details);
          setImageUrl(data.logo);
        }
        setIsLoading(false);
      };
      fetchPaymentMethod();
    }
  }, [paymentMethodId, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = { ...data, logo: imageUrl };
      const res = paymentMethodId
        ? await updatePaymentMethodController(paymentMethodId, payload)
        : await createPaymentMethodController(payload);

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/payment-methods");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold">
          {paymentMethodId ? "Update" : "Create"} Payment Method
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Payment Method
            </label>
            <input
              {...register("payment_method", { required: "Name is required" })}
              className="w-full rounded-lg border p-2.5"
              placeholder="e.g., Bkash, Rocket, Nagad"
            />
            {(errors as any).payment_method && (
              <small className="text-red">
                {(errors as any).payment_method.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              {...register("type", { required: "Type is required" })}
              className="w-full rounded-lg border p-2.5"
              defaultValue=""
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="send_money">Send Money</option>
              <option value="payment">Payment</option>
              <option value="other">Other</option>
            </select>
            {(errors as any)?.type && (
              <small className="text-red-500">
                {(errors as any).type.message}
              </small>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Account</label>
            <input
              {...register("account")}
              className="w-full rounded-lg border p-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Details</label>
            <textarea
              {...register("details")}
              className="w-full rounded-lg border p-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image</label>
            <FeatureImageUploader
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              height={300}
              width={300}
              placeholder="Set payment method logo"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-5 py-2.5 text-white"
          >
            {isLoading ? "Saving..." : paymentMethodId ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default PaymentMethodForm;
