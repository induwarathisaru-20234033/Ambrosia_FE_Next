"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useToastRef } from "@/contexts/ToastContext";
import { usePatchQuery } from "@/services/queries/patchQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import { Button } from "@/components/Button";

// Types
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

type SearchByOption = "all" | "employeeId" | "firstName" | "lastName";

const searchByOptions = [
  { label: "All Fields", value: "all" },
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
  const [searchBy, setSearchBy] = useState<SearchByOption>("all");
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

  // Fetch all active employees
  const {
    data: employeesResponse,
    isLoading: isLoadingEmployees,
  } = useGetQuery<any, any>(
    ["employees-for-assign", role?.id],
    "/employees",
    {
      PageNumber: 1,
      PageSize: 1000,
      status: 1, // Only active employees
    },
    {
      enabled: !!role && visible,
      toastRef,
    }
  );

  // Fetch employees already assigned to this role
  const {
    data: assignedEmployeesResponse,
  } = useGetQuery<any, any>(
    ["assigned-employees", role?.id],
    role ? `/roles/${role.id}/employees` : "",
    {},
    {
      enabled: !!role && visible,
      toastRef,
    }
  );

  // Create a Set of assigned employee IDs for quick lookup
  const assignedEmployeeIds = useMemo(() => {
    const assigned = assignedEmployeesResponse?.data || assignedEmployeesResponse || [];
    return new Set(assigned.map((emp: Employee) => emp.id));
  }, [assignedEmployeesResponse]);

  // Filter to only show active employees NOT already assigned to this role
  const allEmployees = useMemo(() => {
    const rawEmployees = employeesResponse?.data?.items || employeesResponse?.data || [];
    return rawEmployees
      .filter((emp: Employee) => emp.status === 1)
      .filter((emp: Employee) => !assignedEmployeeIds.has(emp.id))
      .map((emp: Employee) => ({
        ...emp,
        fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      }));
  }, [employeesResponse, assignedEmployeeIds]);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allEmployees;

    const searchLower = debouncedSearchTerm.toLowerCase();

    return allEmployees.filter((emp: Employee) => {
      if (searchBy === "all") {
        return (
          emp.employeeId?.toLowerCase().includes(searchLower) ||
          emp.firstName?.toLowerCase().includes(searchLower) ||
          emp.lastName?.toLowerCase().includes(searchLower) ||
          emp.fullName?.toLowerCase().includes(searchLower)
        );
      }

      switch (searchBy) {
        case "employeeId":
          return emp.employeeId?.toLowerCase().includes(searchLower);
        case "firstName":
          return emp.firstName?.toLowerCase().includes(searchLower);
        case "lastName":
          return emp.lastName?.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
  }, [allEmployees, debouncedSearchTerm, searchBy]);

  // Assign mutation
  const assignMutation = usePatchQuery({
    invalidateKey: ["roles", "employees", "assigned-employees"],
    toastRef: toastRef,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((emp: Employee) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleEmployeeSelect = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least one employee to assign.",
        life: 3000,
      });
      return;
    }

    if (!role) return;

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Call API for each selected employee
      for (const employeeId of selectedEmployees) {
        try {
          await assignMutation.mutateAsync({
            url: `/employees/assign-roles`,
            body: {
              employeeId: employeeId,
              roleIds: [role.id],
              customRoleIds: [],
            },
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
          const errorMsg = error?.response?.data?.message || error?.message || `Failed for employee ${employeeId}`;
          errors.push(errorMsg);
          console.error(`Failed to assign role to employee ${employeeId}:`, error);
        }
      }

      // Show summary message
      if (successCount > 0) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Successfully assigned "${role.name}" to ${successCount} employee(s).${errorCount > 0 ? ` Failed for ${errorCount} employee(s).` : ""}`,
          life: 5000,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: `Failed to assign "${role.name}". ${errors[0]}`,
          life: 5000,
        });
      }

      // Reset and close if at least one succeeded
      if (successCount > 0) {
        setSelectedEmployees([]);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        onHide();
        onAssigned();
      }
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message || "Failed to assign role. Please try again.",
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-3 p-4 border-t">
      <Button
        text="Cancel"
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        state={true}
        id="cancel-assign"
        onClick={onHide}
      />
      <Button
        text="Assign"
        className={`px-4 py-2 text-white rounded-lg transition-colors ${
          selectedEmployees.length === 0 || isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#0086ED] hover:bg-blue-600"
        }`}
        state={!isSubmitting}
        disabled={selectedEmployees.length === 0 || isSubmitting}
        id="confirm-assign"
        onClick={handleAssign}
      />
    </div>
  );

  if (!role) return null;

  return (
    <Dialog
      header={
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Assign Employees to Role</h2>
          <p className="text-sm text-gray-600 mt-1">
            Assign one or more employees to the role "{role.name}"
          </p>
        </div>
      }
      visible={visible}
      onHide={onHide}
      footer={footerContent}
      className="w-full max-w-2xl"
      draggable={false}
      closable={!isSubmitting}
      style={{ width: "600px" }}
    >
      <div className="p-4">
        <div className="mb-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">Search by:</label>
            <Dropdown
              value={searchBy}
              onChange={(e) => setSearchBy(e.value)}
              options={searchByOptions}
              className="w-full"
              disabled={isSubmitting}
              style={{ height: "40px" }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">Search</label>
            <div className="relative">
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search employees..."
                className="w-full pr-8"
                disabled={isSubmitting}
                style={{ height: "40px" }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-50 border-b flex items-center gap-3">
            <Checkbox
              inputId="selectAll"
              onChange={(e) => handleSelectAll(e.checked || false)}
              checked={
                filteredEmployees.length > 0 &&
                selectedEmployees.length === filteredEmployees.length
              }
              disabled={filteredEmployees.length === 0 || isSubmitting || isLoadingEmployees}
            />
            <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer">
              Select All ({filteredEmployees.length} employees)
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoadingEmployees ? (
              <div className="p-8 text-center text-gray-500">Loading employees...</div>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee: Employee) => (
                <div
                  key={employee.id}
                  className="p-3 border-b last:border-b-0 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    inputId={`emp-${employee.id}`}
                    onChange={(e) => handleEmployeeSelect(employee.id, e.checked || false)}
                    checked={selectedEmployees.includes(employee.id)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor={`emp-${employee.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <span className="text-gray-600 mr-2">{employee.employeeId}</span>
                    <span className="font-medium text-gray-800">{employee.fullName}</span>
                  </label>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {allEmployees.length === 0 && !isLoadingEmployees
                  ? "All employees are already assigned to this role."
                  : "No employees found matching your search."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}