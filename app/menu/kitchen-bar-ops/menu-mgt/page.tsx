"use client";

import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";  
import "primereact/resources/primereact.min.css";          
import "primeicons/primeicons.css";                        

import KitchenBarOpsLayout, {
  YellowButton,
  WhiteButton,
  Tabs,
} from "../layout"; // adjust path if needed

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

  // Fetch menu items from backend
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

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    let val: string | number | boolean = value;
    if (type === "checkbox") val = checked;
    if (type === "number") val = parseFloat(value);

    setForm({ ...form, [name]: val });
  };

  // Submit new menu item
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

  // Filtered & sorted menu items
  const filteredMenuItems = menuItems
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

  // Column templates
  const availabilityBodyTemplate = (row: MenuItem) =>
    row.isAvailable ? "✅ Available" : "❌ Unavailable";

  const actionBodyTemplate = (row: MenuItem) => (
    <div className="flex gap-2">
      <YellowButton onClick={() => alert(`Update ${row.name}`)}>Update</YellowButton>
      <WhiteButton onClick={() => alert(`Cancel ${row.name}`)}>Cancel</WhiteButton>
    </div>
  );

  return (
    <KitchenBarOpsLayout title="Menu Management">
      {/* Tabs Example */}
      <Tabs
        tabs={["All Items", "Available", "Unavailable"]}
        activeIndex={activeTab}
        onTabClick={setActiveTab}
      />

      {/* Add Menu Item Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap gap-3 items-end max-w-full"
      >
        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 rounded w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="border p-2 rounded w-28"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="border p-2 rounded w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
          />
          <span>Available</span>
        </div>

        <YellowButton type="submit">{loading ? "Adding..." : "Add"}</YellowButton>
      </form>

      {/* Search Bar */}
      <div className="mb-4 max-w-sm">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* DataTable */}
      <DataTable
        value={filteredMenuItems}
        paginator
        rows={10}
        className="p-datatable-gridlines"
        responsiveLayout="scroll"
      >
        <Column field="category" header="Category" sortable></Column>
        <Column field="name" header="Name" sortable></Column>
        <Column
          field="price"
          header="Price (Rs)"
          body={(row) => `Rs. ${row.price.toFixed(2)}`}
          sortable
        ></Column>
        <Column
          field="isAvailable"
          header="Availability"
          body={availabilityBodyTemplate}
        ></Column>
        <Column header="Action" body={actionBodyTemplate}></Column>
      </DataTable>
    </KitchenBarOpsLayout>
  );
}