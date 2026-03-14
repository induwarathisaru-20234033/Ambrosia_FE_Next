"use client";

import { IEmployeeCreateRequest, IRoleCreateRequest } from "@/data-types";
import { addRoleSchema } from "@/schemas";
import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Container } from "react-bootstrap";
import Switch from '@mui/material/Switch';

const LabelGroup = dynamic(() => import("@/components/LabelGroup"),{ ssr: false,});
const Col = dynamic(() => import("react-bootstrap/Col"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const ScrollPanel = dynamic(() =>import("primereact/scrollpanel").then((mod) => mod.ScrollPanel),);
const label = { inputProps: { 'aria-label': 'Switch demo' } };

interface InitialValues {
  roleCode: string;
  name: string;
  description: string;
  status?: number;
  permissionIds?: number[];
}

export default function AddRolePage() {
  const [employeeOpen, setEmployeeOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [deptOpen, setDeptOpen] = useState(true);
  const toastRef = useToastRef();
  const mutation = usePostQuery({
    redirectPath: "/menu/emp-mgt",
    successMessage: "Role created successfully!",
    toastRef: toastRef,
  });

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
      {({ values, setFieldValue }) => (
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="form-container w-full lg:w-4/5 xl:w-3/4 2xl:w-2/3 mb-3">
            <div className="mt-4 main">
              <h1 className="h1-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] font-semibold">
                Add Role
              </h1>
              <Container className="scrollable-container">
                <div className="flex gap-6">
                  {/* Left Column - Role Details */}
                  <div className="flex-1 scrollable-content">
                    <h2 className="text-[#0086ED] font-semibold mb-4">Role</h2>
                    <LabelGroup
                      label="Role Code*"
                      name="roleCode"
                      type="text"
                      placeholder="ID"
                      id="formID"
                      disabled={false}
                    />
                    <LabelGroup
                      label="Title/Name*"
                      name="name"
                      type="text"
                      placeholder="Role Name"
                      id="formname"
                      disabled={false}
                    />
                    <LabelGroup
                      label="Description*"
                      name="description"
                      as="textarea"
                      rows={5}
                      placeholder="Description"
                      id="formDescription"
                      disabled={false}
                      className="border border-gray-300 rounded p-2"
                    />
                    <div className="mb-4 flex items-center gap-3">
                      <label className="text-sm font-medium">Active</label>
                      <Switch
                        checked={values.status === 1}
                        onChange={(e) => setFieldValue("status", e.target.checked ? 1 : 0)}
                      />
                    </div>
                    <div className="mt-4">
                      <Col className="btn-group w-full mr-2 p-0">
                        <Button
                          text="Reset"
                          className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                          type="reset"
                          state={true}
                          disabled={mutation.isPending}
                          id="reset"
                        />
                        <Button
                          text="Save"
                          className="bg-[#0086ED] text-white p-[12px] rounded-xl box-shadow w-full"
                          type="submit"
                          state={!mutation.isPending}
                          disabled={mutation.isPending}
                          id="submit"
                        />
                      </Col>
                    </div>
                  </div>
                  <div className="w-px bg-gray-300"></div>                 
                  <div className="flex-1">
                    <h2 className="text-[#0086ED] font-semibold mb-4">Permissions</h2>
                    <div className="space-y-3">                  
                      <div className="border border-gray-200 rounded p-3">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => setEmployeeOpen((s) => !s)}
                        >
                          <i className={`pi pi-chevron-down mr-2 transform transition-transform ${employeeOpen ? "rotate-180" : ""}`}></i>
                          <label className="font-medium cursor-pointer">Employee</label>
                        </div>
                        <div className={`mt-2 ml-4 space-y-2 ${employeeOpen ? "" : "hidden"}`}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="1"
                              checked={values.permissionIds?.includes(1)}
                              onChange={(e) => {
                                const permId = 1;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            View Employee
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="2"
                              checked={values.permissionIds?.includes(2)}
                              onChange={(e) => {
                                const permId = 2;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            Add Employee
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="3"
                              checked={values.permissionIds?.includes(3)}
                              onChange={(e) => {
                                const permId = 3;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            Edit Employee
                          </label>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded p-3">
                        <div className="flex items-center cursor-pointer" onClick={() => setUserOpen((s) => !s)}>
                          <i className={`pi pi-chevron-down mr-2 transform transition-transform ${userOpen ? "rotate-180" : ""}`}></i>
                          <label className="font-medium cursor-pointer">User</label>
                        </div>
                        <div className={`mt-2 ml-4 space-y-2 ${userOpen ? "" : "hidden"}`}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="4"
                              checked={values.permissionIds?.includes(4)}
                              onChange={(e) => {
                                const permId = 4;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            View User
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="5"
                              checked={values.permissionIds?.includes(5)}
                              onChange={(e) => {
                                const permId = 5;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            Add User
                          </label>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded p-3">
                        <div className="flex items-center cursor-pointer" onClick={() => setDeptOpen((s) => !s)}>
                          <i className={`pi pi-chevron-down mr-2 transform transition-transform ${deptOpen ? "rotate-180" : ""}`}></i>
                          <label className="font-medium cursor-pointer">Department</label>
                        </div>
                        <div className={`mt-2 ml-4 space-y-2 ${deptOpen ? "" : "hidden"}`}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="6"
                              checked={values.permissionIds?.includes(6)}
                              onChange={(e) => {
                                const permId = 6;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            View Department
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="7"
                              checked={values.permissionIds?.includes(7)}
                              onChange={(e) => {
                                const permId = 7;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            Add Department
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value="8"
                              checked={values.permissionIds?.includes(8)}
                              onChange={(e) => {
                                const permId = 8;
                                const newPerms = e.target.checked
                                  ? [...(values.permissionIds || []), permId]
                                  : values.permissionIds?.filter(p => p !== permId) || [];
                                setFieldValue("permissionIds", newPerms);
                              }}
                            />
                            Edit Department
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </Container>
            </div>
          </Form>
        </ScrollPanel>
      )}
    </Formik>
  );
}
