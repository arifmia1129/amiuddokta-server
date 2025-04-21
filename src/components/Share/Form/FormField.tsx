import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  icon?: ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  icon,
}) => (
  <div className="mb-4 dark:bg-black">
    <label className="text-gray-700 mb-1.5 flex items-center text-sm font-medium">
      {icon && <span className="text-gray-500 mr-2">{icon}</span>}
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 flex items-center text-sm text-red">
        <AlertCircle size={14} className="mr-1" /> {error}
      </p>
    )}
  </div>
);

export default FormField;
