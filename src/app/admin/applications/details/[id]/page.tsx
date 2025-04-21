"use client";

import React, { useEffect, useState } from "react";
import {
  Copy,
  Check,
  User,
  CreditCard,
  Info,
  Calendar,
  UserCircle,
  Image as ImageIcon,
} from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  retrieveApplicationDetailsController,
  updateApplicationController,
} from "@/app/lib/actions/application/application.controller";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { getSessionController } from "@/app/lib/actions/auth/auth.controller";
import constant from "@/constant";

// Types
type ApplicationType =
  | "NEW_BMET"
  | "78_VERIFY"
  | "BMET_UPDATE"
  | "PDO_REGISTRATION"
  | "ALL_CORRECTION"
  | "LD_TAX";

interface ApplicationData {
  fullName?: string;
  passportNo?: string;
  nidNo?: string;
  country?: string;
  profession?: string;
  mobileNo?: string;
  ttc?: string;
  correctionDetails?: string;
  division?: string;
  district?: string;
  profileImage?: string;
  passportCopy?: string;
}

interface Application {
  id: number;
  type: ApplicationType;
  data: ApplicationData;
  feeApplied: number;
  action_by: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface InfoFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
}

interface ApplicationDetailsProps {
  params: {
    id: string;
  };
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon: Icon,
  label,
  value,
  copyable = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value || value === "N/A") return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 mb-4 flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="dark:bg-gray-700 rounded-full bg-white p-2">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {label}
          </p>
          <p className="text-base font-semibold">{value || "N/A"}</p>
        </div>
      </div>
      {copyable && value && value !== "N/A" && (
        <button
          onClick={handleCopy}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  params,
}: any) => {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (params.id) {
        const res = await retrieveApplicationDetailsController(params.id);
        setApplication(res.data);
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [params.id]);

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    const user = await getSessionController();

    if (application) {
      await updateApplicationController({
        id: application.id,
        status: newStatus,
        action_by: user?.id,
      });
      setApplication((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  const getApplicationDetails = (application: Application) => {
    const { type, data } = application;
    switch (type) {
      case "NEW_BMET":
        return {
          name: data.fullName || "N/A",
          passportNo: data.passportNo || "N/A",
          nidNo: data.nidNo || "N/A",
          additionalInfo: `Country: ${data.country}, Profession: ${data.profession}`,
          profileImage: data.profileImage
            ? `${constant.baseUrl}/api/files?fileName=${data.profileImage}`
            : null,
          passportCopy: data.passportCopy
            ? `${constant.baseUrl}/api/files?fileName=${data.passportCopy}`
            : null,
        };
      case "78_VERIFY":
        return {
          name: "N/A",
          passportNo: data.passportNo || "N/A",
          nidNo: "N/A",
          additionalInfo: `Mobile No: ${data.mobileNo}`,
        };
      case "BMET_UPDATE":
        return {
          name: "N/A",
          passportNo: data.passportNo || "N/A",
          nidNo: "N/A",
          additionalInfo: `Country: ${data.country}, Profession: ${data.profession}`,
          passportCopy: data.passportCopy
            ? `${constant.baseUrl}/api/files?fileName=${data.passportCopy}`
            : null,
        };
      case "PDO_REGISTRATION":
        return {
          name: "N/A",
          passportNo: data.passportNo || "N/A",
          nidNo: "N/A",
          additionalInfo: `TTC: ${data.ttc}, Country: ${data.country}`,
          profileImage: data.profileImage
            ? `${constant.baseUrl}/api/files?fileName=${data.profileImage}`
            : null,
          passportCopy: data.passportCopy
            ? `${constant.baseUrl}/api/files?fileName=${data.passportCopy}`
            : null,
        };
      case "ALL_CORRECTION":
        return {
          name: "N/A",
          passportNo: data.passportNo || "N/A",
          nidNo: "N/A",
          additionalInfo: `Correction Details: ${data.correctionDetails}`,
        };
      case "LD_TAX":
        return {
          name: "N/A",
          passportNo: "N/A",
          nidNo: "N/A",
          additionalInfo: `Division: ${data.division}, District: ${data.district}`,
        };
      default:
        return {
          name: "N/A",
          passportNo: "N/A",
          nidNo: "N/A",
          additionalInfo: "N/A",
        };
    }
  };

  const {
    name,
    passportNo,
    nidNo,
    additionalInfo,
    profileImage,
    passportCopy,
  } = getApplicationDetails(application);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="dark:bg-gray-800 mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
          <div className="border-gray-200 dark:border-gray-700 border-b p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Application Details</h2>
              <span className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-medium">
                {application.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <div className="p-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left font-semibold uppercase">
                  <th className="p-4">Field</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Full Name</td>
                  <td className="p-4">{name}</td>
                  <td className="p-4">
                    <InfoField icon={User} label="Full Name" value={name} />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Passport Number</td>
                  <td className="p-4">{passportNo}</td>
                  <td className="p-4">
                    <InfoField
                      icon={CreditCard}
                      label="Passport Number"
                      value={passportNo}
                    />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">NID Number</td>
                  <td className="p-4">{nidNo}</td>
                  <td className="p-4">
                    <InfoField
                      icon={CreditCard}
                      label="NID Number"
                      value={nidNo}
                    />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Additional Information</td>
                  <td className="p-4">{additionalInfo}</td>
                  <td className="p-4">
                    <InfoField
                      icon={Info}
                      label="Additional Information"
                      value={additionalInfo}
                    />
                  </td>
                </tr>
                {profileImage && (
                  <tr className="dark:border-gray-700 border-b">
                    <td className="p-4">Profile Image</td>
                    <td className="p-4">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-32 w-32 rounded object-cover"
                      />
                    </td>
                    <td className="p-4"></td>
                  </tr>
                )}
                {passportCopy && (
                  <tr className="dark:border-gray-700 border-b">
                    <td className="p-4">Passport Copy</td>
                    <td className="p-4">
                      <img
                        src={passportCopy}
                        alt="Passport Copy"
                        className="h-32 w-32 rounded object-cover"
                      />
                    </td>
                    <td className="p-4"></td>
                  </tr>
                )}
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Action By</td>
                  <td className="p-4">{application.action_by}</td>
                  <td className="p-4">
                    <InfoField
                      icon={UserCircle}
                      label="Action By"
                      value={application.action_by}
                    />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Fee Applied</td>
                  <td className="p-4">
                    ${Number(application.feeApplied).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <InfoField
                      icon={CreditCard}
                      label="Fee Applied"
                      value={`$${Number(application.feeApplied).toFixed(2)}`}
                    />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Created At</td>
                  <td className="p-4">{formatDate(application.createdAt)}</td>
                  <td className="p-4">
                    <InfoField
                      icon={Calendar}
                      label="Created At"
                      value={formatDate(application.createdAt)}
                      copyable={false}
                    />
                  </td>
                </tr>
                <tr className="dark:border-gray-700 border-b">
                  <td className="p-4">Status</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange("approved")}
                        disabled={application.status !== "pending"}
                        className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange("rejected")}
                        disabled={application.status !== "pending"}
                        className="rounded bg-red px-4 py-2 text-white disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                  <td className="p-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ApplicationDetails;
