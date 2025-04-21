"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createApplicationController } from "@/app/lib/actions/application/application.controller";
import { retrieveUserListController } from "@/app/lib/actions/user-bk/user.controller";
import { retrieveAgentFeeListController } from "@/app/lib/actions/agent-fee/agent-fee.controller";

const CreateApplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [agentFees, setAgentFees] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const selectedType = watch("type");
  const selectedUserId = watch("user_id");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await retrieveUserListController({ page: 1, pageSize: 1000 });
      if (res.success) {
        setUsers(res.data.data);
      }
    };

    const fetchAgentFees = async () => {
      const res = await retrieveAgentFeeListController({
        page: 1,
        pageSize: 1000,
      });
      if (res.success) {
        setAgentFees(res.data.data);
      }
    };

    fetchUsers();
    fetchAgentFees();
  }, []);

  useEffect(() => {
    if (selectedType && selectedUserId) {
      const user = users.find(
        (u: any) => u.id === parseInt(selectedUserId),
      ) as any;
      const fee = agentFees.find(
        (f: any) =>
          f.applicationType === selectedType &&
          (f.agentId === user?.id || f.subAgentId === user?.id),
      ) as any;
      if (fee) {
        setValue("fee_applied", fee.feePerApplication);
      }
    }
  }, [selectedType, selectedUserId, users, agentFees, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await createApplicationController(data);
      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/applications");
      } else {
        toast.error(res?.message || "Failed to create application");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-boxdark">
        <h2 className="mb-6 text-2xl font-bold">Create Application</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">User</label>
            <select
              {...register("user_id", { required: "User is required" })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            >
              <option value="">Select User</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.user_id.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Application Type
            </label>
            <select
              {...register("type", {
                required: "Application type is required",
              })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            >
              <option value="">Select Application Type</option>
              <option value="78_VERIFY">78_VERIFY</option>
              <option value="NEW_BMET">NEW_BMET</option>
              <option value="BMET_UPDATE">BMET_UPDATE</option>
              <option value="PDO_REGISTRATION">PDO_REGISTRATION</option>
              <option value="ALL_CORRECTION">ALL_CORRECTION</option>
              <option value="LD_TAX">LD_TAX</option>
            </select>

            {errors.type && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.type.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fee Applied
            </label>
            <input
              type="number"
              step="0.01"
              {...register("fee_applied", {
                required: "Fee is required",
                min: { value: 0, message: "Fee must be non-negative" },
              })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
            {errors.fee_applied && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.fee_applied.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
            {errors.name && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              {...register("dob")}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Passport Number
            </label>
            <input
              type="text"
              {...register("passport_no")}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">NID Number</label>
            <input
              type="text"
              {...register("nid_no")}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Attachment</label>
            <input
              type="text"
              {...register("attachment")}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="hover:bg-primary-dark focus:ring-primary-light rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
          >
            {isLoading ? "Creating..." : "Create Application"}
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateApplication;
