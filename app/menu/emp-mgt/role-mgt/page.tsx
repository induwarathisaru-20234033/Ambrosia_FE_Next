"use client";

import { useState } from "react";
import Link from "next/link";
import RolesTable from "@/components/RolesTable";
import { Role } from "@/types";

// Mock data - replace with actual API call
const mockRoles: Role[] = [
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwARA@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thsaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-AZTSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
  {
    roleCode: "AMB-ATZSPUDHT",
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  },
];

export default function RolesPage() {
  const [roles] = useState<Role[]>(mockRoles);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0086ED]">Role Management</h1>
        <Link
          href="/menu/emp-mgt/roles/add"
          className="bg-[#0086ED] text-white px-6 py-2 rounded-md hover:bg-[#0073cc] transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0086ED]"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button className="bg-[#0086ED] text-white px-6 py-2 rounded-md hover:bg-[#0073cc] transition-colors">
              Filter
            </button>
            <button className="border border-[#0086ED] text-[#0086ED] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors">
              Clear
            </button>
          </div>
        </div>
      </div>

      <RolesTable roles={roles} />
    </div>
  );
}