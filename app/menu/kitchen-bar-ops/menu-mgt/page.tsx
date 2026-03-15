"use client";

import { useState, useEffect } from "react";

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
    const target = e.target;
    const name = target.name;
    let value: string | number | boolean;

    if (target instanceof HTMLInputElement) {
      if (target.type === "checkbox") {
        value = target.checked;
      } else if (target.type === "number") {
        value = parseFloat(target.value); // decimals
      } else {
        value = target.value;
      }
    } else {
      value = target.value;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Submit new menu item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://localhost:44376/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to add menu item");
      }

      setForm({ name: "", price: 0, category: "", isAvailable: true });
      fetchMenuItems(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Error adding menu item");
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 max-w-sm">
        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="name">Menu Item Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="price">Price:</label>
          <input
            id="price"
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="category">Category:</label>
          <input
            id="category"
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>

        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
          />
          Available
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded font-bold mt-2"
        >
          {loading ? "Adding..." : "Add Menu Item"}
        </button>
      </form>

      {/* Search bar */}
      <div className="mb-4 max-w-sm">
        <input
          type="text"
          placeholder="Search by item name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Menu Items List by Category */}
      <h2 className="text-xl font-semibold mb-2">Existing Menu Items</h2>
      {Object.entries(
        filteredMenuItems.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, MenuItem[]>)
      ).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="font-bold text-lg mb-2">{category}</h3>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div>
                  <strong>{item.name}</strong> - ${item.price.toFixed(2)}
                </div>
                <div>{item.isAvailable ? "✅ Available" : "❌ Unavailable"}</div>
                {/* Future update button */}
                <button className="bg-blue-400 hover:bg-blue-500 text-white px-2 py-1 rounded ml-2">
                  Update
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}