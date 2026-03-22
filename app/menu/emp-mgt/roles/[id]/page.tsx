"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Formik, Form } from "formik";
import { Container, Row, Col } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import Switch from "@mui/material/Switch";

import { useToastRef } from "@/contexts/ToastContext";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePutQuery } from "@/services/queries/putQuery";
import { IBaseApiResponse } from "@/data-types";
import { addRoleSchema } from "@/schemas";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface IPermissionItem {
  id: number;
  permissionCode: string;
  name: string;
  description?: string;
  isSelected: boolean;
}

interface IPermissionGroup {
  featureId: number;
  featureCode: string;
  featureName: string;
  permissions: IPermissionItem[];
}

interface IRoleDetails {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  selectedPermissionIds: number[];
  permissionGroups: IPermissionGroup[];
  createdDate?: string;
  updatedDate?: string;
}

interface EditRoleFormValues {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  permissionIds: number[];
}

export default function EditRolePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const toastRef = useToastRef();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const { data, isFetching } = useGetQuery<IBaseApiResponse<IRoleDetails>, any>(
    ["role-details", id],
    `/roles/${id}`,
    {
      includePermissions: true,
      includeFeatures: true,
    },
    {
      enabled: !!id,
      toastRef,
    },
  );

  const updateMutation = usePutQuery({
    redirectPath: "/menu/emp-mgt?tab=roles",
    successMessage: "Role updated successfully!",
    toastRef,
  });

  const roleData = data?.data;

  const initialValues: EditRoleFormValues = useMemo(
    () => ({
      id: roleData?.id ?? id ?? 0,
      roleCode: roleData?.roleCode ?? "",
      name: roleData?.name ?? "",
      description: roleData?.description ?? "",
      status: roleData?.status ?? 1,
      permissionIds:
        roleData?.selectedPermissionIds ??
        roleData?.permissionGroups
          ?.flatMap((group) =>
            group.permissions
              .filter((permission) => permission.isSelected)
              .map((permission) => permission.id),
          ) ??
        [],
    }),
    [roleData, id],
  );

  useEffect(() => {
    if (!roleData?.permissionGroups?.length) return;

    const initialOpenState: Record<string, boolean> = {};
    roleData.permissionGroups.forEach((group, index) => {
      initialOpenState[group.featureName] = index < 3;
    });

    setOpenGroups(initialOpenState);
  }, [roleData]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handlePermissionChange = (
    checked: boolean,
    permissionId: number,
    permissionIds: number[],
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const updated = checked
      ? permissionIds.includes(permissionId)
        ? permissionIds
        : [...permissionIds, permissionId]
      : permissionIds.filter((id) => id !== permissionId);

    setFieldValue("permissionIds", updated);
  };

  if (isFetching && !roleData) {
    return (
      <Container fluid className="py-4 px-4">
        <div className="text-gray-500">Loading role details...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="text-5xl my-2 text-[#0086ED] font-bold">
            Update Role
          </h1>
        </Col>

        <Col xs="auto">
          <Button
            id="backBtn"
            text="Back"
            type="button"
            className="bg-[#0086ED] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={() => router.push("/menu/emp-mgt?tab=roles")}
          />
        </Col>
      </Row>

      <Formik<EditRoleFormValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={addRoleSchema}
        onSubmit={(values) => {
          updateMutation.mutate({
            url: `/roles/${id}`,
            body: {
              id: values.id,
              roleCode: values.roleCode,
              name: values.name,
              description: values.description,
              status: values.status,
              permissionIds: values.permissionIds,
            },
          });
        }}
      >
        {({ values, setFieldValue, resetForm }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row min-h-[72vh]">
                <div className="w-full lg:w-5/12 p-4 p-lg-5">
                  <h2 className="text-[#0086ED] font-semibold text-xl mb-4">
                    Role
                  </h2>

                  <div className="mb-3">
                    <LabelGroup
                      label="Role Code*"
                      name="roleCode"
                      type="text"
                      placeholder="Enter role code"
                      id="roleCode"
                      disabled={false}
                    />
                  </div>

                  <div className="mb-3">
                    <LabelGroup
                      label="Title/Name*"
                      name="name"
                      type="text"
                      placeholder="Enter role name"
                      id="roleName"
                      disabled={false}
                    />
                  </div>

                  <div className="mb-3">
                    <LabelGroup
                      label="Description"
                      name="description"
                      as="textarea"
                      rows={7}
                      placeholder="Enter description"
                      id="roleDescription"
                      disabled={false}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium mb-0">Status*</label>
                    <Switch
                      checked={values.status === 1}
                      onChange={(e) =>
                        setFieldValue("status", e.target.checked ? 1 : 0)
                      }
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      id="resetBtn"
                      text="Reset"
                      type="button"
                      className="bg-gray-400 text-white px-4 py-2 rounded-xl shadow-md w-full"
                      state={true}
                      onClick={() => resetForm()}
                    />
                    <Button
                      id="saveBtn"
                      text={updateMutation.isPending ? "Saving..." : "Save"}
                      type="submit"
                      className="bg-[#5AA9E6] text-white px-4 py-2 rounded-xl shadow-md w-full"
                      state={!updateMutation.isPending}
                    />
                  </div>
                </div>

                <div className="hidden lg:block w-px bg-gray-300" />

                <div className="w-full lg:w-7/12 p-4 p-lg-5">
                  <h2 className="text-[#0086ED] font-semibold text-xl mb-4">
                    Permissions
                  </h2>

                  <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-2">
                    {roleData?.permissionGroups?.length ? (
                      roleData.permissionGroups.map((group) => (
                        <div
                          key={group.featureId}
                          className="border border-gray-200 rounded p-3"
                        >
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleGroup(group.featureName)}
                          >
                            <i
                              className={`pi mr-2 ${
                                openGroups[group.featureName]
                                  ? "pi-chevron-down"
                                  : "pi-chevron-right"
                              }`}
                            />
                            <label className="font-medium cursor-pointer mb-0">
                              {group.featureName}
                            </label>
                          </div>

                          {openGroups[group.featureName] && (
                            <div className="mt-2 ml-4 space-y-2">
                              {group.permissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={values.permissionIds.includes(
                                      permission.id,
                                    )}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        e.target.checked,
                                        permission.id,
                                        values.permissionIds,
                                        setFieldValue,
                                      )
                                    }
                                  />
                                  {permission.name}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">
                        No permissions available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Container>
  );
}