"use client";

import React from "react";

interface IRolePermissionItem {
  id: number;
  permissionCode: string;
  name: string;
  description: string;
  isSelected: boolean;
}

interface IRolePermissionGroup {
  featureId: number;
  featureCode: string;
  featureName: string;
  permissions: IRolePermissionItem[];
}

interface IRoleViewData {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  selectedPermissionIds: number[];
  permissionGroups: IRolePermissionGroup[];
}

interface AssignedEmployee {
  id: number;
  employeeId: string;
  fullName: string;
}

interface ViewRoleDrawerProps {
  role: IRoleViewData | null;
  assignedEmployees: AssignedEmployee[];
  loading: boolean;
  onClose: () => void;
}

const ViewRoleDrawer: React.FC<ViewRoleDrawerProps> = ({
  role,
  assignedEmployees,
  loading,
  onClose,
}) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[45%] bg-white shadow-xl z-50 overflow-y-auto transition-transform duration-300">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[#0086ED] font-semibold text-2xl">
            More Information
          </h2>
          <button
            className="text-black font-normal text-2xl leading-none"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <hr className="border-gray-300 mb-6" />

        <div className="mb-6">
          <div className="bg-[#F2F2F2] px-3 py-2 font-medium mb-3">
            Assigned Users
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Employee ID</th>
                <th className="text-left py-2 px-2">Name</th>
              </tr>
            </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-3 px-2 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : assignedEmployees.length > 0 ? (
                  assignedEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="py-2 px-2">{emp.employeeId}</td>
                      <td className="py-2 px-2">{emp.fullName}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-3 px-2 text-gray-500">
                      No assigned users found.
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>

        <div>
          <div className="bg-[#F2F2F2] px-3 py-2 font-medium mb-3">
            Permissions
          </div>

          <div className="px-2">
            {role?.permissionGroups?.length ? (
              role.permissionGroups.map((group) => {
                const selectedPermissions =
                  group.permissions?.filter((permission) => permission.isSelected) || [];

                if (selectedPermissions.length === 0) return null;

                return (
                  <div key={group.featureId} className="mb-4">
                    <div className="font-medium mb-2">{group.featureName}</div>
                    <ul className="pl-4 mb-0">
                      {selectedPermissions.map((permission) => (
                        <li key={permission.id} className="mb-1">
                          {permission.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">No permissions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoleDrawer;