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
      // Here you would make your API call
      console.log("Submitting:", {
        ...values,
        mobileNumber: `94${values.mobileNumber}`,
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Employee created successfully!",
      });
      
      // Redirect to employees list on success
      router.push("/menu/emp-mgt/employees");
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
    <EmployeeForm
      title="Add Employee"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}