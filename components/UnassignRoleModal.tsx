"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useToastRef } from "@/contexts/ToastContext";
import { usePatchQuery } from "@/services/queries/patchQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import Button from "@/components/Button";

interface AssignedEmployee {
  id: number;
  employeeId: string;
  fullName: string;
}

interface Role {
  id: number;
  roleCode: string;
  name: string;
  description?: string;
}

interface UnassignRoleModalProps {
  visible: boolean;
  onHide: () => void;
  role: Role | null;
  onUnassigned: () => void;
}

const searchByOptions = [
  { label: "Select Option", value: "all" },
  { label: "Employee ID", value: "employeeId" },
  { label: "Full Name", value: "fullName" },
];

export default function UnassignRoleModal({
  visible,
  onHide,
  role,
  onUnassigned,
}: UnassignRoleModalProps) {
  const toastRef = useToastRef();
  const [searchBy, setSearchBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset state when modal opens/closes or role changes
  useEffect(() => {
    if (!visible) {
      setSelectedEmployees([]);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSearchBy("all");
    }
  }, [visible]);

  // Fetch employees already assigned to this role
  const { data: assignedEmployeesResponse, isLoading } = useGetQuery<any, any>(
    ["assigned-employees-unassign", role?.id ?? 0],
    `/roles/${role?.id}/assigned-employees`,
    { isCustomRole: false },
    {
      enabled: !!role && visible,
      toastRef,
    },
  );

  const allAssignedEmployees: AssignedEmployee[] = useMemo(() => {
    return assignedEmployeesResponse?.data?.assignedEmployees || [];
  }, [assignedEmployeesResponse]);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allAssignedEmployees;

    const lower = debouncedSearchTerm.toLowerCase();

    return allAssignedEmployees.filter((emp: AssignedEmployee) => {
      if (searchBy === "all") {
        return (
          emp.employeeId?.toLowerCase().includes(lower) ||
          emp.fullName?.toLowerCase().includes(lower)
        );
      }

      switch (searchBy) {
        case "employeeId":
          return emp.employeeId?.toLowerCase().includes(lower);
        case "fullName":
          return emp.fullName?.toLowerCase().includes(lower);
        default:
          return true;
      }
    });
  }, [allAssignedEmployees, debouncedSearchTerm, searchBy]);

  // Handle individual employee selection
  const handleEmployeeToggle = (employeeId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedEmployees((prev) =>
        prev.includes(employeeId) ? prev : [...prev, employeeId],
      );
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  // Select/Deselect all filtered employees
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const filteredIds = filteredEmployees.map(
        (emp: AssignedEmployee) => emp.id,
      );
      setSelectedEmployees((prev) => [
        ...prev,
        ...filteredIds.filter((id: number) => !prev.includes(id)),
      ]);
    } else {
      const filteredIds = new Set(
        filteredEmployees.map((emp: AssignedEmployee) => emp.id),
      );
      setSelectedEmployees((prev) => prev.filter((id) => !filteredIds.has(id)));
    }
  };

  const selectedFilteredCount = filteredEmployees.filter(
    (emp: AssignedEmployee) => selectedEmployees.includes(emp.id),
  ).length;

  const isAllSelected =
    filteredEmployees.length > 0 &&
    selectedFilteredCount === filteredEmployees.length;

  const unassignMutation = usePatchQuery({
    invalidateKey: ["roles", "employees"],
    toastRef,
  });

  const handleUnassign = async () => {
    if (!role) return;

    if (selectedEmployees.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least one employee to unassign.",
        life: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await unassignMutation.mutateAsync({
        url: `/Roles/unassign-roles`,
        body: {
          roleId: role.id,
          employeeIds: selectedEmployees,
        },
      });

      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Successfully unassigned ${selectedEmployees.length} employee(s) from "${role.name}".`,
        life: 5000,
      });

      setSelectedEmployees([]);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSearchBy("all");
      onUnassigned();
      onHide();
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message ||
          "Failed to unassign role. Please try again.",
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      showHeader={false}
      contentClassName="p-0 rounded-lg overflow-hidden"
      style={{ width: "650px" }}
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
    >
      <div className="bg-[#0086ED] p-4 flex justify-center items-center relative">
        <h2 className="text-white text-xl font-semibold">
          Unassign Employees from Role
        </h2>
        <button
          onClick={onHide}
          className="absolute right-4 text-white hover:opacity-80 transition-opacity"
          type="button"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-6 bg-white">
        <p className="text-center text-gray-700 mb-6">
          Select one or more users to unassign from the role{" "}
          <span className="font-bold">"{role.name}"</span>
        </p>

        <div className="flex gap-2 mb-6 justify-center">
          <Dropdown
            value={searchBy}
            options={searchByOptions}
            onChange={(e) => setSearchBy(e.value)}
            className="w-40 h-10"
            disabled={isSubmitting}
          />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search employees..."
            className="w-64 h-10"
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="bg-[#60A5FA] text-white px-4 rounded-md flex items-center justify-center hover:bg-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[350px] overflow-y-auto px-2 custom-scrollbar">
          {filteredEmployees.length > 0 && (
            <div className="flex items-center justify-between p-3 mb-2 border-b border-gray-200 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Select All
              </span>
              <div className="p-1">
                <Checkbox
                  onChange={(e) => handleSelectAll(e.checked || false)}
                  checked={isAllSelected}
                  disabled={isSubmitting}
                  pt={{
                    root: {
                      className: "w-5 h-5 border-2 border-gray-500 rounded",
                    },
                    icon: {
                      className: "text-[#0086ED] text-sm",
                    },
                  }}
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              Loading employees...
            </div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp: AssignedEmployee) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-gray-100 border border-gray-300 text-xs font-medium px-2 py-1 rounded text-gray-700 min-w-[70px] text-center">
                    {emp.employeeId}
                  </span>
                  <span className="text-sm text-gray-700">{emp.fullName}</span>
                </div>

                <div className="p-1">
                  <Checkbox
                    onChange={(e) =>
                      handleEmployeeToggle(emp.id, e.checked || false)
                    }
                    checked={selectedEmployees.includes(emp.id)}
                    disabled={isSubmitting}
                    pt={{
                      root: {
                        className: "w-5 h-5 border-2 border-gray-500 rounded",
                      },
                      icon: {
                        className: "text-[#0086ED] text-sm",
                      },
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {searchTerm
                ? "No employees found matching your search."
                : "No employees are currently assigned to this role."}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            text={isSubmitting ? "Unassigning..." : "Unassign"}
            className={`px-12 py-2 rounded-md text-white font-semibold ${
              selectedEmployees.length === 0 || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#0086ED] hover:bg-blue-600"
            }`}
            type="button"
            state={!isSubmitting}
            disabled={selectedEmployees.length === 0 || isSubmitting}
            id="unassign-button"
            onClick={handleUnassign}
          />
        </div>
      </div>
    </Dialog>
  );
}
