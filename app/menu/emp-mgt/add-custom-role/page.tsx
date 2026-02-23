"use client";

import { IEmployeeCreateRequest, IRoleCreateRequest } from "@/data-types";
import { addRoleSchema } from "@/schemas";
import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";
import Switch from '@mui/material/Switch';

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Col = dynamic(() => import("react-bootstrap/Col"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const ScrollPanel = dynamic(() =>
  import("primereact/scrollpanel").then((mod) => mod.ScrollPanel),
);
const label = { inputProps: { 'aria-label': 'Switch demo' } };

interface InitialValues {
  roleCode: string;
  roleName: string;
  description: string;
  isActive?: boolean;
}

export default function AddRolePage() {
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
        roleName: "",
        description: "",
        isActive: true,
      }}
      validationSchema={addRoleSchema}
      onSubmit={async (values) => {
        const body: IRoleCreateRequest = {
          roleCode: values.roleCode,
          roleName: values.roleName,
          description: values.description,
          isActive: values.isActive,
        };
        mutation.mutate({ url: "/employees", body });
      }}
    >
      {({ values, setFieldValue }) => (
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="form-container w-full xs:w-2/3 sm:w-1/2 lg:w-2/5 xl:w-1/3 mb-3">
            <div className="mt-4 main">
              <h1 className="h1-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] font-semibold">
                Add Role
              </h1>
              <h2 className="h2-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] pl-4">
                Role
              </h2>
              <Container className="scrollable-container">
                <div className="scrollable-content">
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
                    name="roleName"
                    type="text"
                    placeholder="Role Name"
                    id="formRoleName"
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
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm font-medium">Status</label>
                  <Switch
                    checked={values.isActive}
                    onChange={(e) => setFieldValue("isActive", e.target.checked)}
                  />
                </div>
                <div>
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
              </Container>
            </div>
          </Form>
        </ScrollPanel>
      )}
    </Formik>
  );
}
