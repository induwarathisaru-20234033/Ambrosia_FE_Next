"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGetQuery } from "@/services/queries/getQuery";
import { Container, Col, Row } from "react-bootstrap";
import { Formik, Form } from "formik";
import { DataTable, SortOrder } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRouter, useSearchParams } from "next/navigation";
import { TabView, TabPanel } from "primereact/tabview";
import { useToastRef } from "@/contexts/ToastContext";
import ViewRoleDrawer from "@/components/ViewRoleDrawer";
import {
  IBaseApiResponse,
  IPaginatedApiResponse,
  SearchEmployeeRequest,
  IEmployee,
} from "@/data-types";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface IRolePermission {
  id: number;
  permissionCode: string;
  name: string;
  featureId: number;
  featureCode: string;
  featureName: string;
}

interface IRole {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  createdDate: string;
  permissions: IRolePermission[];
}

interface SearchRoleRequest {
  roleName: string;
  description: string;
  pageNumber: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: SortOrder;
}

interface IRoleViewPermission {
  id: number;
  permissionCode: string;
  name: string;
  description: string;
  isSelected: boolean;
}

interface IRoleViewPermissionGroup {
  featureId: number;
  featureCode: string;
  featureName: string;
  permissions: IRoleViewPermission[];
}

interface IRoleViewData {
  id: number;
  roleCode: string;
  name: string;
  description: string;
  status: number;
  selectedPermissionIds: number[];
  permissionGroups: IRoleViewPermissionGroup[];
}

