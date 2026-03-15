"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import OrderDrawer from "@/components/OrderDrawer";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

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
  const [filters, setFilters] = useState({
    orderId: "",
    tableNo: "",
    waiterName: "",
    customerName: "",
    orderDateFrom: "",
    orderDateTo: "",
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  const initialFilters = filters;

  // MOCK DATA
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

  const handleSubmit = (values: any) => setFilters(values);

  const filterOrders = (status: "ongoing" | "completed") =>
    orders.filter((o) => {
      if (o.status !== status) return false;
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
      {/* Dim background when drawer is open */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black opacity-30 z-40"></div>}

      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h1-custom text-[#F4A62A] font-semibold">
            Order Management and History
          </h1>
        </Col>
      </Row>

      <TabView className="custom-tabs mb-4">
        {/* ONGOING ORDERS */}
        <TabPanel header="Ongoing Orders">
          <Formik initialValues={filters} enableReinitialize onSubmit={handleSubmit}>
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
                    <Button
                      id="filterOngoingBtn"
                      text="Filter"
                      type="submit"
                      className="bg-[#F4A62A] text-white flex-1 py-2 rounded-none hover:bg-[#e2951f] shadow-md"
                      state={true}
                    />
                    <Button
                      id="clearOngoingBtn"
                      text="Clear"
                      type="button"
                      className="bg-white border border-[#F4A62A] text-[#F4A62A] flex-1 py-2 rounded-none hover:bg-[#FFF3E0]"
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

          <DataTable stripedRows value={filterOrders("ongoing")} paginator rows={10} responsiveLayout="scroll">
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
                  <button
                    className="bg-[#F4A62A] text-white py-1 px-3 rounded hover:bg-[#e2951f]"
                    onClick={() => handleViewOrder(rowData)}
                  >
                    View Order
                  </button>
                  <button className="border border-[#F4A62A] text-[#F4A62A] py-1 px-3 rounded hover:bg-[#FFF3E0]">
                    Cancel
                  </button>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>

        {/* COMPLETED ORDERS */}
        <TabPanel header="Completed Orders">
          <Formik initialValues={filters} enableReinitialize onSubmit={handleSubmit}>
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
                    <Button
                      id="filterCompletedBtn"
                      text="Filter"
                      type="submit"
                      className="bg-[#F4A62A] text-white flex-1 py-2 rounded-none hover:bg-[#e2951f] shadow-md"
                      state={true}
                    />
                    <Button
                      id="clearCompletedBtn"
                      text="Clear"
                      type="button"
                      className="bg-white border border-[#F4A62A] text-[#F4A62A] flex-1 py-2 rounded-none hover:bg-[#FFF3E0]"
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

          <DataTable stripedRows value={filterOrders("completed")} paginator rows={10} responsiveLayout="scroll">
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
                  <button
                    className="bg-[#F4A62A] text-white py-1 px-3 rounded hover:bg-[#e2951f]"
                    onClick={() => handleViewOrder(rowData)}
                  >
                    View Order
                  </button>
                </div>
              )}
            />
          </DataTable>
        </TabPanel>
      </TabView>

      {/* SIDE DRAWER */}
      {isDrawerOpen && selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={handleCloseDrawer} />
      )}
    </Container>
  );
}