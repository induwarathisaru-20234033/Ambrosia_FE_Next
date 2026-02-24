"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Employee } from "@/types";

interface EmployeesTabProps {
  employees?: Employee[];
  onSuccess?: (message: string) => void;
}

export default function EmployeesTab({ employees: propEmployees, onSuccess }: EmployeesTabProps) {
  const [employees, setEmployees] = useState<Employee[]>(propEmployees || []);
  const [filters, setFilters] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    username: "",
    phoneNumber: "",
    address: "",
    status: "",
    role: "",
  });
  
  // Use a ref to track the previous propEmployees value
  const prevPropEmployeesRef = useRef<Employee[] | undefined>(propEmployees);

  // Update employees when prop changes (after add/edit)
  useEffect(() => {
    if (propEmployees && prevPropEmployeesRef.current !== propEmployees) {
      // Check if the arrays are different by comparing JSON strings
      const prevJson = JSON.stringify(prevPropEmployeesRef.current);
      const currentJson = JSON.stringify(propEmployees);
      
      if (prevJson !== currentJson) {
        console.log("Updating employees from props in EmployeesTab");
        setEmployees(propEmployees);
        prevPropEmployeesRef.current = propEmployees;
      }
    }
  }, [propEmployees]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    console.log("Filtering with:", filters);
    
    // Get all employees from props or state
    const sourceEmployees = propEmployees || employees;
    
    // Apply filters
    const filtered = sourceEmployees.filter(emp => {
      const matchesEmployeeId = !filters.employeeId || 
        emp.employeeId.toLowerCase().includes(filters.employeeId.toLowerCase());
      
      const matchesFullName = !filters.fullName || 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(filters.fullName.toLowerCase());
      
      const matchesEmail = !filters.email || 
        emp.email.toLowerCase().includes(filters.email.toLowerCase());
      
      const matchesUsername = !filters.username || 
        emp.username.toLowerCase().includes(filters.username.toLowerCase());
      
      const matchesPhone = !filters.phoneNumber || 
        emp.mobileNumber.includes(filters.phoneNumber);
      
      const matchesAddress = !filters.address || 
        emp.address.toLowerCase().includes(filters.address.toLowerCase());
      
      const matchesStatus = !filters.status || 
        emp.status === filters.status;
      
      const matchesRole = !filters.role || 
        emp.role === filters.role;
      
      return matchesEmployeeId && matchesFullName && matchesEmail && 
             matchesUsername && matchesPhone && matchesAddress && 
             matchesStatus && matchesRole;
    });
    
    setEmployees(filtered);
  };

  const handleClear = () => {
    setFilters({
      employeeId: "",
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
      address: "",
      status: "",
      role: "",
    });
    // Reset to original prop employees
    setEmployees(propEmployees || []);
  };

  return (
    <div className="w-full">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Employees</h2>
        <Link
          href="/menu/emp-mgt/add"
          className="bg-[#0086ED] text-white px-4 py-2 rounded-md hover:bg-[#0073cc] transition-colors text-sm font-medium"
        >
          + Add Employee
        </Link>
      </div>

      {/* Search Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {/* Employee ID */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Employee Id
            </label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="Search by Employee ID"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={filters.fullName}
              onChange={handleFilterChange}
              placeholder="Search by Full Name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Search by Email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              placeholder="Search by Username"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={filters.phoneNumber}
              onChange={handleFilterChange}
              placeholder="Search by Phone Number"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search by Address"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Role
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0086ED]"
            >
              <option value="">All</option>
              <option value="Manager">Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleFilter}
            className="bg-[#0086ED] text-white px-6 py-2 rounded-md hover:bg-[#0073cc] transition-colors text-sm font-medium"
          >
            Filter
          </button>
          <button
            onClick={handleClear}
            className="border border-[#0086ED] text-[#0086ED] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No employees found
          </div>
        ) : (
          <table className="w-full min-w-[1200px] table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[120px]">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[100px]">First Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[100px]">Last Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[180px]">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[120px]">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[120px]">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[200px]">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[100px]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[80px]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={`${employee.employeeId}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono truncate" title={employee.employeeId}>
                    {employee.employeeId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.firstName}>
                    {employee.firstName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.lastName}>
                    {employee.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.email}>
                    {employee.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.username}>
                    {employee.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.mobileNumber}>
                    {employee.mobileNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.address}>
                    {employee.address}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={employee.role}>
                    {employee.role}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      employee.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Updated link to point to your edit-user location */}
                    <Link
                      href={`/menu/emp-mgt/edit-user/${employee.employeeId}`}
                      className="text-[#0086ED] hover:text-[#0073cc] text-sm font-medium inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Employee count */}
      <div className="mt-4 text-sm text-gray-600">
        Total: {employees.length} employee{employees.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}