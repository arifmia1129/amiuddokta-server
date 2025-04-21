"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Pagination from "@/components/Share/Pagination";
import {
  deleteAgentFeeController,
  retrieveAgentFeeListController,
  searchAgentFeeController,
} from "@/app/lib/actions/agent-fee/agent-fee.controller";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";

export default function AgentFeeList() {
  const [feeList, setFeeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetData = async () => {
    setIsLoading(true);
    const res = await retrieveAgentFeeListController({
      page: currentPage,
      pageSize: limit,
    });

    const { data, totalLength } = res.data;
    setFeeList(data);
    setTotal(totalLength);
    setIsLoading(false);
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit]);

  const handleDelete = async (id: number) => {
    confirmAlert({
      title: "Confirmation",
      message: "Are you sure you want to delete this agent fee?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const res = await deleteAgentFeeController(id);
            if (res?.success) {
              toast.success(res?.message);
              handleGetData();
            }
          },
        },
        { label: "No" },
      ],
    });
  };

  const onSearch = async (searchText: string) => {
    setIsLoading(true);
    const res = await searchAgentFeeController(
      { keyword: searchText },
      { page: currentPage, pageSize: limit },
    );

    const { data, totalLength } = res.data;
    setFeeList(data);
    setTotal(totalLength);
    setIsLoading(false);
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
            Agent Fees
          </h4>
          <Link
            href="/admin/agent-fees/add"
            className="hover:bg-primary-dark inline-flex items-center rounded-md bg-primary px-4 py-2 text-white transition"
          >
            Add New
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Search onSearch={onSearch} />
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left font-semibold uppercase dark:bg-meta-4">
                  <th className="p-4">Agent</th>
                  <th className="p-4">Sub Agent</th>
                  <th className="p-4">Application Type</th>
                  <th className="p-4">Fee Per Application</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeList.map((fee: any) => (
                  <tr key={fee.id} className="border-b dark:border-meta-4">
                    <td className="p-4">{fee.agentName}</td>
                    <td className="p-4">{fee.subAgentName || "N/A"}</td>
                    <td className="p-4">{fee.applicationType}</td>
                    <td className="p-4">
                      ${Number(fee?.feePerApplication)?.toFixed(2)}
                    </td>
                    <td className="p-4">{formatDate(fee.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          total={total}
        />
      </div>
    </DefaultLayout>
  );
}
