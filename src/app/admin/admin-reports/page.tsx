"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Pagination from "@/components/Share/Pagination";
import Loader from "@/components/common/Loader";
import { formatDate } from "@/utils/functions";
import { retrieveAdminReportController } from "@/app/lib/actions/application/application.controller";
import { retrieveAdminListController } from "@/app/lib/actions/user-bk/user.controller";

export default function AdminReportList() {
  const [reportList, setReportList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("approved");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adminList, setAdminList] = useState<any[]>([]);
  const [summary, setSummary] = useState({ today: 0, weekly: 0, monthly: 0 });

  const handleGetData = async () => {
    setIsLoading(true);
    const admins = await retrieveAdminListController({
      page: 1,
      pageSize: 1000,
    });

    if (Array.isArray(admins?.data?.data) && admins?.data?.data?.length) {
      setAdminList(admins?.data?.data);
    }

    try {
      const res = await retrieveAdminReportController({
        page: currentPage,
        pageSize: limit,
        adminId: selectedAdmin ? parseInt(selectedAdmin) : undefined,
        status: selectedStatus,
        startDate,
        endDate,
      });

      const { data, totalLength, summary } = res?.data || {};
      setReportList(data);
      setTotal(totalLength);
      setSummary(summary);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch admin reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, limit, selectedAdmin, selectedStatus, startDate, endDate]);

  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white px-6 py-4 shadow-md dark:bg-boxdark">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-semibold">Admin Reports</h4>
          <div className="flex items-center space-x-4">
            <select
              className="form-select border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg"
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
            >
              <option value="">Select Admin</option>
              {adminList.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
            {/* <select
              className="form-select border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="date"
              className="form-input border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="form-input border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            /> */}
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="mb-4 flex justify-between">
              <div>
                <h5 className="text-lg font-semibold">Summary</h5>
                <p>Today: ৳{summary?.today.toFixed(2)}</p>
                <p>This Week: ৳{summary?.weekly.toFixed(2)}</p>
                <p>This Month: ৳{summary?.monthly.toFixed(2)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-left font-semibold uppercase dark:bg-meta-4">
                    <th className="p-4">Admin Name</th>
                    <th className="p-4">Application Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Fee Applied</th>
                    <th className="p-4">Action Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportList?.map((report: any) => (
                    <tr key={report.id} className="border-b dark:border-meta-4">
                      <td className="p-4">{report.adminName}</td>
                      <td className="p-4">{report.type}</td>
                      <td className="p-4">{report.status}</td>
                      <td className="p-4">
                        ৳{Number(report.feeApplied).toFixed(2)}
                      </td>
                      <td className="p-4">{formatDate(report.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
