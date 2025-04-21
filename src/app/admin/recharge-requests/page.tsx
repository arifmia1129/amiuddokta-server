"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Pagination from "@/components/Share/Pagination";
import {
  retrieveRechargeRequestListController,
  updateRechargeRequestStatusController,
  searchRechargeRequestController,
} from "@/app/lib/actions/recharge-request/recharge-request.controller";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";

export default function RechargeRequestList() {
  const [requestList, setRequestList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetData = async () => {
    setIsLoading(true);
    const res = await retrieveRechargeRequestListController({
      page: currentPage,
      pageSize: limit,
    });

    const { data, totalLength } = res.data;
    setRequestList(data);
    setTotal(totalLength);
    setIsLoading(false);
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit]);

  const handleUpdateStatus = async (
    id: number,
    status: "approved" | "rejected",
  ) => {
    confirmAlert({
      title: "Confirmation",
      message: `Are you sure you want to ${status} this recharge request?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const res = await updateRechargeRequestStatusController(id, status);
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
    const res = await searchRechargeRequestController(
      { keyword: searchText },
      { page: currentPage, pageSize: limit },
    );

    const { data, totalLength } = res.data;
    setRequestList(data);
    setTotal(totalLength);
    setIsLoading(false);
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
            Recharge Requests
          </h4>
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
                  <th className="p-4">User</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Account</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">TrxID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestList.map((request: any) => (
                  <tr key={request.id} className="border-b dark:border-meta-4">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{request.userName}</p>
                        <p className="text-gray-600 text-sm">
                          {request.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">{request.type}</td>
                    <td className="p-4">{request.fromAccount}</td>
                    <td className="p-4">{request.amount}</td>
                    <td className="p-4">{request.transactionId}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(request.createdAt)}</td>
                    <td className="p-4">
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(request.id, "approved")
                            }
                            className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(request.id, "rejected")
                            }
                            className="hover:bg-red-600 rounded bg-red px-2 py-1 text-xs text-white"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
