"use client";

import { IRoleCreateRequest } from "@/data-types";
import { addRoleSchema } from "@/schemas";
import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Switch from "@mui/material/Switch";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface InitialValues {
  roleCode: string;
  name: string;
  description: string;
  status?: number;
  permissionIds?: number[];
}

export default function AddRolePage() {
  const router = useRouter();
  const toastRef = useToastRef();

  const [employeeOpen, setEmployeeOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [deptOpen, setDeptOpen] = useState(true);

  const mutation = usePostQuery({
    redirectPath: "/menu/emp-mgt",
    successMessage: "Role created successfully!",
    toastRef,
  });

  const handlePermissionChange = (
    checked: boolean,
    permId: number,
    permissionIds: number[] | undefined,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const currentPermissions = permissionIds || [];

    const newPermissions = checked
      ? [...currentPermissions, permId]
      : currentPermissions.filter((id) => id !== permId);

    setFieldValue("permissionIds", newPermissions);
  };

  return (
    <Formik<InitialValues>
      initialValues={{
        roleCode: "",
        name: "",
        description: "",
        status: 1,
        permissionIds: [],
      }}
      validationSchema={addRoleSchema}
      onSubmit={async (values) => {
        const body: IRoleCreateRequest = {
          roleCode: values.roleCode,
          name: values.name,
          description: values.description,
          status: values.status,
          permissionIds: values.permissionIds,
        };

        mutation.mutate({ url: "/roles", body });
      }}
    >
      {({ values, setFieldValue, resetForm }) => (
        <Form>
          <Container fluid className="py-4 px-4">
            {/* Header */}
            <Row className="align-items-center mb-4">
              <Col>
                <h1 className="text-5xl my-2 text-[#0086ED] font-bold">
                  Add Custom Role
                </h1>
              </Col>

              <Col xs="auto">
                <Button
                  id="backBtn"
                  text="Back"
                  type="button"
                  className="bg-[#0086ED] text-white px-4 py-2 rounded-xl shadow-md"
                  state={true}
                  onClick={() => router.push("/menu/emp-mgt")}
                />
              </Col>
            </Row>

            {/* Main Two Panel Layout */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row min-h-[70vh]">
                {/* Left Panel */}
                <div className="w-full lg:w-5/12 p-4 p-lg-5">
                  <h2 className="text-[#0086ED] font-semibold text-xl mb-4">
                    Role Details
                  </h2>

                  <div className="mb-3">
                    <LabelGroup
                      label="Role Code*"
                      name="roleCode"
                      type="text"
                      placeholder="Enter role code"
                      id="formID"
                      disabled={false}
                    />
                  </div>

                  <div className="mb-3">
                    <LabelGroup
                      label="Title/Name*"
                      name="name"
                      type="text"
                      placeholder="Enter role name"
                      id="formname"
                      disabled={false}
                    />
                  </div>

                  <div className="mb-3">
                    <LabelGroup
                      label="Description*"
                      name="description"
                      as="textarea"
                      rows={6}
                      placeholder="Enter description"
                      id="formDescription"
                      disabled={false}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm font-medium mb-0">Active</label>
                    <Switch
                      checked={values.status === 1}
                      onChange={(e) =>
                        setFieldValue("status", e.target.checked ? 1 : 0)
                      }
                    />
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <Button
                      text="Reset"
                      className="bg-[#696E79] text-white p-[12px] rounded-xl box-shadow w-full"
                      type="button"
                      state={true}
                      disabled={mutation.isPending}
                      id="reset"
                      onClick={() =>
                        resetForm({
                          values: {
                            roleCode: "",
                            name: "",
                            description: "",
                            status: 1,
                            permissionIds: [],
                          },
                        })
                      }
                    />

                    <Button
                      text="Save"
                      className="bg-[#0086ED] text-white p-[12px] rounded-xl box-shadow w-full"
                      type="submit"
                      state={!mutation.isPending}
                      disabled={mutation.isPending}
                      id="submit"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gray-300"></div>
                <div className="block lg:hidden h-px bg-gray-300 mx-4"></div>

                {/* Right Panel */}
                <div className="w-full lg:w-7/12 p-4 p-lg-5">
                  <h2 className="text-[#0086ED] font-semibold text-xl mb-4">
                    Permissions
                  </h2>

                  <div className="space-y-3">
                    {/* Employee */}
                    <div className="border border-gray-200 rounded p-3">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setEmployeeOpen((s) => !s)}
                      >
                        <i
                          className={`pi pi-chevron-down mr-2 transform transition-transform ${
                            employeeOpen ? "rotate-180" : ""
                          }`}
                        ></i>
                        <label className="font-medium cursor-pointer mb-0">
                          Employee
                        </label>
                      </div>

                      <div
                        className={`mt-2 ml-4 space-y-2 ${
                          employeeOpen ? "" : "hidden"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(1)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                1,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          View Employee
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(2)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                2,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          Add Employee
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(3)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                3,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          Edit Employee
                        </label>
                      </div>
                    </div>

                    {/* User */}
                    <div className="border border-gray-200 rounded p-3">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setUserOpen((s) => !s)}
                      >
                        <i
                          className={`pi pi-chevron-down mr-2 transform transition-transform ${
                            userOpen ? "rotate-180" : ""
                          }`}
                        ></i>
                        <label className="font-medium cursor-pointer mb-0">
                          User
                        </label>
                      </div>

                      <div
                        className={`mt-2 ml-4 space-y-2 ${
                          userOpen ? "" : "hidden"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(4)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                4,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          View User
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(5)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                5,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          Add User
                        </label>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="border border-gray-200 rounded p-3">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setDeptOpen((s) => !s)}
                      >
                        <i
                          className={`pi pi-chevron-down mr-2 transform transition-transform ${
                            deptOpen ? "rotate-180" : ""
                          }`}
                        ></i>
                        <label className="font-medium cursor-pointer mb-0">
                          Department
                        </label>
                      </div>

                      <div
                        className={`mt-2 ml-4 space-y-2 ${
                          deptOpen ? "" : "hidden"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(6)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                6,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          View Department
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(7)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                7,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          Add Department
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.permissionIds?.includes(8)}
                            onChange={(e) =>
                              handlePermissionChange(
                                e.target.checked,
                                8,
                                values.permissionIds,
                                setFieldValue,
                              )
                            }
                          />
                          Edit Department
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Form>
      )}
    </Formik>
  );
}