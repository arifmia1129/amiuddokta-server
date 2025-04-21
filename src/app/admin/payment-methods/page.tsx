"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Pagination from "@/components/Share/Pagination";
import { formatDate } from "@/utils/functions";
import Loader from "@/components/common/Loader";
import Search from "@/components/Search/Search";
import {
  deletePaymentMethodController,
  retrievePaymentMethodListController,
  searchPaymentMethodController,
} from "@/app/lib/actions/paymentMethod/paymentMethod.controller";

export default function PaymentMethodList() {
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetData = async () => {
    setIsLoading(true);
    const res = await retrievePaymentMethodListController({
      page: currentPage,
      pageSize: limit,
    });

    if (res?.success) {
      const { data, totalLength } = res.data;
      setPaymentMethodList(data);
      setTotal(totalLength);
    } else {
      toast.error(res?.message || "Failed to fetch payment methods");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit]);

  const handleDelete = async (id: number) => {
    confirmAlert({
      title: "Confirmation",
      message: "Are you sure you want to delete this payment method?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const res = await deletePaymentMethodController(id);
            if (res?.success) {
              toast.success(res?.message);
              handleGetData();
            } else {
              toast.error(res?.message || "Failed to delete payment method");
            }
          },
        },
        { label: "No" },
      ],
    });
  };

  const onSearch = async (searchText: string) => {
    setIsLoading(true);
    const res = await searchPaymentMethodController(
      { keyword: searchText },
      { page: currentPage, pageSize: limit },
    );

    if (res?.success) {
      const { data, totalLength } = res.data;
      setPaymentMethodList(data);
      setTotal(totalLength);
    } else {
      toast.error(res?.message || "Search failed");
    }
    setIsLoading(false);
  };

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-gray-800 dark:text-gray-200 text-xl font-semibold">
            Payment Methods
          </h4>
          <Link
            href="/admin/payment-methods/add"
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
                  <th className="p-4">ID</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Account</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodList.map((method: any) => (
                  <tr key={method.id} className="border-b dark:border-meta-4">
                    <td className="p-4">{method.id}</td>
                    <td className="p-4">{method.payment_method}</td>
                    <td className="p-4">{method.account}</td>
                    <td className="p-4 capitalize">{method.type}</td>
                    <td className="p-4">{method.details || "N/A"}</td>
                    <td className="p-4">{formatDate(method.created_at)}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/payment-methods/add?id=${method.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(method.id)}
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
