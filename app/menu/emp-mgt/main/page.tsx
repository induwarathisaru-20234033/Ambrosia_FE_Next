"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployeesTab from "@/components/EmployeeTab";
import RolesTab from "@/components/RolesTab";
import SuccessPopup from "@/components/SuccessPopup";
import { Employee } from "@/types";

// Initial mock data
const initialEmployees: Employee[] = [
  {
    employeeId: "AMB-ATZ5PUDHT",
    firstName: "Induwara",
    lastName: "Thisaru",
    email: "induwara@gmail.com",
    username: "induwara.t",
    mobileNumber: "+94 762387190",
    address: "38A, The Finance Estate, Colombo 02",
    status: "Active",
    role: "Manager",
  },
  {
    employeeId: "AMB-ATZ5PUDHT",
    firstName: "Induwara",
    lastName: "Thisaru",
    email: "induwara@gmail.com",
    username: "induwara.t",
    mobileNumber: "+94 762387190",
    address: "38A, The Finance Estate, Colombo 02",
    status: "Active",
    role: "Manager",
  },
  {
    employeeId: "AMB-ATZ5PUDHT",
    firstName: "Induwara",
    lastName: "Thisaru",
    email: "induwara@gmail.com",
    username: "induwara.t",
    mobileNumber: "+94 762387190",
    address: "38A, The Finance Estate, Colombo 02",
    status: "Active",
    role: "Manager",
  },
];

export default function EmployeeAndRolesManagement() {
  const [activeTab, setActiveTab] = useState<"employees" | "roles">("employees");
  const [employees, setEmployees] = useState<Employee[]>([]); // Start with empty array
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use refs to track if we've already processed the params
  const processedParamsRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Load employees from localStorage on initial render
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees);
        setEmployees(parsedEmployees);
      } catch (e) {
        console.error('Error parsing saved employees', e);
        setEmployees(initialEmployees);
      }
    } else {
      // First time - save initial mock data to localStorage
      setEmployees(initialEmployees);
      localStorage.setItem('employees', JSON.stringify(initialEmployees));
    }
    isInitializedRef.current = true;
  }, []);

  // Handle URL params - FIXED INFINITE LOOP
  useEffect(() => {
    // Prevent processing multiple times or before initialization
    if (processedParamsRef.current || !isInitializedRef.current) return;
    
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    const tab = searchParams.get('tab');
    const newEmployee = searchParams.get('newEmployee');
    const updatedEmployee = searchParams.get('updatedEmployee');
    
    // Only process if we have a success param
    if (success === 'true' && message) {
      // Mark as processed to prevent re-running
      processedParamsRef.current = true;
      
      console.log("Processing URL Params:", { success, message, tab });
      
      // Show success popup
      setSuccessMessage(message);
      setShowSuccessPopup(true);
      
      // Set active tab
      if (tab === 'roles') {
        setActiveTab('roles');
      } else {
        setActiveTab('employees');
      }
      
      // Handle new employee data
      if (newEmployee) {
        try {
          const employeeData = JSON.parse(decodeURIComponent(newEmployee));
          console.log("Adding new employee:", employeeData);
          
          setEmployees(prevEmployees => {
            // Check if employee already exists
            const exists = prevEmployees.some(emp => emp.employeeId === employeeData.employeeId);
            let updated;
            if (exists) {
              // Update existing employee
              updated = prevEmployees.map(emp => 
                emp.employeeId === employeeData.employeeId ? employeeData : emp
              );
            } else {
              // Add new employee
              updated = [...prevEmployees, employeeData];
            }
            // Save to localStorage
            localStorage.setItem('employees', JSON.stringify(updated));
            return updated;
          });
        } catch (e) {
          console.error('Error parsing new employee data', e);
        }
      }
      
      // Handle updated employee data
      if (updatedEmployee) {
        try {
          const employeeData = JSON.parse(decodeURIComponent(updatedEmployee));
          console.log("Updating employee:", employeeData);
          
          setEmployees(prevEmployees => {
            const updated = prevEmployees.map(emp => 
              emp.employeeId === employeeData.employeeId ? employeeData : emp
            );
            // Save to localStorage
            localStorage.setItem('employees', JSON.stringify(updated));
            return updated;
          });
        } catch (e) {
          console.error('Error parsing updated employee data', e);
        }
      }
      
      // Remove query params after processing
      const url = new URL(window.location.href);
      url.search = '';
      router.replace(url.pathname);
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
        // Reset the processed flag after popup hides
        setTimeout(() => {
          processedParamsRef.current = false;
        }, 500);
      }, 3000);
    }
  }, [searchParams, router]); // Remove employees from dependencies

  // Show loading state while initializing
  if (!isInitializedRef.current && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup 
          message={successMessage} 
          onClose={() => {
            setShowSuccessPopup(false);
            processedParamsRef.current = false;
          }} 
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#0086ED] mb-6">
          Employee and Roles Management
        </h1>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("employees")}
            className={`pb-3 px-1 text-base font-medium transition-colors relative ${
              activeTab === "employees"
                ? "text-[#0086ED] border-b-2 border-[#0086ED]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 px-1 text-base font-medium transition-colors relative ${
              activeTab === "roles"
                ? "text-[#0086ED] border-b-2 border-[#0086ED]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Roles
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "employees" ? (
          <EmployeesTab employees={employees} />
        ) : (
          <RolesTab />
        )}
      </div>
    </div>
  );
}