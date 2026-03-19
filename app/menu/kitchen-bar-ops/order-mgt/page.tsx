"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import { DataTable, SortOrder } from "primereact/datatable";
import { Column } from "primereact/column";
import axiosAuth from "@/utils/AxiosInstance";
import { useGetQuery } from "@/services/queries/getQuery";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IPaginatedData,
  IBackendOrder,
  IOrder,
  SearchOrderRequest,
  OrderFilterFormValues,
} from "@/data-types";
import {
  buildOrderQueryParams,
  mapBackendOrderToUI,
} from "@/utils/orderUtils.ts";

import { YellowButton, WhiteButton } from "../layout";
import OrderDrawer from "@/components/OrderDrawer";
import { TabView, TabPanel } from "primereact/tabview";

import "../styles/kitchen-bar-ops.css";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});

export default function OrderManagementPage() {
  const router = useRouter();
  const toastRef = useToastRef();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<IOrder | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<IOrder | null>(null);

  const initialFilterFormValues: OrderFilterFormValues = {
    orderNumber: "",
    tableName: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
  };

  const initialOngoingFilters: SearchOrderRequest = {
    category: "ongoing",
    orderNumber: "",
    tableName: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
    sortField: "orderDate",
    sortOrder: -1,
    pageNumber: 1,
    pageSize: 10,
  };

  const initialDraftFilters: SearchOrderRequest = {
    orderNumber: "",
    tableName: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
    status: 1,
    sortField: "orderDate",
    sortOrder: -1,
    pageNumber: 1,
    pageSize: 10,
  };

  const initialCompletedFilters: SearchOrderRequest = {
    category: "completed",
    orderNumber: "",
    tableName: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
    sortField: "orderDate",
    sortOrder: -1,
    pageNumber: 1,
    pageSize: 10,
  };

  const [ongoingFilters, setOngoingFilters] =
    useState<SearchOrderRequest>(initialOngoingFilters);
  const [draftFilters, setDraftFilters] =
    useState<SearchOrderRequest>(initialDraftFilters);
  const [completedFilters, setCompletedFilters] =
    useState<SearchOrderRequest>(initialCompletedFilters);

  const {
    data: ongoingOrdersResponse,
    isFetching: isOngoingFetching,
    isError: isOngoingError,
  } = useGetQuery<
    IBaseApiResponse<IPaginatedData<IBackendOrder>>,
    Record<string, any>
  >(
    ["orders", "ongoing", JSON.stringify(ongoingFilters), refreshKey],
    "/orders",
    buildOrderQueryParams(ongoingFilters),
    { enabled: true, toastRef }
  );

  const {
    data: draftOrdersResponse,
    isFetching: isDraftFetching,
    isError: isDraftError,
  } = useGetQuery<
    IBaseApiResponse<IPaginatedData<IBackendOrder>>,
    Record<string, any>
  >(
    ["orders", "draft", JSON.stringify(draftFilters), refreshKey],
    "/orders",
    buildOrderQueryParams(draftFilters),
    { enabled: true, toastRef }
  );

  const {
    data: completedOrdersResponse,
    isFetching: isCompletedFetching,
    isError: isCompletedError,
  } = useGetQuery<
    IBaseApiResponse<IPaginatedData<IBackendOrder>>,
    Record<string, any>
  >(
    ["orders", "completed", JSON.stringify(completedFilters), refreshKey],
    "/orders",
    buildOrderQueryParams(completedFilters),
    { enabled: true, toastRef }
  );

  const ongoingOrders: IOrder[] = useMemo(() => {
    const orders = ongoingOrdersResponse?.data?.items ?? [];
    return orders.map((order) => mapBackendOrderToUI(order, "ongoing"));
  }, [ongoingOrdersResponse]);

  const draftOrders: IOrder[] = useMemo(() => {
    const orders = draftOrdersResponse?.data?.items ?? [];
    return orders.map((order) => mapBackendOrderToUI(order, "ongoing"));
  }, [draftOrdersResponse]);

  const completedOrders: IOrder[] = useMemo(() => {
    const orders = completedOrdersResponse?.data?.items ?? [];
    return orders.map((order) => mapBackendOrderToUI(order, "completed"));
  }, [completedOrdersResponse]);

  // UI-only mock data for now until BE is connected
  const unassignedOrders: IOrder[] = [
    {
      orderId: "1",
      tableNo: "AMB-ATZ5PUDHT",
      email: "induwara@gmail.com",
      phone: "",
      waiterName: "-",
      customerName: "induwara@gmail.com",
      orderDate: "",
      status: "unassigned",
      orderStatus: undefined,
    },
    {
      orderId: "2",
      tableNo: "AMB-ATZ5PUDHT",
      email: "induwara@gmail.com",
      phone: "",
      waiterName: "-",
      customerName: "induwara@gmail.com",
      orderDate: "",
      status: "unassigned",
      orderStatus: undefined,
    },
    {
      orderId: "3",
      tableNo: "AMB-ATZ5PUDHT",
      email: "induwara@gmail.com",
      phone: "",
      waiterName: "-",
      customerName: "induwara@gmail.com",
      orderDate: "",
      status: "unassigned",
      orderStatus: undefined,
    },
    {
      orderId: "4",
      tableNo: "AMB-ATZ5PUDHT",
      email: "induwara@gmail.com",
      phone: "",
      waiterName: "-",
      customerName: "induwara@gmail.com",
      orderDate: "",
      status: "unassigned",
      orderStatus: undefined,
    },
  ];

  const getOrderStatusLabel = (status?: number) => {
    switch (status) {
      case 1:
        return "Draft";
      case 2:
        return "Sent to KDS";
      case 3:
        return "Preparing";
      case 4:
        return "On Hold";
      case 5:
        return "Ready";
      case 6:
        return "Served";
      case 7:
        return "Cancelled";
      default:
        return "-";
    }
  };

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleEditDraft = (order: IOrder) => {
    if (!order.backendId) return;
    router.push(
      `/menu/kitchen-bar-ops/order-mgt/add-order?id=${order.backendId}`
    );
  };

  const openCancelModal = (order: IOrder) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel?.backendId) return;

    try {
      await axiosAuth.put(`/orders/${orderToCancel.backendId}/status`, {
        orderId: orderToCancel.backendId,
        status: 7,
        reason: "Cancelled from Order Management page",
      });

      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Order cancelled successfully",
        life: 3000,
      });

      setRefreshKey((prev) => prev + 1);
      closeCancelModal();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to cancel order";

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    }
  };

  const openAssignModal = (order: IOrder) => {
    setOrderToAssign(order);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setOrderToAssign(null);
  };

  const handleAssignCustomer = () => {
    toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Customer assigned successfully",
      life: 3000,
    });

    closeAssignModal();
  };

  const onOngoingPage = (event: any) => {
    const nextPageNumber = event.page + 1;
    const nextPageSize = event.rows;

    if (
      ongoingFilters.pageNumber === nextPageNumber &&
      ongoingFilters.pageSize === nextPageSize
    ) {
      return;
    }

    setOngoingFilters((prev) => ({
      ...prev,
      pageNumber: nextPageNumber,
      pageSize: nextPageSize,
    }));
  };

  const onOngoingSort = (event: any) => {
    const nextSortField = event.sortField;
    const nextSortOrder = event.sortOrder as SortOrder;

    if (
      ongoingFilters.sortField === nextSortField &&
      ongoingFilters.sortOrder === nextSortOrder
    ) {
      return;
    }

    setOngoingFilters((prev) => ({
      ...prev,
      sortField: nextSortField,
      sortOrder: nextSortOrder,
      pageNumber: 1,
    }));
  };

  const onDraftPage = (event: any) => {
    const nextPageNumber = event.page + 1;
    const nextPageSize = event.rows;

    if (
      draftFilters.pageNumber === nextPageNumber &&
      draftFilters.pageSize === nextPageSize
    ) {
      return;
    }

    setDraftFilters((prev) => ({
      ...prev,
      pageNumber: nextPageNumber,
      pageSize: nextPageSize,
    }));
  };

  const onDraftSort = (event: any) => {
    const nextSortField = event.sortField;
    const nextSortOrder = event.sortOrder as SortOrder;

    if (
      draftFilters.sortField === nextSortField &&
      draftFilters.sortOrder === nextSortOrder
    ) {
      return;
    }

    setDraftFilters((prev) => ({
      ...prev,
      sortField: nextSortField,
      sortOrder: nextSortOrder,
      pageNumber: 1,
    }));
  };

  const onCompletedPage = (event: any) => {
    const nextPageNumber = event.page + 1;
    const nextPageSize = event.rows;

    if (
      completedFilters.pageNumber === nextPageNumber &&
      completedFilters.pageSize === nextPageSize
    ) {
      return;
    }

    setCompletedFilters((prev) => ({
      ...prev,
      pageNumber: nextPageNumber,
      pageSize: nextPageSize,
    }));
  };

  const onCompletedSort = (event: any) => {
    const nextSortField = event.sortField;
    const nextSortOrder = event.sortOrder as SortOrder;

    if (
      completedFilters.sortField === nextSortField &&
      completedFilters.sortOrder === nextSortOrder
    ) {
      return;
    }

    setCompletedFilters((prev) => ({
      ...prev,
      sortField: nextSortField,
      sortOrder: nextSortOrder,
      pageNumber: 1,
    }));
  };

  return (
    <Container fluid className="relative">
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black opacity-30 z-40"></div>
      )}

      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="kbo-title">Order Management and History</h1>
        </Col>

        <Col xs="auto">
          <YellowButton
            onClick={() => {
              window.location.href = "/menu/kitchen-bar-ops/order-mgt/add-order";
            }}
          >
            Add Order
          </YellowButton>
        </Col>
      </Row>

      <TabView className="custom-tabs-order-mgt mb-4">
        <TabPanel header="Ongoing Orders">
          <Formik<OrderFilterFormValues>
            initialValues={{
              orderNumber: ongoingFilters.orderNumber,
              tableName: ongoingFilters.tableName,
              waiterName: ongoingFilters.waiterName,
              customerName: ongoingFilters.customerName,
              orderDateFrom: ongoingFilters.orderDateFrom,
              orderDateTo: ongoingFilters.orderDateTo,
            }}
            enableReinitialize
            onSubmit={(values) =>
              setOngoingFilters((prev) => ({
                ...prev,
                orderNumber: values.orderNumber,
                tableName: values.tableName,
                waiterName: values.waiterName,
                customerName: values.customerName,
                orderDateFrom: values.orderDateFrom,
                orderDateTo: values.orderDateTo,
                pageNumber: 1,
              }))
            }
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={2}>
                    <LabelGroup
                      label="Order Number"
                      name="orderNumber"
                      type="text"
                      placeholder="Order Number"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Table"
                      name="tableName"
                      type="text"
                      placeholder="Table"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Waiter Name"
                      name="waiterName"
                      type="text"
                      placeholder="Waiter Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Customer Name"
                      name="customerName"
                      type="text"
                      placeholder="Customer Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date From"
                      name="orderDateFrom"
                      type="date"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date To"
                      name="orderDateTo"
                      type="date"
                    />
                  </Col>
                  <Col md={2} className="d-flex gap-2 mt-2">
                    <YellowButton type="submit">Filter</YellowButton>
                    <WhiteButton
                      type="button"
                      onClick={() => {
                        resetForm({ values: initialFilterFormValues });
                        setOngoingFilters(initialOngoingFilters);
                      }}
                    >
                      Clear
                    </WhiteButton>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          {isOngoingError && (
            <p className="text-red-500">Failed to load ongoing orders.</p>
          )}

          <DataTable
            stripedRows
            removableSort
            value={ongoingOrders}
            lazy
            paginator
            first={(ongoingFilters.pageNumber - 1) * ongoingFilters.pageSize}
            rows={ongoingFilters.pageSize}
            totalRecords={ongoingOrdersResponse?.data?.totalItemCount || 0}
            onPage={onOngoingPage}
            onSort={onOngoingSort}
            sortField={ongoingFilters.sortField}
            sortOrder={ongoingFilters.sortOrder ?? 0}
            loading={isOngoingFetching}
            rowsPerPageOptions={[5, 10, 20, 50]}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order Name" sortable />
            <Column field="tableNo" header="Table" sortable />
            <Column field="waiterName" header="Waiter Name" sortable />
            <Column field="customerName" header="Customer Name" sortable />
            <Column field="orderDate" header="Order Date" sortable />
            <Column
              field="orderStatus"
              header="Status"
              sortable
              body={(rowData: IOrder) => getOrderStatusLabel(rowData.orderStatus)}
            />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleViewOrder(rowData)}>
                    View Order
                  </YellowButton>
                  <WhiteButton onClick={() => openCancelModal(rowData)}>
                    Cancel
                  </WhiteButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Draft Orders">
          <Formik<OrderFilterFormValues>
            initialValues={{
              orderNumber: draftFilters.orderNumber,
              tableName: draftFilters.tableName,
              waiterName: draftFilters.waiterName,
              customerName: draftFilters.customerName,
              orderDateFrom: draftFilters.orderDateFrom,
              orderDateTo: draftFilters.orderDateTo,
            }}
            enableReinitialize
            onSubmit={(values) =>
              setDraftFilters((prev) => ({
                ...prev,
                orderNumber: values.orderNumber,
                tableName: values.tableName,
                waiterName: values.waiterName,
                customerName: values.customerName,
                orderDateFrom: values.orderDateFrom,
                orderDateTo: values.orderDateTo,
                pageNumber: 1,
              }))
            }
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={2}>
                    <LabelGroup
                      label="Order Number"
                      name="orderNumber"
                      type="text"
                      placeholder="Order Number"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Table"
                      name="tableName"
                      type="text"
                      placeholder="Table"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Waiter Name"
                      name="waiterName"
                      type="text"
                      placeholder="Waiter Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Customer Name"
                      name="customerName"
                      type="text"
                      placeholder="Customer Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date From"
                      name="orderDateFrom"
                      type="date"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date To"
                      name="orderDateTo"
                      type="date"
                    />
                  </Col>
                  <Col md={2} className="d-flex gap-2 mt-2">
                    <YellowButton type="submit">Filter</YellowButton>
                    <WhiteButton
                      type="button"
                      onClick={() => {
                        resetForm({ values: initialFilterFormValues });
                        setDraftFilters(initialDraftFilters);
                      }}
                    >
                      Clear
                    </WhiteButton>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          {isDraftError && (
            <p className="text-red-500">Failed to load draft orders.</p>
          )}

          <DataTable
            stripedRows
            removableSort
            value={draftOrders}
            lazy
            paginator
            first={(draftFilters.pageNumber - 1) * draftFilters.pageSize}
            rows={draftFilters.pageSize}
            totalRecords={draftOrdersResponse?.data?.totalItemCount || 0}
            onPage={onDraftPage}
            onSort={onDraftSort}
            sortField={draftFilters.sortField}
            sortOrder={draftFilters.sortOrder ?? 0}
            loading={isDraftFetching}
            rowsPerPageOptions={[5, 10, 20, 50]}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order Number" sortable />
            <Column field="tableNo" header="Table" sortable />
            <Column field="waiterName" header="Waiter Name" sortable />
            <Column field="customerName" header="Customer Name" sortable />
            <Column field="orderDate" header="Order Date" sortable />
            <Column
              field="orderStatus"
              header="Status"
              sortable
              body={(rowData: IOrder) => getOrderStatusLabel(rowData.orderStatus)}
            />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleEditDraft(rowData)}>
                    Edit
                  </YellowButton>
                  <WhiteButton onClick={() => handleViewOrder(rowData)}>
                    View
                  </WhiteButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Completed Orders">
          <Formik<OrderFilterFormValues>
            initialValues={{
              orderNumber: completedFilters.orderNumber,
              tableName: completedFilters.tableName,
              waiterName: completedFilters.waiterName,
              customerName: completedFilters.customerName,
              orderDateFrom: completedFilters.orderDateFrom,
              orderDateTo: completedFilters.orderDateTo,
            }}
            enableReinitialize
            onSubmit={(values) =>
              setCompletedFilters((prev) => ({
                ...prev,
                orderNumber: values.orderNumber,
                tableName: values.tableName,
                waiterName: values.waiterName,
                customerName: values.customerName,
                orderDateFrom: values.orderDateFrom,
                orderDateTo: values.orderDateTo,
                pageNumber: 1,
              }))
            }
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={2}>
                    <LabelGroup
                      label="Order ID"
                      name="orderNumber"
                      type="text"
                      placeholder="Order ID"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Table No"
                      name="tableName"
                      type="text"
                      placeholder="Table No"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Waiter Name"
                      name="waiterName"
                      type="text"
                      placeholder="Waiter Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Customer Name"
                      name="customerName"
                      type="text"
                      placeholder="Customer Name"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date From"
                      name="orderDateFrom"
                      type="date"
                    />
                  </Col>
                  <Col md={2}>
                    <LabelGroup
                      label="Order Date To"
                      name="orderDateTo"
                      type="date"
                    />
                  </Col>
                  <Col md={2} className="d-flex gap-2 mt-2">
                    <YellowButton type="submit">Filter</YellowButton>
                    <WhiteButton
                      type="button"
                      onClick={() => {
                        resetForm({ values: initialFilterFormValues });
                        setCompletedFilters(initialCompletedFilters);
                      }}
                    >
                      Clear
                    </WhiteButton>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          {isCompletedError && (
            <p className="text-red-500">Failed to load completed orders.</p>
          )}

          <DataTable
            stripedRows
            removableSort
            value={completedOrders}
            lazy
            paginator
            first={(completedFilters.pageNumber - 1) * completedFilters.pageSize}
            rows={completedFilters.pageSize}
            totalRecords={completedOrdersResponse?.data?.totalItemCount || 0}
            onPage={onCompletedPage}
            onSort={onCompletedSort}
            sortField={completedFilters.sortField}
            sortOrder={completedFilters.sortOrder ?? 0}
            loading={isCompletedFetching}
            rowsPerPageOptions={[5, 10, 20, 50]}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order ID" sortable />
            <Column field="tableNo" header="Table" sortable />
            <Column field="waiterName" header="Waiter Name" sortable />
            <Column field="customerName" header="Customer Name" sortable />
            <Column field="orderDate" header="Order Date" sortable />
            <Column
              field="orderStatus"
              header="Status"
              sortable
              body={(rowData: IOrder) => getOrderStatusLabel(rowData.orderStatus)}
            />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleViewOrder(rowData)}>
                    View Order
                  </YellowButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        <TabPanel header="Unassigned Customers">
          <DataTable
            stripedRows
            value={unassignedOrders}
            paginator
            rows={10}
            responsiveLayout="scroll"
          >
            <Column field="tableNo" header="Table" />
            <Column field="customerName" header="Customer" />
            <Column
              header=""
              body={(rowData: IOrder) => (
                <div className="flex justify-center">
                  <YellowButton onClick={() => openAssignModal(rowData)}>
                    Assign
                  </YellowButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>
      </TabView>

      {isDrawerOpen && selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={handleCloseDrawer} />
      )}

      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white w-[720px] max-w-[90%] rounded shadow-xl overflow-hidden">
            <div className="bg-[#F0A84B] px-6 py-4 flex justify-between items-center relative">
              <div className="w-full text-center">
                <h2 className="text-white text-2xl font-semibold">
                  Cancel Order
                </h2>
              </div>
              <button
                type="button"
                className="text-white text-3xl leading-none absolute right-6 top-1/2 -translate-y-1/2"
                onClick={closeCancelModal}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-2xl text-gray-600 font-semibold mb-8">
                Do you want to cancel the order #{orderToCancel.orderId}?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="bg-[#F0A84B] text-white px-10 py-2 rounded-md font-medium hover:opacity-90"
                  onClick={handleCancelOrder}
                >
                  Confirm
                </button>

                <button
                  type="button"
                  className="border border-[#F0A84B] text-[#6B7280] px-10 py-2 rounded-md font-medium bg-white hover:bg-gray-50"
                  onClick={closeCancelModal}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && orderToAssign && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white w-[720px] max-w-[90%] rounded shadow-xl overflow-hidden">
            <div className="bg-[#F0A84B] px-6 py-4 flex justify-between items-center relative">
              <div className="w-full text-center">
                <h2 className="text-white text-2xl font-semibold">
                  Assign Customer
                </h2>
              </div>
              <button
                type="button"
                className="text-white text-3xl leading-none absolute right-6 top-1/2 -translate-y-1/2"
                onClick={closeAssignModal}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-2xl text-gray-600 font-semibold mb-8">
                Do you want to assign this customer to yourself?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="bg-[#F0A84B] text-white px-10 py-2 rounded-md font-medium hover:opacity-90"
                  onClick={handleAssignCustomer}
                >
                  Confirm
                </button>

                <button
                  type="button"
                  className="border border-[#F0A84B] text-[#6B7280] px-10 py-2 rounded-md font-medium bg-white hover:bg-gray-50"
                  onClick={closeAssignModal}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}