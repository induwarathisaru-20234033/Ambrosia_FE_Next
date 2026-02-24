"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeeForm from "@/components/EmployeeForm";
import { EmployeeFormValues, Employee } from "@/types";
import { useToastRef } from "@/contexts/ToastContext";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const toastRef = useToastRef();
  const [employee, setEmployee] = useState<EmployeeFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the employee ID from params - note the capital 'ID' matches the folder name [employeeID]
  const employeeId = params?.employeeID as string;
  
  console.log("Edit page - Employee ID from params:", employeeId);

  useEffect(() => {
    if (!employeeId) {
      setError("No employee ID provided");
      setLoading(false);
      return;
    }

    // Get employees from localStorage
    const savedEmployees = localStorage.getItem('employees');
    console.log("Saved employees from localStorage:", savedEmployees);
    
    if (savedEmployees) {
      try {
        const employees: Employee[] = JSON.parse(savedEmployees);
        console.log("All employees:", employees);
        console.log("Looking for employee with ID:", employeeId);
        
        // Find the employee with matching ID
        const foundEmployee = employees.find(emp => emp.employeeId === employeeId);
        
        if (foundEmployee) {
          console.log("Found employee:", foundEmployee);
          
          // Convert to form values (remove +94 prefix from phone)
          const mobileNumber = foundEmployee.mobileNumber.replace('+94 ', '');
          console.log("Mobile number after replace:", mobileNumber);
          
          const formValues: EmployeeFormValues = {
            employeeId: foundEmployee.employeeId,
            firstName: foundEmployee.firstName,
            lastName: foundEmployee.lastName,
            email: foundEmployee.email,
            username: foundEmployee.username,
            mobileNumber: mobileNumber,
            address: foundEmployee.address,
            role: foundEmployee.role,
            status: foundEmployee.status,
          };
          console.log("Form values:", formValues);
          setEmployee(formValues);
          setError(null);
        } else {
          console.error('Employee not found with ID:', employeeId);
          setError(`Employee with ID ${employeeId} not found`);
        }
      } catch (e) {
        console.error('Error parsing employees', e);
        setError('Error loading employee data');
      }
    } else {
      console.log('No employees found in localStorage');
      setError('No employee data found');
    }
    setLoading(false);
  }, [employeeId]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      // Create updated employee object
      const updatedEmployee = {
        employeeId: values.employeeId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        username: values.username,
        mobileNumber: `+94 ${values.mobileNumber}`,
        address: values.address,
        status: values.status || "Active",
        role: values.role || "Staff",
      };
      
      console.log("Updating employee:", updatedEmployee);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Encode the employee data
      const encodedEmployee = encodeURIComponent(JSON.stringify(updatedEmployee));
      
      // Redirect to main page with success message and updated employee data
      const redirectUrl = `/menu/emp-mgt/main?success=true&message=Employee updated successfully!&tab=employees&updatedEmployee=${encodedEmployee}`;
      console.log("Redirecting to:", redirectUrl);
      
      router.push(redirectUrl);
    } catch (error) {
      console.error("Error updating employee:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update employee",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-500 text-lg mb-4">{error || 'Employee not found'}</div>
        <button
          onClick={() => router.push('/menu/emp-mgt/main')}
          className="bg-[#0086ED] text-white px-6 py-2 rounded-md hover:bg-[#0073cc] transition-colors"
        >
          Back to Employee List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <EmployeeForm
        title="Edit Employee"
        initialValues={employee}
        onSubmit={handleSubmit}
        isEdit={true}
      />
    </div>
  );
}