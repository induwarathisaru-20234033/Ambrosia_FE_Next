"use client";

import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import dynamic from "next/dynamic";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import "primeicons/primeicons.css";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

type MenuItem = {
  id: number;
  name: string;
  price: number; // Added price
};

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  specialInstructions: string;
  price: number; // Added price for order items
}

interface InitialValues {
  table: string;
  orderItems: OrderItem[];
}

const menuItems: MenuItem[] = [
  { id: 1, name: "Burger", price: 500 },
  { id: 2, name: "Pizza", price: 1200 },
  { id: 3, name: "Coke", price: 300 },
];

const orderSchema = Yup.object().shape({
  table: Yup.string().required("Table is required"),
  orderItems: Yup.array().min(1, "Add at least one menu item"),
});

export default function AddOrderPage() {
  const toastRef = useToastRef();

  const mutation = usePostQuery({
    redirectPath: "/menu/order-mgt",
    successMessage: "Order sent to kitchen successfully!",
    toastRef,
  });

  return (
    <Formik<InitialValues>
      initialValues={{ table: "", orderItems: [] }}
      validationSchema={orderSchema}
      onSubmit={(values) => mutation.mutate({ url: "/orders", body: values })}
    >
      {(formik) => {
        const addItemToForm = (item: MenuItem) => {
          const items = [...formik.values.orderItems];
          const index = items.findIndex((i) => i.id === item.id);

          if (index !== -1) items[index].quantity += 1;
          else
            items.push({
              id: item.id,
              name: item.name,
              quantity: 1,
              specialInstructions: "",
              price: item.price,
            });

          formik.setFieldValue("orderItems", items);
        };

        const removeItemFromForm = (id: number) => {
          formik.setFieldValue(
            "orderItems",
            formik.values.orderItems.filter((i) => i.id !== id)
          );
        };

        const updateInstructions = (id: number, value: string) => {
          formik.setFieldValue(
            "orderItems",
            formik.values.orderItems.map((i) =>
              i.id === id ? { ...i, specialInstructions: value } : i
            )
          );
        };

        const changeQuantity = (id: number, delta: number) => {
          const updatedItems = formik.values.orderItems.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + delta } : i
          );

          const targetItem = updatedItems.find(i => i.id === id);
          if (targetItem && targetItem.quantity <= 0) {
            const confirmRemove = confirm(
              `Quantity of "${targetItem.name}" is 0. Do you want to remove this item?`
            );

            if (confirmRemove) {
              formik.setFieldValue(
                "orderItems",
                updatedItems.filter(i => i.id !== id)
              );
            } else {
              formik.setFieldValue(
                "orderItems",
                updatedItems.map(i =>
                  i.id === id ? { ...i, quantity: 1 } : i
                )
              );
            }
          } else {
            formik.setFieldValue("orderItems", updatedItems);
          }
        };

        return (
          <Form className="h-screen flex flex-col">

            {/* PAGE TITLE */}
            <h1 className="text-left text-3xl font-bold text-[#FFD166] py-4">
              Add Order
            </h1>

            <div className="flex flex-1 overflow-hidden">

              {/* MENU PANEL - GALLERY VIEW */}
              <div className="w-[55%] p-6 overflow-y-auto">
                {/* <h2 className="font-semibold mb-3 text-lg">Menu</h2> */}

                {/* SEARCH BAR */}
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search menu item..."
                    className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                  />
                  <button
                    type="button"
                    className="bg-[#FFD166] px-4 rounded flex items-center justify-center"
                  >
                    <i className="pi pi-search text-white"></i>
                  </button>
                </div>

                {/* MENU ITEMS - GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border p-4 rounded-lg flex flex-col items-center justify-between shadow hover:shadow-lg transition"
                    >
                      <p className="font-semibold text-center mb-2">{item.name}</p>
                      <p className="text-gray-700 mb-3">Rs. {item.price}</p>
                      <Button
                        text="+"
                        className="bg-[#FFD166] text-white px-4 py-2 rounded"
                        onClick={() => addItemToForm(item)}
                        state={true}
                        id={`add-item-${item.id}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* VERTICAL DIVIDER */}
              <div className="w-px bg-gray-300"></div>

              {/* ORDER PANEL */}
              <div className="w-[45%] flex flex-col p-6">
                {/* <h2 className="font-semibold text-lg mb-3">Order Panel</h2> */}

                {/* ORDER HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-[#FFD166] font-semibold text-lg">Order ID:</span>
                    <span className="ml-2 text-gray-700">123</span>
                  </div>  

                  <div className="flex items-center gap-2">
                    <span className="text-[#FFD166] font-semibold text-lg">Table:</span>
                    <select
                      name="table"
                      value={formik.values.table}
                      onChange={formik.handleChange}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      <option value="Table 1">Table 1</option>
                      <option value="Table 2">Table 2</option>
                      <option value="Table 3">Table 3</option>
                    </select>
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="border-b border-gray-300 mb-4"></div>

                {/* ORDER ITEMS */}
                <div className="flex-1 overflow-y-auto pr-2">
                  {formik.values.orderItems.length === 0 && (
                    <p className="text-gray-500">No items added</p>
                  )}

                  {formik.values.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-black shadow-sm p-3 mb-3 rounded-md flex flex-col gap-2"
                    >
                      <p className="font-bold text-lg">{item.name}</p>

                      {/* QUANTITY + PRICE HORIZONTAL */}
                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            text="-"
                            className="bg-white border border-gray-400 text-gray-700 py-1 px-3 rounded"
                            state={true}
                            id={`decrease-quantity-${item.id}`}
                            onClick={() => changeQuantity(item.id, -1)}
                          />
                          <span className="px-2">{item.quantity}</span>
                          <Button
                            text="+"
                            className="bg-white border border-gray-400 text-gray-700 py-1 px-3 rounded"
                            state={true}
                            id={`increase-quantity-${item.id}`}
                            onClick={() => changeQuantity(item.id, 1)}
                          />
                        </div>

                        {/* Price on the right */}
                        <div className="font-semibold">
                          Rs. {item.price * item.quantity}
                        </div>
                      </div>

                      {/* Special instructions */}
                      <textarea
                        placeholder="Special instructions..."
                        className="w-full p-2 border rounded"
                        value={item.specialInstructions}
                        onChange={(e) => updateInstructions(item.id, e.target.value)}
                      />

                      {/* Remove Button */}
                      <div className="flex mt-2">
                        <Button
                          text="Remove"
                          className="bg-white !border-2 !border-red !text-red py-2 px-4 rounded"
                          state={true}
                          id={`remove-item-${item.id}`}
                          onClick={() => removeItemFromForm(item.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* BOTTOM BUTTONS */}
                <div className="mt-4">
                  <div className="flex gap-2 mb-2">
                    <Button
                      text="Draft"
                      className="bg-white !border !border-[#FFD166] font-bold text-[#FFD166] py-2 flex-1 rounded"
                      state={true}
                      id="draft-btn"
                    />
                    <Button
                      text="Remove"
                      className="bg-white !border !border-red font-bold !text-red py-2 flex-1 rounded"
                      state={true}
                      id="remove-bottom-btn"
                    />
                  </div>

                  <Button
                    text="Fire"
                    className="bg-[#FFD166] text-white py-3 w-full rounded"
                    state={true}
                    id="fire-bottom-btn"
                  />
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}