export default function ViewEmployeePage() {
  const router = useRouter();
  const toastRef = useToastRef();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");

  const [activeIndex, setActiveIndex] = useState(tabParam === "roles" ? 1 : 0);
  const [isViewRoleOpen, setIsViewRoleOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const initialEmployeeFilters: SearchEmployeeRequest = {
    employeeId: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobileNumber: "",
    address: "",
    pageNumber: 1,
    pageSize: 10,
  };

  const initialRoleFilters: SearchRoleRequest = {
    roleName: "",
    description: "",
    pageNumber: 1,
    pageSize: 10,
  };

  const [employeeFilters, setEmployeeFilters] =
    useState<SearchEmployeeRequest>(initialEmployeeFilters);

  const [roleFilters, setRoleFilters] =
    useState<SearchRoleRequest>(initialRoleFilters);

  const { data: employeeData, isFetching: isFetchingEmployees } = useGetQuery<
    IPaginatedApiResponse<IEmployee>,
    SearchEmployeeRequest
  >(
    ["employees", JSON.stringify(employeeFilters)],
    "/employees",
    employeeFilters,
    {
      enabled: true,
      toastRef,
    },
  );

  const { data: roleData, isFetching: isFetchingRoles } = useGetQuery<
    IPaginatedApiResponse<IRole>,
    any
  >(
    ["roles", JSON.stringify(roleFilters)],
    "/roles",
    {
      RoleName: roleFilters.roleName,
      Description: roleFilters.description,
      PageNumber: roleFilters.pageNumber,
      PageSize: roleFilters.pageSize,
    },
    {
      enabled: true,
      toastRef,
    },
  );

  const {
    data: selectedRoleResponse,
    isFetching: isFetchingSelectedRole,
  } = useGetQuery<IBaseApiResponse<IRoleViewData>, any>(
    ["role-view", selectedRoleId ?? 0],
    `/roles/${selectedRoleId}`,
    {
      includePermissions: true,
      includeFeatures: true,
    },
    {
      enabled: !!selectedRoleId && isViewRoleOpen,
      toastRef,
    },
  );

  const selectedRole = selectedRoleResponse?.data || null;

  const handleEmployeeSubmit = (values: SearchEmployeeRequest) => {
    setEmployeeFilters({ ...values, pageNumber: 1 });
  };

  const handleRoleSubmit = (values: SearchRoleRequest) => {
    setRoleFilters({ ...values, pageNumber: 1 });
  };

  const onEmployeePage = (event: any) => {
    setEmployeeFilters((prev) => ({
      ...prev,
      pageNumber: event.page + 1,
      pageSize: event.rows,
    }));
  };

  const onRolePage = (event: any) => {
    setRoleFilters((prev) => ({
      ...prev,
      pageNumber: event.page + 1,
      pageSize: event.rows,
    }));
  };

  const onEmployeeSort = (event: any) => {
    setEmployeeFilters((prev) => ({
      ...prev,
      sortField: event.sortField,
      sortOrder: event.sortOrder as SortOrder,
      pageNumber: 1,
    }));
  };

  const onRoleSort = (event: any) => {
    setRoleFilters((prev) => ({
      ...prev,
      sortField: event.sortField,
      sortOrder: event.sortOrder as SortOrder,
      pageNumber: 1,
    }));
  };

  const renderStatus = (status: number) => {
    return status === 1 ? <div>Active</div> : <div>Inactive</div>;
  };

  const handleEmployeeEdit = (id: string | number) => {
    router.push(`/menu/emp-mgt/employee/${id}`);
  };

  const handleRoleEdit = (id: number) => {
    router.push(`/menu/emp-mgt/roles/${id}`);
  };

  const handleAssignRole = (id: number) => {
    router.push(`/menu/emp-mgt/roles/${id}/assign`);
  };

  const handleUnassignRole = (id: number) => {
    router.push(`/menu/emp-mgt/roles/${id}/unassign`);
  };

  const handleViewRole = (id: number) => {
    setSelectedRoleId(id);
    setIsViewRoleOpen(true);
  };

  const handleCloseViewRoleDrawer = () => {
    setIsViewRoleOpen(false);
    setSelectedRoleId(null);
  };

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="text-5xl my-6 text-[#0086ED] font-bold">
            Employee and Roles Management
          </h1>
        </Col>

        <Col xs="auto">
          <Button
            id="addBtn"
            text={activeIndex === 0 ? "Add Employee" : "Add Custom Role"}
            type="button"
            className="bg-[#0086ED] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={() =>
              router.push(
                activeIndex === 0
                  ? "/menu/emp-mgt/employee/add"
                  : "/menu/emp-mgt/roles/add-custom-role",
              )
            }
          />
        </Col>
      </Row>

      <TabView
        className="custom-tabs mb-4"
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Employees">
          <Formik
            initialValues={employeeFilters}
            enableReinitialize
            onSubmit={handleEmployeeSubmit}
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={3}>
                    <LabelGroup
                      label="Employee ID"
                      name="employeeId"
                      type="text"
                      placeholder="Employee ID"
                    />
                  </Col>
                  <Col md={3}>
                    <LabelGroup
                      label="First Name"
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                    />
                  </Col>
                  <Col md={3}>
                    <LabelGroup
                      label="Last Name"
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                    />
                  </Col>
                  <Col md={3}>
                    <LabelGroup
                      label="Username"
                      name="username"
                      type="text"
                      placeholder="Username"
                    />
                  </Col>
                </Row>

                <Row className="mb-3 align-items-end">
                  <Col md={3}>
                    <LabelGroup
                      label="Phone Number"
                      name="mobileNumber"
                      type="text"
                      placeholder="Phone Number"
                    />
                  </Col>
                  <Col md={3}>
                    <LabelGroup
                      label="Email"
                      name="email"
                      type="text"
                      placeholder="Email"
                    />
                  </Col>
                  <Col md={3}>
                    <LabelGroup
                      label="Address"
                      name="address"
                      type="text"
                      placeholder="Address"
                    />
                  </Col>
                </Row>

                <Row className="mb-3 align-items-end">
                  <Col md={2} className="d-flex gap-2">
                    <Button
                      id="filterEmployeeBtn"
                      text="Filter"
                      type="submit"
                      className="bg-[#0086ED] text-white flex-1 py-2 shadow-md rounded-md"
                      state={true}
                    />
                    <Button
                      id="clearFilterEmployeeBtn"
                      text="Clear"
                      type="button"
                      className="bg-white border border-[#0086ED] text-[#0086ED] flex-1 py-2 shadow-md rounded-md"
                      state={true}
                      onClick={() => {
                        resetForm({ values: initialEmployeeFilters });
                        setEmployeeFilters(initialEmployeeFilters);
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          <DataTable
            stripedRows
            removableSort
            value={employeeData?.data?.items || []}
            lazy
            paginator
            first={(employeeFilters.pageNumber - 1) * employeeFilters.pageSize}
            rows={employeeFilters.pageSize}
            totalRecords={employeeData?.data?.totalItemCount || 0}
            onPage={onEmployeePage}
            onSort={onEmployeeSort}
            sortField={employeeFilters.sortField}
            sortOrder={employeeFilters.sortOrder ?? 0}
            loading={isFetchingEmployees}
            rowsPerPageOptions={[5, 10, 20, 50]}
          >
            <Column field="employeeId" header="Employee ID" sortable />
            <Column
              header="Full Name"
              sortable
              body={(rowData: IEmployee) =>
                `${rowData.firstName} ${rowData.lastName}`
              }
            />
            <Column field="username" header="Username" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="mobileNumber" header="Phone Number" sortable />
            <Column field="address" header="Address" sortable />
            <Column
              header="Status"
              sortable
              body={(rowData: IEmployee) => renderStatus(rowData.status)}
            />
            <Column
              header="Action"
              body={(rowData: IEmployee) => (
                <button
                  type="button"
                  className="bg-[#0086ED] text-white py-1 px-3 rounded-md hover:bg-blue-600"
                  onClick={() => handleEmployeeEdit(rowData.id)}
                >
                  Edit
                </button>
              )}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Roles">
          <Formik
            initialValues={roleFilters}
            enableReinitialize
            onSubmit={handleRoleSubmit}
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={3}>
                    <LabelGroup
                      label="Role Name"
                      name="roleName"
                      type="text"
                      placeholder="Role Name"
                    />
                  </Col>

                  <Col md={3}>
                    <LabelGroup
                      label="Description"
                      name="description"
                      type="text"
                      placeholder="Description"
                    />
                  </Col>

                  <Col md={2} className="d-flex gap-2">
                    <Button
                      id="filterRoleBtn"
                      text="Filter"
                      type="submit"
                      className="bg-[#0086ED] text-white flex-1 py-2 shadow-md rounded-md"
                      state={true}
                    />
                    <Button
                      id="clearFilterRoleBtn"
                      text="Clear"
                      type="button"
                      className="bg-white border border-[#0086ED] text-[#0086ED] flex-1 py-2 shadow-md rounded-md"
                      state={true}
                      onClick={() => {
                        resetForm({ values: initialRoleFilters });
                        setRoleFilters(initialRoleFilters);
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          <DataTable
            stripedRows
            removableSort
            value={roleData?.data?.items || []}
            lazy
            paginator
            first={(roleFilters.pageNumber - 1) * roleFilters.pageSize}
            rows={roleFilters.pageSize}
            totalRecords={roleData?.data?.totalItemCount || 0}
            onPage={onRolePage}
            onSort={onRoleSort}
            sortField={roleFilters.sortField}
            sortOrder={roleFilters.sortOrder ?? 0}
            loading={isFetchingRoles}
            rowsPerPageOptions={[5, 10, 20, 50]}
          >
            <Column field="roleCode" header="Role Code" sortable />
            <Column field="name" header="Role Name" sortable />
            <Column field="description" header="Description" sortable />
            <Column
              field="status"
              header="Status"
              sortable
              body={(rowData: IRole) => renderStatus(rowData.status)}
            />
            <Column
              header="Action"
              body={(rowData: IRole) => (
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="bg-[#0086ED] text-white py-1 px-3 rounded-md hover:bg-blue-600"
                    onClick={() => handleRoleEdit(rowData.id)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="bg-[#0086ED] text-white py-1 px-3 rounded-md hover:bg-blue-600"
                    onClick={() => handleAssignRole(rowData.id)}
                  >
                    Assign
                  </button>

                  <button
                    type="button"
                    className="bg-[#0086ED] text-white py-1 px-3 rounded-md hover:bg-blue-600"
                    onClick={() => handleUnassignRole(rowData.id)}
                  >
                    Un-Assign
                  </button>

                  <button
                    type="button"
                    className="bg-white border border-[#0086ED] text-[#0086ED] py-1 px-3 rounded-md hover:bg-[#E6F0FF]"
                    onClick={() => handleViewRole(rowData.id)}
                  >
                    View
                  </button>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>
      </TabView>

      {isViewRoleOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleCloseViewRoleDrawer}
          />
          <ViewRoleDrawer
            role={selectedRole}
            onClose={handleCloseViewRoleDrawer}
          />
        </>
      )}
    </Container>
  );
}