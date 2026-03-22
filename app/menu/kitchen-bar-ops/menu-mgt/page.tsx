"use client";

import { useMemo, useState } from "react";
import { useToastRef } from "@/contexts/ToastContext";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";
import { usePutQuery } from "@/services/queries/putQuery";
import { Container, Row, Col } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import "primeicons/primeicons.css";

import { YellowButton } from "../layout";
import "../styles/kitchen-bar-ops.css";
import OrderMgtBackButton from "@/components/OrderMgtBackButton";
import { IBaseApiResponse } from "@/data-types";

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

  const [form, setForm] = useState<MenuForm>({
    name: "",
    price: 0,
    category: "",
    isAvailable: true,
  });

  const [search, setSearch] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  const {
    data: menuItemsResponse,
    isLoading: isMenuLoading,
    isError: isMenuError,
    refetch: refetchMenuItems,
  } = useGetQuery<IBaseApiResponse<MenuItem[]> | MenuItem[], undefined>(
    ["menuItems"],
    "/menu"
  );

  const menuItems: MenuItem[] = Array.isArray(menuItemsResponse)
    ? menuItemsResponse
    : menuItemsResponse?.data ?? [];

  const addMenuMutation = usePostQuery({
    toastRef,
    successMessage: "Menu item added successfully!",
  });

  const updateMenuMutation = usePutQuery({
    toastRef,
    successMessage: "Item updated successfully!",
  });

  const handleAddFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

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

    if (!form.name.trim() || !form.category.trim() || form.price <= 0) {
      toastRef?.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please fill all fields correctly",
        life: 3000,
      });
      return;
    }

    try {
      await addMenuMutation.mutateAsync({
        url: "/menu",
        body: {
          ...form,
          name: form.name.trim(),
          category: form.category.trim(),
        },
      });

      setForm({
        name: "",
        price: 0,
        category: "",
        isAvailable: true,
      });

      refetchMenuItems();
    } catch (error) {
      console.error("Error adding menu item:", error);
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

    if (updateForm.price <= 0) {
      toastRef?.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Price must be greater than 0",
        life: 3000,
      });
      return;
    }

    try {
      await updateMenuMutation.mutateAsync({
        url: `/menu/${updateForm.id}`,
        body: {
          price: updateForm.price,
          isAvailable: updateForm.isAvailable,
        },
      });

      closeUpdateModal();
      refetchMenuItems();
    } catch (error) {
      console.error("Error updating menu item:", error);
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
      stripedRows
      removableSort
      value={items}
      paginator
      rows={10}
      loading={isMenuLoading}
      className="p-datatable-gridlines custom-tabs-order-mgt"
      responsiveLayout="scroll"
      emptyMessage={isMenuError ? "Failed to load menu items." : "No menu items found."}
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
    updateMenuMutation.isPending ||
    (updateForm.price === originalUpdateForm.price &&
      updateForm.isAvailable === originalUpdateForm.isAvailable);

  return (
    <Container fluid className="relative">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="kbo-title">Menu Management</h1>
        </Col>

        <Col xs="auto" className="d-flex align-items-center gap-2">
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
              className="border border-gray-300 p-2 rounded w-48 outline-none"
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
              min="0"
              name="price"
              value={form.price}
              onChange={handleAddFormChange}
              required
              className="border border-gray-300 p-2 rounded w-32 outline-none"
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
              className="border border-gray-300 p-2 rounded w-48 outline-none"
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
            {addMenuMutation.isPending ? "Adding..." : "Add"}
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
              className="border border-gray-300 p-2 rounded w-full outline-none"
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
              className="border border-gray-300 p-2 rounded w-full outline-none"
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
              className="border border-gray-300 p-2 rounded w-full outline-none"
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
                  className="border border-gray-300 p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={updateForm.price}
                  onChange={handleUpdateFormChange}
                  className="border border-gray-300 p-2 rounded w-full outline-none"
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
                  {updateMenuMutation.isPending ? "Updating..." : "Update"}
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