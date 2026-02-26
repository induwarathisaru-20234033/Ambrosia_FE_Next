"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGetQuery } from "@/services/queries/getQuery";
import { Container, Col, Row } from "react-bootstrap";
import { Formik, Form, Field } from "formik";

import { DataTable, SortOrder } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useRouter } from "next/navigation"; // Next.js 13+ router
import { TabView,TabPanel } from "primereact/tabview";

import { IBaseApiResponse, IPaginatedApiResponse, IEmployeeCreateRequest} from "@/data-types"; 
import { SearchEmployeeRequest, IEmployee } from "@/data-types";
     

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });


// components
export default function ViewEmployeePage() {
  const initialFilters: SearchEmployeeRequest = {
    employeeId: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobileNumber: "",
    address: "",
    pageNumber: 1,
    pageSize: 10
  };

  const [filters, setFilters] = useState<SearchEmployeeRequest>(initialFilters);

  // Custom GET hook for employee data
  const { data, isFetching } = useGetQuery<
    IBaseApiResponse<IPaginatedApiResponse<IEmployee>>, SearchEmployeeRequest>
    (
        ["employees", JSON.stringify(filters)],
        "/employees",
        filters,
        true
    );

  const router = useRouter();

  // Handle form submission  SEARCH
  const handleSubmit = (values: SearchEmployeeRequest) => {
    setFilters({ ...values, pageNumber: 1 }); // reset page to 1 on new search
 };

  // PAGINATION (SERVER SIDE)
  const onPage = (event: any) => {
    const updated = {
      ...filters,
      pageNumber: event.page + 1,
      pageSize: event.rows,
    };

    setFilters(updated);
    // refetch();
  };

  const handleEdit = (employeeId: number) => {
    router.push(`/employees/edit/${employeeId}`); // navigate to edit page
  };

  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

  const onSort = (event: any) => {
  const updated: SearchEmployeeRequest= {
    ...filters,
    sortField: event.sortField,
    sortOrder: event.sortOrder as SortOrder,
    pageNumber: 1,
  };

  setFilters(updated);
  };
  

  return (

    <Container fluid>
        <Row className="align-items-center mb-4">
            <Col>
                <h1 className="h1-custom text-[#0086ED] font-semibold">
                Employee and Roles Management
                </h1>
            </Col>

            <Col xs="auto">
                <Button
                id="addEmployeeBtn"
                text="Add Employee"
                type="button"
                className="bg-[#0086ED] text-white px-4 py-2 rounded-xl shadow-md"
                state={true}
                onClick={() => router.push("/menu/emp-mgt/add-employee")}
                />
            </Col>
        </Row>

        <TabView className="custom-tabs mb-4">
            <TabPanel header="Employees">

        <Formik initialValues={filters} enableReinitialize onSubmit={handleSubmit}>
                {({ resetForm }) => (
          <Form>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <LabelGroup label="Employee ID" name="employeeId" type="text" placeholder="Employee ID" />
              </Col>
              <Col md={3}>
                <LabelGroup label="First Name" name="firstName" type="text" placeholder="First Name" />
              </Col>
              <Col md={3}>
                <LabelGroup label="Last Name" name="lastName" type="text" placeholder="Last Name" />
              </Col>
              <Col md={3}>
                <LabelGroup label="Username" name="username" type="text" placeholder="Username" />
              </Col>
            </Row>
            
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <LabelGroup label="Phone Number" name="mobileNumber" type="text" placeholder="Phone Number" />
              </Col>
              <Col md={3}>
                <LabelGroup label="Email" name="email" type="text" placeholder="Email" />
              </Col>
              <Col md={3}>
                <LabelGroup label="Address" name="address" type="text" placeholder="Address" />
              </Col>
              </Row>
              <Row className="mb-3 align-items-end">
                <Col md={2} className="d-flex gap-2">
                    <Button
                        id="filterEmployeeBtn"
                        text="Filter"
                        type="submit"
                        className="bg-[#0086ED] text-white flex-1 py-2 rounded-none hover:bg-blue-600 transition-colors duration-200 shadow-md"
                        state={true}
                    />
                    <Button
                        id="clearFilterEmployeeBtn"
                        text="Clear"
                        type="button"
                        className="bg-white border border-[#0086ED] text-[#0086ED] flex-1 py-2 rounded-none hover:bg-[#E6F0FF] hover:text-[#0056B3] transition-colors duration-200 shadow-md"
                        state={true}
                        onClick={() => {
                                resetForm({ values: initialFilters });
                                setFilters(initialFilters);
                            }}
                    />
                </Col>
              </Row>
          </Form>
        )}
      </Formik>

{/* DATATABLE  */}
      <DataTable stripedRows removableSort
        value={data?.data?.items || []}
        lazy
        paginator
        first={(filters.pageNumber - 1) * filters.pageSize}
        rows={filters.pageSize}
        totalRecords={data?.data?.totalItemCount || 0}
        onPage={onPage}
        onSort={onSort}
        sortField={filters.sortField}
        sortOrder={filters.sortOrder ?? 0}
        loading={isFetching}
        rowsPerPageOptions={[5, 10, 20, 50]}
        responsiveLayout="scroll"
      >
        <Column field="employeeId" header="Employee ID" sortable />
        <Column header="Full Name" sortable
            body={(rowData: IEmployee) => `${rowData.firstName} ${rowData.lastName}`}/>
        <Column field="username" header="Username" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="mobileNumber" header="Phone Number" sortable />
        <Column field="address" header="Address" sortable />
        <Column field="status" header="Status" sortable />
        <Column
          // header=""
          body={(rowData: IEmployee) => (
            <button
              className="bg-[#0086ED] text-white py-1 px-3 rounded-n hover:bg-blue-600"
            >
              Edit
            </button>
          )} />
      </DataTable>
            </TabPanel>

            <TabPanel header="Roles">
                <div className="p-3">
                <h5>Roles content goes here</h5>
                </div>
            </TabPanel>
        </TabView>
    </Container>

  );
  
}
