import React, { useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import Select from "react-select";

type BulkActionProps = {
  ids: number[];
  onDelete: (id: number, source: string) => void;
  setIsLoading: any;
  handleRetrieve: () => void;
};

type ActionOption = {
  value: number;
  label: string;
};

export default function BulkActionButtons({
  ids,
  onDelete,
  setIsLoading,
  handleRetrieve,
}: BulkActionProps) {
  const [selectValue, setSelectValue] = useState<ActionOption | null>(null);

  const handleChange = (selectedOption: ActionOption | null) => {
    setSelectValue(selectedOption);
  };

  const handleAction = async () => {
    if (selectValue && Array.isArray(ids) && ids.length) {
      confirmAlert({
        title: "Confirmation",
        message:
          "This will permanently delete the selected items. This action cannot be undone. Are you sure you want to proceed?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              setIsLoading(true);

              if (selectValue && selectValue.value === 2) {
                for (const id of ids) {
                  onDelete(id, "bulk");
                }
                handleRetrieve();
              }
              setTimeout(() => {
                setIsLoading(false);
                handleRetrieve();
              }, 2000);
            },
          },
          {
            label: "No",
          },
        ],
      });
      handleRetrieve();
    }
  };

  const actions: ActionOption[] = [
    { value: 1, label: "Bulk actions" },
    { value: 2, label: "Delete" },
  ];

  return (
    <div className="mb-3 flex items-center">
      <Select
        tabIndex={0}
        openMenuOnFocus={true}
        className="w-52"
        options={actions}
        onChange={handleChange}
        value={selectValue}
      />
      <button
        onClick={handleAction}
        className="ml-3 rounded border-2 border-primary px-3 py-1 text-primary"
      >
        Apply
      </button>
    </div>
  );
}
