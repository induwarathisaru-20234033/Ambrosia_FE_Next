"use client";

import { useState } from "react";
import { RoleFormValues } from "@/types";

interface RoleFormProps {
  initialValues: RoleFormValues;
  onSubmit: (values: RoleFormValues) => void;
  isLoading?: boolean;
  title: string;
}

export default function RoleForm({
  initialValues,
  onSubmit,
  isLoading,
  title,
}: RoleFormProps) {
  const [formData, setFormData] = useState<RoleFormValues>(initialValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(initialValues);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0086ED] mb-8">{title}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Role Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Code *
          </label>
          <input
            type="text"
            name="roleCode"
            value={formData.roleCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Role Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name *
          </label>
          <input
            type="text"
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            required
          />
        </div>

        {/* Status Toggle - only for edit page */}
        {initialValues.roleCode && (
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  status: prev.status === "Active" ? "Inactive" : "Active",
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.status === "Active" ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.status === "Active" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {formData.status === "Active" ? "Active" : "Inactive"}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#0086ED] text-white rounded-md hover:bg-[#0073cc] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}