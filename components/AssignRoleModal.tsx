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

interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  status: number;
}

interface Role {
  id: number;
  roleCode: string;
  name: string;
  description?: string;
}

interface AssignRoleModalProps {
  visible: boolean;
  onHide: () => void;
  role: Role | null;
  onAssigned: () => void;
}

interface AssignedEmployee {
  id: number;
  employeeId: string;
  fullName: string;
}

const searchByOptions = [
  { label: "Select Option", value: "all" },
  { label: "Employee ID", value: "employeeId" },
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
];

export default function AssignRoleModal({
  visible,
  onHide,
  role,
  onAssigned,
}: AssignRoleModalProps) {
  const toastRef = useToastRef();
  const [searchBy, setSearchBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [alreadyAssignedEmployees, setAlreadyAssignedEmployees] = useState<number[]>([]);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selected employees when modal opens/closes or role changes
  useEffect(() => {
    if (!visible) {
      setSelectedEmployees([]);
      setAlreadyAssignedEmployees([]);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSearchBy("all");
    }
  }, [visible]);

  // Fetch all active employees
  const { data: employeesResponse, isLoading } = useGetQuery<any, any>(
    ["employees-for-assign", role?.id ?? "no-role"],
    "/employees",
    { PageNumber: 1, PageSize: 1000 },
    { enabled: !!role && visible, toastRef }
  );

    const { data: assignedEmployeesResponse } = useGetQuery<any, any>(
    ["assigned-employees", role?.id ?? 0],
    `/roles/${role?.id}/assigned-employees`,
    { isCustomRole: false },
    {
      enabled: !!role && visible,
      toastRef,
    },
  );


  // Process employees with full name
  const allEmployees = useMemo(() => {
    const raw = employeesResponse?.data?.items || employeesResponse?.data || [];
    return raw
      .filter((emp: Employee) => emp.status === 1)
      .map((emp: Employee) => ({
        ...emp,
        fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      }));
  }, [employeesResponse]);

    useEffect(() => {
    if (!visible) return;

    const assigned: AssignedEmployee[] =
      assignedEmployeesResponse?.data?.assignedEmployees || [];

    const assignedIds = assigned.map((emp) => emp.id);

    setAlreadyAssignedEmployees(assignedIds);
    setSelectedEmployees(assignedIds);
  }, [assignedEmployeesResponse, visible]);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allEmployees;
    
    const lower = debouncedSearchTerm.toLowerCase();
    
    return allEmployees.filter((emp: Employee) => {
      if (searchBy === "all") {
        return (
          emp.employeeId?.toLowerCase().includes(lower) ||
          emp.firstName?.toLowerCase().includes(lower) ||
          emp.lastName?.toLowerCase().includes(lower) ||
          emp.fullName?.toLowerCase().includes(lower)
        );
      }
      
      switch (searchBy) {
        case "employeeId":
          return emp.employeeId?.toLowerCase().includes(lower);
        case "firstName":
          return emp.firstName?.toLowerCase().includes(lower);
        case "lastName":
          return emp.lastName?.toLowerCase().includes(lower);
        default:
          return true;
      }
    });
  }, [allEmployees, debouncedSearchTerm, searchBy]);

  // Handle individual employee selection
  const handleEmployeeToggle = (employeeId: number, isChecked: boolean) => {
    if (alreadyAssignedEmployees.includes(employeeId)) return;

    if (isChecked) {
      setSelectedEmployees((prev) =>
        prev.includes(employeeId) ? prev : [...prev, employeeId],
      );
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  // Select/Deselect all employees
  const handleSelectAll = (isChecked: boolean) => {
    const selectableEmployeeIds = filteredEmployees
      .filter((emp: Employee) => !alreadyAssignedEmployees.includes(emp.id))
      .map((emp: Employee) => emp.id);

    if (isChecked) {
      setSelectedEmployees([
        ...alreadyAssignedEmployees,
        ...selectableEmployeeIds.filter(
          (id: number) => !alreadyAssignedEmployees.includes(id),
        ),
      ]);
    } else {
      setSelectedEmployees([...alreadyAssignedEmployees]);
    }
  };

  const selectableFilteredEmployees = filteredEmployees.filter(
    (emp: Employee) => !alreadyAssignedEmployees.includes(emp.id),
  );

  const selectedSelectableCount = selectableFilteredEmployees.filter((emp: Employee) =>
    selectedEmployees.includes(emp.id),
  ).length;

  // Check if all filtered employees are selected
  const isAllSelected =
    selectableFilteredEmployees.length > 0 &&
    selectedSelectableCount === selectableFilteredEmployees.length;

  const assignMutation = usePatchQuery({
    invalidateKey: ["roles", "employees"],
    toastRef,
  });

  const handleAssign = async () => {
    if (!role) return;

    const newEmployees = selectedEmployees.filter(
      (id) => !alreadyAssignedEmployees.includes(id),
    );

    if (newEmployees.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least one new employee to assign.",
        life: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

     try {
      for (const employeeId of newEmployees) {
        try {
          await assignMutation.mutateAsync({
            url: `/employees/assign-roles`,
            body: {
              employeeId,
              roleIds: [role.id],
              customRoleIds: [],
            },
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
          console.error(`Failed to assign role to employee ${employeeId}:`, error);
        }
      }

      if (successCount > 0) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Successfully assigned "${role.name}" to ${successCount} employee(s).${
            errorCount > 0 ? ` Failed for ${errorCount} employee(s).` : ""
          }`,
          life: 5000,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: `Failed to assign "${role.name}". Please try again.`,
          life: 5000,
        });
      }

      if (successCount > 0) {
        setSelectedEmployees([]);
        setAlreadyAssignedEmployees([]);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setSearchBy("all");
        onAssigned();
        onHide();
      }
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message ||
          "Failed to assign role. Please try again.",
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
          Assign Employees to Role
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
          Select one or more users to assign to the role{" "}
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
          {selectableFilteredEmployees.length > 0 && (
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
            filteredEmployees.map((emp: Employee) => {
              const isAlreadyAssigned = alreadyAssignedEmployees.includes(emp.id);

              return (
                <div
                  key={emp.id}
                  className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 transition-colors ${
                    isAlreadyAssigned
                      ? "bg-gray-100 opacity-80"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-100 border border-gray-300 text-xs font-medium px-2 py-1 rounded text-gray-700 min-w-[70px] text-center">
                      {emp.employeeId}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{emp.fullName}</span>
                      {isAlreadyAssigned && (
                        <span className="text-xs text-gray-500">
                          Already assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-1">
                    <Checkbox
                      onChange={(e) =>
                        handleEmployeeToggle(emp.id, e.checked || false)
                      }
                      checked={selectedEmployees.includes(emp.id)}
                      disabled={isSubmitting || isAlreadyAssigned}
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
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              {searchTerm
                ? "No employees found matching your search."
                : "No active employees available."}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            text={isSubmitting ? "Assigning..." : "Assign"}
            className={`px-12 py-2 rounded-md text-white font-semibold ${
              selectedEmployees.filter(
                (id) => !alreadyAssignedEmployees.includes(id),
              ).length === 0 || isSubmitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#0086ED] hover:bg-blue-600"
            }`}
            type="button"
            state={!isSubmitting}
            disabled={
              selectedEmployees.filter(
                (id) => !alreadyAssignedEmployees.includes(id),
              ).length === 0 || isSubmitting
            }
            id="assign-button"
            onClick={handleAssign}
          />
        </div>
      </div>
    </Dialog>
  );
}