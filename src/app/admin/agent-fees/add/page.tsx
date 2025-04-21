"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createAgentFeeController } from "@/app/lib/actions/agent-fee/agent-fee.controller";
import { retrieveUserListController } from "@/app/lib/actions/user-bk/user.controller";

const CreateAgentFee = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const selectedAgentId = watch("agent_id");

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await retrieveUserListController({ page: 1, pageSize: 1000 });
      if (res.success) {
        const agentList = res.data.data.filter(
          (user: any) => user.role === "agent",
        );
        setAgents(agentList);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchSubAgents = async () => {
      if (selectedAgentId) {
        const res = await retrieveUserListController({
          page: 1,
          pageSize: 1000,
        });
        if (res.success) {
          const subAgentList = res.data.data.filter(
            (user: any) =>
              user.role === "sub_agent" &&
              user.parent_id === parseInt(selectedAgentId),
          );
          setSubAgents(subAgentList);
        }
      } else {
        setSubAgents([]);
      }
    };

    fetchSubAgents();
  }, [selectedAgentId]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await createAgentFeeController(data);
      if (res?.success) {
        toast.success(res.message);
        router.push("/admin/agent-fees");
      } else {
        toast.error(res?.message || "Failed to create agent fee");
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
        <h2 className="mb-6 text-2xl font-bold">Create Agent Fee</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Agent</label>
            <select
              {...register("agent_id", { required: "Agent is required" })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            >
              <option value="">Select Agent</option>
              {agents.map((agent: any) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {errors.agent_id && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.agent_id.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Sub Agent (Optional)
            </label>
            <select
              {...register("sub_agent_id")}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            >
              <option value="">Select Sub Agent</option>
              {subAgents.map((subAgent: any) => (
                <option key={subAgent.id} value={subAgent.id}>
                  {subAgent.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Application Type
            </label>
            <select
              {...register("application_type", {
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

            {errors.application_type && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.application_type.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fee Per Application
            </label>
            <input
              type="number"
              step="0.01"
              {...register("fee_per_application", {
                required: "Fee per application is required",
                min: { value: 0, message: "Fee must be non-negative" },
              })}
              className="border-gray-300 w-full rounded-lg border p-2.5"
            />
            {errors.fee_per_application && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.fee_per_application.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="hover:bg-primary-dark focus:ring-primary-light rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
          >
            {isLoading ? "Creating..." : "Create Agent Fee"}
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateAgentFee;
