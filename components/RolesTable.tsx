"use client";

import { Role } from "@/types";
import Link from "next/link";

interface RolesTableProps {
  roles: Role[];
}

export default function RolesTable({ roles }: RolesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role, index) => (
            <tr key={`${role.roleCode}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {role.roleCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {role.roleName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {role.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  role.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {role.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                  href={`/menu/emp-mgt/roles/edit/${role.roleCode}`}
                  className="bg-[#0086ED] text-white px-4 py-2 rounded-md hover:bg-[#0073cc] transition-colors"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}