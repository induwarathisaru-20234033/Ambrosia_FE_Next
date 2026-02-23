"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGetQuery } from "@/services/queries/getQuery";
import { Container, Col, Row } from "react-bootstrap";
import { Formik, Form, Field } from "formik";

import { DataTable, SortOrder } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useRouter } from "next/navigation"; // Next.js 13+ router
     

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });


// Types
interface EmployeeFilter {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
  status?: string; 
  pageNumber: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: SortOrder; // 1 = ASC, -1 = DESC
}

interface EmployeeDto {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  username: string;
  email: string;
  address: string;
  createdDate: string;
}

interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  items: T[];
  totalItemCount: number;
}

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}


// components
export default function ViewEmployeePage() {
  const initialFilters: EmployeeFilter = {
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

  const [filters, setFilters] = useState<EmployeeFilter>(initialFilters);

  // Custom GET hook for employee data
  const { data, isFetching } = useGetQuery<
    ApiResponse<PagedResponse<EmployeeDto>>,
    EmployeeFilter
  >(
    ["employees", JSON.stringify(filters)],
    "/employees",
    filters,
    true
  );

  const router = useRouter();

  // Handle form submission  SEARCH
  const handleSubmit = (values: EmployeeFilter) => {
    setFilters({ ...values, pageNumber: 1 }); // reset page to 1 on new search
    // refetch(); // No need to call refetch, useGetQuery will automatically fetch when filters change
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

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);

  const onSort = (event: any) => {
  const updated: EmployeeFilter= {
    ...filters,
    sortField: event.sortField,
    sortOrder: event.sortOrder as SortOrder,
    pageNumber: 1,
  };

  setFilters(updated);
  };

  return (
    <Container>
      <h1 className="h1-custom pb-4 flex justify-center xs:justify-start text-[#0086ED] font-semibold">
        Employee and Roles Management
      </h1>

{/* FILTER FORM */}
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
                <LabelGroup label="Mobile Number" name="mobileNumber" type="text" placeholder="Mobile Number" />
              </Col>
              <Col md={3}>
                <LabelGroup label="Email" name="email" type="text" placeholder="Email" />
              </Col>
              <Col md={6}>
                <LabelGroup label="Address" name="address" type="text" placeholder="Address" />
              </Col>
              </Row>
              <Row className="mb-3 align-items-end">
                              <Col md={2}>
                <label className="block mb-1 font-medium text-sm text-gray-700">Status</label>
                <Field
                  as="select"
                  name="status"
                  className="form-select w-full p-2 border border-gray-300 rounded">
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Field>
              </Col>
              <Col md={2} className="d-flex gap-2">
                <Button
                  id="filterEmployeeBtn"
                  text="Filter"
                  type="submit"
                  className="bg-[#0086ED] text-white flex-1 py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                  state={true}
                />
                <Button
                  id="clearFilterEmployeeBtn"
                  text="Clear"
                  type="button"
                  className="bg-white border border-[#0086ED] text-[#0086ED] flex-1 py-2 rounded-xl hover:bg-[#E6F0FF] hover:text-[#0056B3] transition-colors duration-200"
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
      <DataTable
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
            body={(rowData: EmployeeDto) => `${rowData.firstName} ${rowData.lastName}`}/>
        <Column field="username" header="Username" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="mobileNumber" header="Mobile Number" sortable />
        <Column field="address" header="Address" sortable />
        <Column field="status" header="Status" sortable />
        <Column
          // header=""
          body={(rowData: EmployeeDto) => (
            <button
              className="bg-[#0086ED] text-white py-1 px-3 rounded hover:bg-blue-600"
              // onClick={() => handleEdit(rowData.id)}
              onClick={(e) => { e.stopPropagation(); handleEdit(rowData.id); }}
            >
              Edit
            </button>
          )} />
      </DataTable>
    </Container>

  );
  
}
