"use client";

import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IEmployee,
  IEmployeeUpdateRequest,
} from "@/data-types";
import { employeeEditValidationSchema } from "@/schemas";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";
import EditEmployeeSkeleton from "@/components/skeletons/EditEmployeeSkeleton";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { InputSwitch } from "primereact/inputswitch";
import { Container, Form as BootstrapForm } from "react-bootstrap";

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
  status: boolean;
}

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const toastRef = useToastRef();

  const patchMutation = usePatchQuery({
    redirectPath: "/menu/emp-mgt",
    successMessage: "Employee updated successfully!",
    toastRef: toastRef,
  });

  const {
    data: employeeResponse,
    isLoading,
    isFetching,
  } = useGetQuery<IBaseApiResponse<IEmployee> | IEmployee, undefined>(
    ["getEmployee", id ?? ""],
    `/employees/${id}`,
    undefined,
    {
      enabled: !!id,
      toastRef,
    },
  );

  const employeeData =
    employeeResponse && "data" in employeeResponse
      ? employeeResponse.data
      : employeeResponse;

  const isInitialLoading = (isLoading || isFetching) && !employeeData;

  const formatCountryCode = (countryCode: string) => {
    return countryCode.replace("+", "");
  };

  const formatMobileNumber = (mobileNumber: string) => {
    const formattedCountryCode = formatCountryCode("94");

    return mobileNumber.startsWith(formattedCountryCode)
      ? mobileNumber.substring(formattedCountryCode.length)
      : mobileNumber;
  };

  if (isInitialLoading) {
    return <EditEmployeeSkeleton />;
  }

  return (
    <Formik<InitialValues>
      enableReinitialize
      initialValues={{
        employeeId: employeeData?.employeeId ?? "",
        firstName: employeeData?.firstName ?? "",
        lastName: employeeData?.lastName ?? "",
        email: employeeData?.email ?? "",
        mobileNumber: formatMobileNumber(employeeData?.mobileNumber ?? ""),
        username: employeeData?.username ?? "",
        password: "",
        address: employeeData?.address ?? "",
        status: employeeData?.status === 1,
      }}
      validationSchema={employeeEditValidationSchema}
      onSubmit={async (values) => {
        if (!id) return;

        const fullMobileNumber = `94${values.mobileNumber}`;
        const body: IEmployeeUpdateRequest = {
          employeeId: values.employeeId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobileNumber: fullMobileNumber,
          username: values.username,
          password: values.password,
          address: values.address,
          status: values.status ? 1 : 0,
        };
        patchMutation.mutate({ url: `/employees/${id}`, body });
      }}
    >
      {({ values, setFieldValue }) => (
        <ScrollPanel style={{ width: "100%", height: "100vh" }}>
          <Form className="form-container w-full xs:w-2/3 sm:w-1/2 lg:w-2/5 xl:w-1/3 mb-3">
            <div className="mt-4 main">
              <h1 className="h1-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] font-semibold">
                Edit Employee
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
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="********"
                    id="formPassword"
                    disabled={false}
                    labelTooltip="To update the password, enter a new one. Leaving it blank keeps the existing password unchanged."
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
                  <div className="flex items-center justify-between m-2">
                    <BootstrapForm.Label>Status</BootstrapForm.Label>
                    <InputSwitch
                      id="status"
                      checked={values.status}
                      onChange={(e) => setFieldValue("status", !!e.value)}
                      className="custom-toggle custom-toggle-blue"
                    />
                  </div>
                </div>
                <div>
                  <Col className="btn-group w-full mr-2 p-0">
                    <Button
                      text="Reset"
                      className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                      type="reset"
                      state={true}
                      disabled={patchMutation.isPending}
                      id="reset"
                    />
                    <Button
                      text="Save"
                      className="bg-[#0086ED] text-white p-[12px] rounded-xl box-shadow w-full"
                      type="submit"
                      state={!patchMutation.isPending}
                      disabled={patchMutation.isPending}
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
