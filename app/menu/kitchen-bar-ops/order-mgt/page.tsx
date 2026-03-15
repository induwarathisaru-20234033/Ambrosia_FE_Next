"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { YellowButton, WhiteButton } from "../layout"; 
import OrderDrawer from "@/components/OrderDrawer";
import { TabView, TabPanel } from "primereact/tabview";

import "../styles/kitchen-bar-ops.css";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), { ssr: false });

interface IOrderItem {
  name: string;
  quantity: number;
  price: string;
}

export interface IOrder {
  orderId: string;
  tableNo: string;
  email: string;
  phone: string;
  waiterName: string;
  customerName: string;
  orderDate: string;
  status: "ongoing" | "completed" | "unassigned";
  items?: IOrderItem[];
}

export default function OrderManagementPage() {
  const router = useRouter();

  const initialFilters = {
    orderId: "",
    tableNo: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
  };

  const [ongoingFilters, setOngoingFilters] = useState(initialFilters);
  const [completedFilters, setCompletedFilters] = useState(initialFilters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const [orders] = useState<IOrder[]>([
    {
      orderId: "AMB-ATZ5PUDHT",
      tableNo: "14",
      email: "induwara@gmail.com",
      phone: "+94762387190",
      waiterName: "Induwara",
      customerName: "Saman Perera",
      orderDate: "2026-03-10",
      status: "ongoing",
      items: [
        { name: "Burger", quantity: 2, price: "Rs. 450" },
        { name: "Coke", quantity: 1, price: "Rs. 150" },
      ],
    },
    {
      orderId: "AMB-XYZ12345",
      tableNo: "12",
      email: "nimal@gmail.com",
      phone: "+94712345678",
      waiterName: "Nimal",
      customerName: "Kamal Silva",
      orderDate: "2026-03-12",
      status: "completed",
      items: [
        { name: "Pizza", quantity: 1, price: "Rs. 800" },
        { name: "Sprite", quantity: 2, price: "Rs. 300" },
      ],
    },
    {
      orderId: "AMB-ABC98765",
      tableNo: "5",
      email: "kasun@gmail.com",
      phone: "+94798765432",
      waiterName: "Kasun",
      customerName: "Amaya Detuni",
      orderDate: "2026-03-11",
      status: "completed",
      items: [
        { name: "Pasta", quantity: 1, price: "Rs. 600" },
        { name: "Water", quantity: 1, price: "Rs. 100" },
      ],
    },
  ]);

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  const filterOrders = (orders: IOrder[], filters: any) =>
    orders.filter(o => {
      const { orderId, tableNo, waiterName, customerName, orderDateFrom, orderDateTo } = filters;
      const orderDate = new Date(o.orderDate);
      const fromDate = orderDateFrom ? new Date(orderDateFrom) : null;
      const toDate = orderDateTo ? new Date(orderDateTo) : null;
      return (
        (!orderId || o.orderId.includes(orderId)) &&
        (!tableNo || o.tableNo.includes(tableNo)) &&
        (!waiterName || o.waiterName.toLowerCase().includes(waiterName.toLowerCase())) &&
        (!customerName || o.customerName.toLowerCase().includes(customerName.toLowerCase())) &&
        (!fromDate || orderDate >= fromDate) &&
        (!toDate || orderDate <= toDate)
      );
    });

  return (
    <Container fluid className="relative">
      {isDrawerOpen && <div className="fixed inset-0 bg-black opacity-30 z-40"></div>}
      
<Row className="align-items-center mb-4">
  <Col>
    <h1 className="kbo-title">
      Order Management and History
    </h1>
  </Col>

  <Col xs="auto">
    <YellowButton>Add Order</YellowButton>
  </Col>
</Row>

      <TabView className="custom-tabs-order-mgt mb-4">
        {/* Ongoing Orders Tab */}
        <TabPanel header="Ongoing Orders">
          <Formik
            initialValues={ongoingFilters}
            enableReinitialize
            onSubmit={(values) => setOngoingFilters(values)}
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={2}>
                    <LabelGroup label="Order ID" name="orderId" type="text" placeholder="Order ID" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Table No" name="tableNo" type="text" placeholder="Table No" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Waiter Name" name="waiterName" type="text" placeholder="Waiter Name" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Customer Name" name="customerName" type="text" placeholder="Customer Name" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Order Date From" name="orderDateFrom" type="date" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Order Date To" name="orderDateTo" type="date" />
                  </Col>
                  <Col md={2} className="d-flex gap-2 mt-2">
                    <YellowButton type="submit">Filter</YellowButton>
                    <WhiteButton
                      type="button"
                      onClick={() => {
                        resetForm({ values: initialFilters });
                        setOngoingFilters(initialFilters);
                      }}
                    >
                      Clear
                    </WhiteButton>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          <DataTable
            stripedRows
            value={filterOrders(orders.filter(o => o.status === "ongoing"), ongoingFilters)}
            paginator
            rows={10}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order ID" />
            <Column field="tableNo" header="Table" />
            <Column field="email" header="Email" />
            <Column field="phone" header="Phone" />
            <Column field="waiterName" header="Waiter Name" />
            <Column field="customerName" header="Customer Name" />
            <Column field="orderDate" header="Order Date" />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleViewOrder(rowData)}>View Order</YellowButton>
                  <WhiteButton>Cancel</WhiteButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        {/* Completed Orders Tab */}
        <TabPanel header="Completed Orders">
          <Formik
            initialValues={completedFilters}
            enableReinitialize
            onSubmit={(values) => setCompletedFilters(values)}
          >
            {({ resetForm }) => (
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={2}>
                    <LabelGroup label="Order ID" name="orderId" type="text" placeholder="Order ID" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Table No" name="tableNo" type="text" placeholder="Table No" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Waiter Name" name="waiterName" type="text" placeholder="Waiter Name" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Customer Name" name="customerName" type="text" placeholder="Customer Name" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Order Date From" name="orderDateFrom" type="date" />
                  </Col>
                  <Col md={2}>
                    <LabelGroup label="Order Date To" name="orderDateTo" type="date" />
                  </Col>
                  <Col md={2} className="d-flex gap-2 mt-2">
                    <YellowButton type="submit">Filter</YellowButton>
                    <WhiteButton
                      type="button"
                      onClick={() => {
                        resetForm({ values: initialFilters });
                        setCompletedFilters(initialFilters);
                      }}
                    >
                      Clear
                    </WhiteButton>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>

          <DataTable
            stripedRows
            value={filterOrders(orders.filter(o => o.status === "completed"), completedFilters)}
            paginator
            rows={10}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order ID" />
            <Column field="tableNo" header="Table" />
            <Column field="email" header="Email" />
            <Column field="phone" header="Phone" />
            <Column field="waiterName" header="Waiter Name" />
            <Column field="customerName" header="Customer Name" />
            <Column field="orderDate" header="Order Date" />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleViewOrder(rowData)}>View Order</YellowButton>
                  <WhiteButton>Cancel</WhiteButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        {/* Unassigned Customers Tab - No Filters */}
        <TabPanel header="Unassigned Customers">
          <DataTable
            stripedRows
            value={orders.filter(o => o.status === "unassigned")}
            paginator
            rows={10}
            responsiveLayout="scroll"
          >
            <Column field="orderId" header="Order ID" />
            <Column field="tableNo" header="Table" />
            <Column field="email" header="Email" />
            <Column field="phone" header="Phone" />
            <Column field="waiterName" header="Waiter Name" />
            <Column field="customerName" header="Customer Name" />
            <Column field="orderDate" header="Order Date" />
            <Column
              header="Actions"
              body={(rowData: IOrder) => (
                <div className="flex gap-2">
                  <YellowButton onClick={() => handleViewOrder(rowData)}>View Order</YellowButton>
                  <WhiteButton>Cancel</WhiteButton>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>
      </TabView>

      {isDrawerOpen && selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={handleCloseDrawer} />
      )}
    </Container>
  );
}