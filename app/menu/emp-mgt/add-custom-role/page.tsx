"use client";

import { IEmployeeCreateRequest, IRoleCreateRequest } from "@/data-types";
import { addEmployeeSchema } from "@/schemas";
import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Col = dynamic(() => import("react-bootstrap/Col"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const ScrollPanel = dynamic(() =>
  import("primereact/scrollpanel").then((mod) => mod.ScrollPanel),
);

interface InitialValues {
  roleCode: string;
  roleName: string;
  description: string;
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
      }}
      validationSchema={addEmployeeSchema}
      onSubmit={async (values) => {
        const body: IRoleCreateRequest = {
          roleCode: values.roleCode,
          roleName: values.roleName,
          description: values.description,
        };
        mutation.mutate({ url: "/employees", body });
      }}
    >
      {
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
                    type="text"
                    placeholder="Description"
                    id="formDescription"
                    disabled={false}
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
      }
    </Formik>
  );
}
