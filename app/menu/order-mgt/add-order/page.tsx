"use client";

import { useState } from "react";
import Image from "next/image";

export default function AddOrderPage() {

  const [orderItems, setOrderItems] = useState<any[]>([]);

//   Mock Data
  const menuItems = [
  { id: 1, name: "Burger", image: "/burger.png", isAvailable: true },
  { id: 2, name: "Pizza", image: "/pizza.png", isAvailable: true },
  { id: 3, name: "Coke", image: "/coke.png", isAvailable: true },
    ];

    const fireOrder = () => {
  if (orderItems.length === 0) {
    alert("Please select a table and add at least one item.");
    return;
  }

  alert("Order sent to kitchen successfully.");
};

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          width: "60%",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Menu</h2>

        <div style={{ marginBottom: "10px" }}>
            <button>Food</button>
            <button>Drinks</button>
        </div>

        <input
            type="text"
            placeholder="Search menu item..."
            style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
        />

        {/* Menu Grid */}
        <div
          style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          }}
        >
        
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setOrderItems([...orderItems, item])}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {/* <img src={item.image} width="100%" /> */}
            <Image src={item.image} width={120} height={120} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}

      </div>
</div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "40%",
          padding: "20px",
        }}
      >
        <h2>Order Panel</h2>

        <select style={{ width: "100%", marginBottom: "20px" }}>
          <option>Select Table</option>
          <option>Table 1</option>
          <option>Table 2</option>
          <option>Table 3</option>
        </select>

        {orderItems.map((item, index) => (
        <div
            key={index}
            style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            }}
        >
            <p>{item.name}</p>

            <textarea
              placeholder="Special instructions..."
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <button onClick={() => setOrderItems([...orderItems, item])}>
              Duplicate
            </button>
            <button onClick={() =>
                setOrderItems(orderItems.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
        </div>
        ))}

        {/* Order Action buttons */}
        <div style={{ marginTop: "20px" }}>
          <button style={{ marginRight: "10px" }}> Draft </button>
          <button style={{ marginRight: "10px" }}> Remove </button>
          <button onClick={fireOrder}> Fire </button>
        </div>
      
      </div>
    </div>
  );
}