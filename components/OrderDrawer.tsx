"use client";

import React from "react";
import { IOrder } from "@/data-types";

interface OrderDrawerProps {
  order: IOrder;
  onClose: () => void;
}

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

const OrderDrawer: React.FC<OrderDrawerProps> = ({ order, onClose }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[45%] bg-white shadow-xl z-50 overflow-y-auto transition-transform duration-300">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[#E0A11B] font-semibold text-2xl">
            More Information
          </h2>
          <button
            className="text-black font-normal text-2xl leading-none"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <hr className="border-gray-300 mb-6" />

        {/* Top Information Section */}
        <div className="mb-6 grid grid-cols-2 gap-8 text-xl">
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Table: </span>
              <span className="font-semibold text-black">{order.tableNo}</span>
            </div>

            <div>
              <span className="text-gray-500">Waiter: </span>
              <span className="font-semibold text-black">{order.waiterName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Customer: </span>
              <span className="font-semibold text-black">{order.customerName}</span>
            </div>

            <div>
              <span className="text-gray-500">Email: </span>
              <span className="font-semibold text-black">{order.email}</span>
            </div>

            <div>
              <span className="text-gray-500">Phone: </span>
              <span className="font-semibold text-black">{order.phone}</span>
            </div>
          </div>
        </div>

        <h3 className="text-gray-600 font-medium text-2xl mb-4">
          Order Items:
        </h3>

        <div className="flex flex-col gap-5">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-400 rounded-md bg-white shadow-md p-4"
            >
              <p className="font-bold text-2xl text-black mb-3">{item.name}</p>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Order Details</p>
                <div className="bg-gray-200 rounded-md p-3 min-h-[70px] text-sm text-gray-700">
                  <p>Qty: {item.quantity}</p>
                  <p>Price: {item.price}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Order Status</p>
                <div className="bg-gray-200 rounded-md p-2 text-sm text-gray-700 min-h-[36px] flex items-center">
                  {getOrderStatusLabel(order.orderStatus)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDrawer;