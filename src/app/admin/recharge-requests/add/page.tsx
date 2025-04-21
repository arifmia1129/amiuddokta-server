"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createRechargeRequestController } from "@/app/lib/actions/recharge-request/recharge-request.controller";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

function CreateRechargeRequest() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await createRechargeRequestController(data);
      if (res?.success) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const rechargeTypes = [
    { value: "bkash", label: "bKash" },
    { value: "rocket", label: "Rocket" },
    { value: "nagad", label: "Nagad" },
  ];

  return (
    <DefaultLayout>
      <div className="bg-white p-5 shadow-md">
        <h3 className="mb-4 text-xl font-semibold">Submit Recharge Request</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Recharge Type</label>
              <select
                {...register("type", { required: "Recharge type is required" })}
                className="w-full rounded border px-4 py-2"
              >
                <option value="">Select Recharge Type</option>
                {rechargeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs">
                  {(errors as any).type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">From Account</label>
              <input
                {...register("from_account", {
                  required: "From account is required",
                })}
                placeholder="Enter the account number you're sending from"
                className="w-full rounded border px-4 py-2"
              />
              {errors.from_account && (
                <p className="text-red-500 text-xs">
                  {(errors as any).from_account.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Amount must be greater than 0" },
                })}
                type="number"
                step="0.01"
                placeholder="Enter recharge amount"
                className="w-full rounded border px-4 py-2"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs">
                  {(errors as any).amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Transaction ID
              </label>
              <input
                {...register("transaction_id", {
                  required: "Transaction ID is required",
                })}
                placeholder="Enter the transaction ID"
                className="w-full rounded border px-4 py-2"
              />
              {errors.transaction_id && (
                <p className="text-red-500 text-xs">
                  {(errors as any).transaction_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Recharge Request"}
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}

export default CreateRechargeRequest;
