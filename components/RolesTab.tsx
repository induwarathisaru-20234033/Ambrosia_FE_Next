"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Role data matching the image
interface Role {
  code: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

const mockRoles: Role[] = [
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwARA@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thsaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-AZTSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
  { code: "AMB-ATZSPUDHT", name: "Induwara Thisaru", description: "induwara@gmail.com", status: "Active" },
];

export default function RolesTab() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  const handleFilter = () => {
    console.log("Filtering...");
  };

  const handleClear = () => {
    setRoles(mockRoles);
  };

  const handleEdit = (roleCode: string) => {
    router.push(`/menu/emp-mgt/roles/edit/${roleCode}`);
  };

  const handleAssign = (roleCode: string) => {
    console.log("Assign role:", roleCode);
    // Navigate to assign page if needed
    // router.push(`/menu/emp-mgt/roles/assign/${roleCode}`);
  };

  const handleUnassign = (roleCode: string) => {
    console.log("Unassign role:", roleCode);
    // Navigate to unassign page if needed
  };

  const handleView = (roleCode: string) => {
    console.log("View role:", roleCode);
    // Navigate to view role details page if needed
    // router.push(`/menu/emp-mgt/roles/view/${roleCode}`);
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Roles</h2>
        <Link
          href="/menu/emp-mgt/roles/add"
          className="bg-[#0086ED] text-white px-4 py-2 rounded-md hover:bg-[#0073cc] transition-colors text-sm font-medium"
        >
          + Add Role
        </Link>
      </div>

      {/* Role Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              placeholder="Filter by role name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            />
          </div> 
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Filter by description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilter}
              className="bg-[#0086ED] text-white px-6 py-2 rounded-md hover:bg-[#0073cc] transition-colors"
            >
              Filter
            </button>
            <button
              onClick={handleClear}
              className="border border-[#0086ED] text-[#0086ED] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role, index) => (
              <tr 
                key={`${role.code}-${index}`} 
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                  {role.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {role.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {role.description}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {role.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {/* Edit Button - Navigates to Edit Role Page */}
                    <button
                      onClick={() => handleEdit(role.code)}
                      className="text-[#0086ED] hover:text-[#0073cc] text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    {/* Assign Button */}
                    <button
                      onClick={() => handleAssign(role.code)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium px-2 py-1 rounded hover:bg-green-50"
                    >
                      Assign
                    </button>

                    {/* Unassign Button */}
                    <button
                      onClick={() => handleUnassign(role.code)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium px-2 py-1 rounded hover:bg-orange-50"
                    >
                      Unassign
                    </button>

                    {/* View Button */}
                    <button
                      onClick={() => handleView(role.code)}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium px-2 py-1 rounded hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Custom Role Link */}
      <div className="mt-4">
        <Link
          href="/menu/emp-mgt/roles/add"
          className="text-[#0086ED] hover:text-[#0073cc] text-sm font-medium inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Custom Role
        </Link>
      </div>
    </div>
  );
}