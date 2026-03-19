"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { YellowButton, WhiteButton } from "../layout";
import "../styles/kitchen-bar-ops.css";

interface MenuItem {
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuItem>({
    name: "",
    price: 0,
    category: "",
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("https://localhost:44376/api/menu");
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    let val: string | number | boolean = value;

    if (type === "checkbox") val = checked;
    if (type === "number") val = parseFloat(value);

    setForm({ ...form, [name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://localhost:44376/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add menu item");

      setForm({ name: "", price: 0, category: "", isAvailable: true });
      fetchMenuItems();
    } catch (err) {
      console.error(err);
      alert("Error adding menu item");
    } finally {
      setLoading(false);
    }
  };

  const searchedMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMenuItems = searchedMenuItems
    .filter((item) => {
      if (activeTab === 1) return item.isAvailable;
      if (activeTab === 2) return !item.isAvailable;
      return true;
    })
    .sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

  const availabilityBodyTemplate = (row: MenuItem) =>
    row.isAvailable ? "✅ Available" : "❌ Unavailable";

  const actionBodyTemplate = (row: MenuItem) => (
    <div className="flex gap-2">
      <YellowButton onClick={() => alert(`Update ${row.name}`)}>
        Update
      </YellowButton>
      <WhiteButton onClick={() => alert(`Cancel ${row.name}`)}>
        Cancel
      </WhiteButton>
    </div>
  );

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="kbo-title">Menu Management</h1>
        </Col>
      </Row>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
        className="custom-tabs-order-mgt mb-4"
      >
        <TabPanel header="All Items">
          <form onSubmit={handleSubmit}>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="name">
                  Menu Item Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block">Availability</label>
                <div className="flex items-center gap-2 h-[42px]">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                  />
                  <span>Available</span>
                </div>
              </Col>

              <Col md={2} className="d-flex gap-2">
                <YellowButton type="submit">
                  {loading ? "Adding..." : "Add"}
                </YellowButton>
              </Col>
            </Row>
          </form>

          <Row className="mb-4">
            <Col md={4}>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </Col>
          </Row>

          <DataTable
            value={filteredMenuItems}
            paginator
            rows={10}
            stripedRows
            responsiveLayout="scroll"
          >
            <Column field="category" header="Category" sortable />
            <Column field="name" header="Name" sortable />
            <Column
              field="price"
              header="Price (Rs)"
              body={(row) => `Rs. ${row.price.toFixed(2)}`}
              sortable
            />
            <Column
              field="isAvailable"
              header="Availability"
              body={availabilityBodyTemplate}
            />
            <Column header="Action" body={actionBodyTemplate} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Available">
          <form onSubmit={handleSubmit}>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="name">
                  Menu Item Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block">Availability</label>
                <div className="flex items-center gap-2 h-[42px]">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                  />
                  <span>Available</span>
                </div>
              </Col>

              <Col md={2} className="d-flex gap-2">
                <YellowButton type="submit">
                  {loading ? "Adding..." : "Add"}
                </YellowButton>
              </Col>
            </Row>
          </form>

          <Row className="mb-4">
            <Col md={4}>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </Col>
          </Row>

          <DataTable
            value={filteredMenuItems}
            paginator
            rows={10}
            stripedRows
            responsiveLayout="scroll"
          >
            <Column field="category" header="Category" sortable />
            <Column field="name" header="Name" sortable />
            <Column
              field="price"
              header="Price (Rs)"
              body={(row) => `Rs. ${row.price.toFixed(2)}`}
              sortable
            />
            <Column
              field="isAvailable"
              header="Availability"
              body={availabilityBodyTemplate}
            />
            <Column header="Action" body={actionBodyTemplate} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Unavailable">
          <form onSubmit={handleSubmit}>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="name">
                  Menu Item Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={3}>
                <label className="font-semibold mb-1 block" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded w-full"
                />
              </Col>

              <Col md={2}>
                <label className="font-semibold mb-1 block">Availability</label>
                <div className="flex items-center gap-2 h-[42px]">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                  />
                  <span>Available</span>
                </div>
              </Col>

              <Col md={2} className="d-flex gap-2">
                <YellowButton type="submit">
                  {loading ? "Adding..." : "Add"}
                </YellowButton>
              </Col>
            </Row>
          </form>

          <Row className="mb-4">
            <Col md={4}>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </Col>
          </Row>

          <DataTable
            value={filteredMenuItems}
            paginator
            rows={10}
            stripedRows
            responsiveLayout="scroll"
          >
            <Column field="category" header="Category" sortable />
            <Column field="name" header="Name" sortable />
            <Column
              field="price"
              header="Price (Rs)"
              body={(row) => `Rs. ${row.price.toFixed(2)}`}
              sortable
            />
            <Column
              field="isAvailable"
              header="Availability"
              body={availabilityBodyTemplate}
            />
            <Column header="Action" body={actionBodyTemplate} />
          </DataTable>
        </TabPanel>
      </TabView>
    </Container>
  );
}