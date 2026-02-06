"use client";

import { IEmployeeCreateRequest } from "@/data-types";
import { addEmployeeSchema } from "@/schemas";
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
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  username: string;
  password: string;
  address: string;
}

export default function AddEmployeePage() {
  const mutation = usePostQuery({
    redirectPath: "/menu/emp-mgt",
    successMessage: "Employee created successfully",
  });

  return (
    <Formik<InitialValues>
      initialValues={{
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        username: "",
        password: "",
        address: "",
      }}
      validationSchema={addEmployeeSchema}
      onSubmit={async (values) => {
        const fullMobileNumber = `94${values.mobileNumber}`;
        const body: IEmployeeCreateRequest = {
          employeeId: values.employeeId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobileNumber: fullMobileNumber,
          username: values.username,
          password: values.password,
          address: values.address,
        };
        mutation.mutate({ url: "/employees", body });
      }}
    >
      {
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="form-container w-full xs:w-2/3 sm:w-1/2 lg:w-2/5 xl:w-1/3 mb-3">
            <div className="mt-4 main">
              <h1 className="h1-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] font-semibold">
                Add Employee
              </h1>
              <Container className="scrollable-container">
                <div className="scrollable-content">
                  <LabelGroup
                    label="Employee Id*"
                    name="employeeId"
                    type="text"
                    placeholder="ID"
                    id="formID"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Username*"
                    name="username"
                    type="text"
                    placeholder="Username"
                    id="formUserName"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Password*"
                    name="password"
                    type="password"
                    placeholder="Password"
                    id="formPassword"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    id="formEmail"
                    disabled={false}
                  />
                  <LabelGroup
                    label="First Name*"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    id="formFirstName"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Last Name*"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    id="formLastName"
                    disabled={false}
                  />
                  <LabelGroup
                    label="Mobile Number*"
                    name="mobileNumber"
                    type="text"
                    placeholder="Mobile Number"
                    id="formMobileNumber"
                    disabled={false}
                    prefix={`+94`}
                  />
                  <LabelGroup
                    name="address"
                    label="Address*"
                    type="text"
                    id="address"
                    placeholder="Address"
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
