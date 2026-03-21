"use client";

import { useMemo, useState } from "react";
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

interface IPermission {
  id: number;
  permissionCode: string;
  name: string;
  featureId: number;
  featureCode: string;
  featureName: string;
}

interface IRoleDetails {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  createdDate?: string;
  permissions: IPermission[];
}

interface EditRoleFormValues {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  permissionIds: number[];
}

const permissionGroups = [
  {
    title: "Employee",
    items: [
      { id: 1, label: "View Employee" },
      { id: 2, label: "Add Employee" },
      { id: 3, label: "Edit Employee" },
    ],
  },
  {
    title: "Inventory Management",
    items: [
      { id: 4, label: "View Inventory" },
      { id: 5, label: "Add Inventory Item" },
    ],
  },
  {
    title: "Purchase Request",
    items: [
      { id: 6, label: "View Purchase Request" },
      { id: 7, label: "Add Purchase Request" },
      { id: 8, label: "Edit Purchase Request" },
    ],
  },
  {
    title: "Menu Management",
    items: [
      { id: 9, label: "View Menu" },
      { id: 10, label: "Add Menu Item" },
      { id: 11, label: "Edit Menu Item" },
    ],
  },
  {
    title: "Customer Reservations",
    items: [
      { id: 12, label: "View Reservations" },
      { id: 13, label: "Add Reservations" },
      { id: 14, label: "Edit Reservations" },
    ],
  },
  {
    title: "Order Management",
    items: [
      { id: 15, label: "View Orders" },
      { id: 16, label: "Add Orders" },
      { id: 17, label: "Edit Orders" },
    ],
  },
];

export default function EditRolePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const toastRef = useToastRef();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Employee: true,
    "Inventory Management": true,
    "Purchase Request": true,
    "Menu Management": false,
    "Customer Reservations": false,
    "Order Management": false,
  });

  const { data, isFetching } = useGetQuery<IBaseApiResponse<IRoleDetails>, void>(
    ["role-details", id],
    `/roles/${id}`,
    undefined,
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
      permissionIds: roleData?.permissions?.map((p) => p.id) ?? [],
    }),
    [roleData, id],
  );

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
      ? [...permissionIds, permissionId]
      : permissionIds.filter((id) => id !== permissionId);

    setFieldValue("permissionIds", updated);
  };

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

                  <div className="d-flex gap-2 mt-5">
                    <Button
                      text="Reset"
                      className="bg-[#696E79] text-white p-[12px] rounded-xl box-shadow w-full"
                      type="button"
                      state={true}
                      disabled={updateMutation.isPending || isFetching}
                      id="reset"
                      onClick={() => resetForm()}
                    />

                    <Button
                      text="Save"
                      className="bg-[#0086ED] text-white p-[12px] rounded-xl box-shadow w-full"
                      type="submit"
                      state={!updateMutation.isPending}
                      disabled={updateMutation.isPending || isFetching}
                      id="submit"
                    />
                  </div>
                </div>

                <div className="hidden lg:block w-px bg-gray-300"></div>
                <div className="block lg:hidden h-px bg-gray-300 mx-4"></div>

                <div className="w-full lg:w-7/12 p-4 p-lg-5">
                  <h2 className="text-[#0086ED] font-semibold text-xl mb-4">
                    Permissions
                  </h2>

                  <div
                    className="pr-2"
                    style={{ maxHeight: "65vh", overflowY: "auto" }}
                  >
                    <div className="space-y-3">
                      {permissionGroups.map((group) => (
                        <div
                          key={group.title}
                          className="border border-gray-200 rounded p-3"
                        >
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleGroup(group.title)}
                          >
                            <i
                              className={`pi mr-2 ${
                                openGroups[group.title]
                                  ? "pi-chevron-down"
                                  : "pi-chevron-right"
                              }`}
                            />
                            <label className="font-medium cursor-pointer mb-0">
                              {group.title}
                            </label>
                          </div>

                          {openGroups[group.title] && (
                            <div className="mt-2 ml-4 space-y-2">
                              {group.items.map((permission) => (
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
                                  {permission.label}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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