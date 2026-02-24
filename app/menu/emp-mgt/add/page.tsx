"use client";

import { useRouter } from "next/navigation";
import EmployeeForm from "@/components/EmployeeForm";
import { EmployeeFormValues } from "@/types";
import { useToastRef } from "@/contexts/ToastContext";

export default function AddEmployeePage() {
  const router = useRouter();
  const toastRef = useToastRef();

  const initialValues: EmployeeFormValues = {
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    mobileNumber: "",
    address: "",
    password: "",
    role: "",
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      // Create new employee object
      const newEmployee = {
        employeeId: values.employeeId || `AMB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        username: values.username,
        mobileNumber: `+94 ${values.mobileNumber}`,
        address: values.address,
        status: "Active" as const,
        role: values.role || "Staff",
      };
      
      console.log("Adding new employee:", newEmployee); // Debug log
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Encode the employee data
      const encodedEmployee = encodeURIComponent(JSON.stringify(newEmployee));
      
      // Redirect to main page with success message and new employee data
      const redirectUrl = `/menu/emp-mgt/main?success=true&message=Employee created successfully!&tab=employees&newEmployee=${encodedEmployee}`;
      console.log("Redirecting to:", redirectUrl); // Debug log
      
      router.push(redirectUrl);
    } catch (error) {
      console.error("Error adding employee:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create employee",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <EmployeeForm
        title="Add Employee"
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}