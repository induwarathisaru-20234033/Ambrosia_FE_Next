"use client";

import { useState } from "react";
import { EmployeeFormValues } from "@/types";

interface EmployeeFormProps {
  initialValues: EmployeeFormValues;
  onSubmit: (values: EmployeeFormValues) => void;
  isLoading?: boolean;
  title: string;
  isEdit?: boolean; // New prop to identify if this is edit mode
}

export default function EmployeeForm({
  initialValues,
  onSubmit,
  isLoading,
  title,
  isEdit = false,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormValues>(initialValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-[#0086ED] mb-8">{title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID
          </label>
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="EMP256"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
            disabled={isEdit} // Disable editing of Employee ID in edit mode
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="lithira.senath@gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Password - only show for add page */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="lithira.senath@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
              required
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="lithira.senath@gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Lithira"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Fernando"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Mobile Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Phone
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">
              +94
            </span>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="764364133"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="No. 24, Woodland Avenue, Colombo 005, Sri Lanka"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Additional Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Role
          </label>
          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
          >
            <option value="">Select Role</option>
            <option value="Manager">Manager</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Status Toggle - only for edit page */}
        {isEdit && (
          <div className="flex items-center space-x-4 py-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  status: prev.status === "Active" ? "Inactive" : "Active",
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0086ED] focus:ring-offset-2 ${
                formData.status === "Active" ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.status === "Active" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${
              formData.status === "Active" ? "text-green-600" : "text-red-600"
            }`}>
              {formData.status === "Active" ? "Active" : "Inactive"}
            </span>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-[#0086ED] text-white rounded-md hover:bg-[#0073cc] transition-colors disabled:opacity-50 text-lg font-medium"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}