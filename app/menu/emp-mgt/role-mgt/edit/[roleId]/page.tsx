"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RoleForm from "@/components/RoleForm";
import { RoleFormValues } from "@/types";
import { useToastRef } from "@/contexts/ToastContext";

// Mock function to fetch role - replace with actual API call
const fetchRole = async (roleId: string): Promise<RoleFormValues> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    roleCode: roleId,
    roleName: "Induwara Thisaru",
    description: "induwara@gmail.com",
    status: "Active",
  };
};

export default function EditRolePage() {
  const { roleId } = useParams();
  const router = useRouter();
  const toastRef = useToastRef();
  const [role, setRole] = useState<RoleFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRole(roleId as string).then((data) => {
      setRole(data);
      setLoading(false);
    });
  }, [roleId]);

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      // Here you would make your API call
      console.log("Updating role:", values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Show success message
      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Role updated successfully!",
      });
      
      // Redirect to roles list on success
      router.push("/menu/emp-mgt/roles");
    } catch (error) {
      console.error("Error updating role:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update role",
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

  if (!role) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Role not found</div>
      </div>
    );
  }

  return (
    <RoleForm
      title="Edit Role"
      initialValues={role}
      onSubmit={handleSubmit}
    />
  );
}