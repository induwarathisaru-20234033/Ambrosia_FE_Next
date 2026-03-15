"use client";

import React from "react";
import { IOrder } from "@/data-types"; // <-- import from your types file

interface OrderDrawerProps {
  order: IOrder;
  onClose: () => void;
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({ order, onClose }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[45%] bg-white shadow-xl z-50 overflow-auto transition-transform duration-300">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-yellow-500 font-semibold text-lg">More Information</h2>
          <button className="text-black font-bold text-xl" onClick={onClose}>
            X
          </button>
        </div>

        <hr className="border-gray-300 mb-4" />

        <div className="mb-4">
          <p className="text-gray-500 inline-block">Table: </p>
          <span className="font-bold text-black">{order.tableNo}</span>
          <br />
          <p className="text-gray-500 inline-block">Waiter: </p>
          <span className="font-bold text-black">{order.waiterName}</span>
        </div>

        <h3 className="text-gray-500 font-medium mb-2">Order Items:</h3>
        <div className="flex flex-wrap gap-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="border p-2 rounded w-[45%] bg-[#FFF3E0]">
              <p className="font-bold">{item.name}</p>
              <p>Qty: {item.quantity}</p>
              <p>Price: {item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDrawer;