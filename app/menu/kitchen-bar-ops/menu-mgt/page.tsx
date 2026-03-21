"use client";

import { useEffect, useMemo, useState } from "react";
import { useToastRef } from "@/contexts/ToastContext";
import { Container, Row, Col } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { YellowButton } from "../layout";
import "../styles/kitchen-bar-ops.css";
import OrderMgtBackButton from "@/components/OrderMgtBackButton";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface MenuForm {
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface UpdateMenuForm {
  id: number | null;
  name: string;
  price: number;
  isAvailable: boolean;
}

export default function MenuPage() {
  const toastRef = useToastRef();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<MenuForm>({
    name: "",
    price: 0,
    category: "",
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [updateForm, setUpdateForm] = useState<UpdateMenuForm>({
    id: null,
    name: "",
    price: 0,
    isAvailable: true,
  });

  const [originalUpdateForm, setOriginalUpdateForm] = useState<UpdateMenuForm>({
    id: null,
    name: "",
    price: 0,
    isAvailable: true,
  });

  const fetchMenuItems = async (showErrorToast = false) => {
    try {
      const res = await fetch("https://localhost:44376/api/menu");
      if (!res.ok) throw new Error("Failed to fetch menu items");

      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Error fetching menu items:", err);

      if (showErrorToast) {
        toastRef?.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load menu items",
          life: 3000,
        });
      }
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;

    let val: string | number | boolean = value;
    if (type === "checkbox") val = checked;
    if (type === "number") val = value === "" ? 0 : parseFloat(value);

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;

    let val: string | number | boolean = value;
    if (type === "checkbox") val = checked;
    if (type === "number") val = value === "" ? 0 : parseFloat(value);

    setUpdateForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://localhost:44376/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add menu item");

      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Menu item added successfully!",
        life: 3000,
      });

      setForm({
        name: "",
        price: 0,
        category: "",
        isAvailable: true,
      });

      fetchMenuItems();
    } catch (err) {
      console.error("Error adding menu item:", err);

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error adding menu item",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (row: MenuItem) => {
    const selectedItem: UpdateMenuForm = {
      id: row.id,
      name: row.name,
      price: row.price,
      isAvailable: row.isAvailable,
    };

    setUpdateForm(selectedItem);
    setOriginalUpdateForm(selectedItem);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateForm({
      id: null,
      name: "",
      price: 0,
      isAvailable: true,
    });
    setOriginalUpdateForm({
      id: null,
      name: "",
      price: 0,
      isAvailable: true,
    });
  };

  const handleUpdateSubmit = async () => {
    if (updateForm.id === null) return;

    const isUnchanged =
      updateForm.price === originalUpdateForm.price &&
      updateForm.isAvailable === originalUpdateForm.isAvailable;

    if (isUnchanged) {
      toastRef?.current?.show({
        severity: "warn",
        summary: "No Changes",
        detail: "No changes detected to update",
        life: 3000,
      });
      return;
    }

    setUpdateLoading(true);

    try {
      const res = await fetch(
        `https://localhost:44376/api/menu/${updateForm.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: updateForm.price,
            isAvailable: updateForm.isAvailable,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update menu item");

      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Item updated successfully!",
        life: 3000,
      });

      closeUpdateModal();
      fetchMenuItems();
    } catch (err) {
      console.error("Error updating menu item:", err);

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error updating menu item",
        life: 3000,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const baseFilteredMenuItems = useMemo(() => {
    return [...menuItems]
      .filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
  }, [menuItems, search]);

  const allItems = baseFilteredMenuItems;
  const availableItems = baseFilteredMenuItems.filter((item) => item.isAvailable);
  const unavailableItems = baseFilteredMenuItems.filter(
    (item) => !item.isAvailable
  );

  const availabilityBodyTemplate = (row: MenuItem) =>
    row.isAvailable ? "Available" : "Unavailable";

  const actionBodyTemplate = (row: MenuItem) => (
    <div className="flex justify-center">
      <YellowButton onClick={() => openUpdateModal(row)}>Update</YellowButton>
    </div>
  );

  const renderTable = (items: MenuItem[]) => (
    <DataTable
      value={items}
      paginator
      rows={10}
      className="p-datatable-gridlines"
      responsiveLayout="scroll"
      emptyMessage="No menu items found."
    >
      <Column field="category" header="Category" sortable />
      <Column field="name" header="Name" sortable />
      <Column
        field="price"
        header="Price (Rs)"
        body={(row: MenuItem) => `Rs. ${row.price.toFixed(2)}`}
        sortable
      />
      <Column
        field="isAvailable"
        header="Availability"
        body={availabilityBodyTemplate}
        sortable
      />
      <Column
        header=""
        body={actionBodyTemplate}
        headerStyle={{ textAlign: "center" }}
        bodyStyle={{ textAlign: "center" }}
      />
    </DataTable>
  );

  const isUpdateDisabled =
    updateLoading ||
    updateForm.price === originalUpdateForm.price &&
      updateForm.isAvailable === originalUpdateForm.isAvailable;

  return (
    <Container fluid className="relative">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="kbo-title">Menu Management</h1>
        </Col>

        <Col xs="auto">
          <OrderMgtBackButton />
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <form
          onSubmit={handleAddSubmit}
          className="flex flex-wrap gap-3 items-end max-w-full"
        >
          <div className="flex flex-col">
            <label className="font-semibold mb-1" htmlFor="name">
              Menu Item Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleAddFormChange}
              required
              className="border p-2 rounded w-48"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1" htmlFor="price">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleAddFormChange}
              required
              className="border p-2 rounded w-32"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              type="text"
              name="category"
              value={form.category}
              onChange={handleAddFormChange}
              required
              className="border p-2 rounded w-48"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              id="isAvailable"
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleAddFormChange}
            />
            <label htmlFor="isAvailable" className="font-semibold">
              Available
            </label>
          </div>

          <YellowButton type="submit">
            {loading ? "Adding..." : "Add"}
          </YellowButton>
        </form>
      </div>

      <TabView
        className="custom-tabs-order-mgt mb-4"
        activeIndex={activeTabIndex}
        onTabChange={(e) => setActiveTabIndex(e.index)}
      >
        <TabPanel header="All Items">
          <div className="mb-4 max-w-sm">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {renderTable(allItems)}
        </TabPanel>

        <TabPanel header="Available">
          <div className="mb-4 max-w-sm">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {renderTable(availableItems)}
        </TabPanel>

        <TabPanel header="Unavailable">
          <div className="mb-4 max-w-sm">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {renderTable(unavailableItems)}
        </TabPanel>
      </TabView>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white w-[560px] max-w-[90%] rounded shadow-xl overflow-hidden">
            <div className="bg-[#F0A84B] px-6 py-4 flex justify-between items-center relative">
              <div className="w-full text-center">
                <h2 className="text-white text-2xl font-semibold">
                  Update Menu Item
                </h2>
              </div>
              <button
                type="button"
                className="text-white text-xl leading-none absolute right-6 top-1/2 -translate-y-1/2"
                onClick={closeUpdateModal}
              >
                <i className="pi pi-times"></i>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block font-semibold mb-2">Item Name</label>
                <input
                  type="text"
                  value={updateForm.name}
                  disabled
                  className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={updateForm.price}
                  onChange={handleUpdateFormChange}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input
                  id="updateIsAvailable"
                  type="checkbox"
                  name="isAvailable"
                  checked={updateForm.isAvailable}
                  onChange={handleUpdateFormChange}
                />
                <label htmlFor="updateIsAvailable" className="font-semibold">
                  Available
                </label>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="bg-[#F0A84B] text-white px-10 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUpdateSubmit}
                  disabled={isUpdateDisabled}
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>

                <button
                  type="button"
                  className="border border-[#F0A84B] text-[#6B7280] px-10 py-2 rounded-md font-medium bg-white hover:bg-gray-50"
                  onClick={closeUpdateModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}