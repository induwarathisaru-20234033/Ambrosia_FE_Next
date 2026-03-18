"use client";

import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import dynamic from "next/dynamic";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react"; // ✅ CHANGED: removed useEffect because auto-save draft logic was removed
import "primeicons/primeicons.css";
import { YellowButton } from "../../layout";
import { Col, Container, Row } from "react-bootstrap";

import "../../styles/kitchen-bar-ops.css";

const Button = dynamic(() => import("@/components/Button"), { ssr: false });

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  specialInstructions: string;
  price: number;
}

interface InitialValues {
  table: string;
  orderItems: OrderItem[];
}

// ✅ ADDED: support wrapped API response as well
interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}

export default function AddOrderPage() {
  const toastRef = useToastRef();
  const [searchText, setSearchText] = useState("");
  const [draftOrder, setDraftOrder] = useState<{
    id: number;
    orderNumber: string;
  } | null>(null);

  // ✅ CHANGED: menu API may return wrapped response { data: [...] }
  const { data: menuItemsResponse, isLoading, isError } = useGetQuery<
    ApiResponse<MenuItem[]> | MenuItem[],
    undefined
  >(["menuItems"], "/menu");

  // ✅ ADDED: safely get menu list whether API returns wrapped or direct array
  const menuItems: MenuItem[] = Array.isArray(menuItemsResponse)
    ? menuItemsResponse
    : menuItemsResponse?.data ?? [];

  // ✅ CHANGED: removed redirectPath from draft mutation
  // because saving draft should NOT redirect away from Add Order page
  const draftMutation = usePostQuery({
    toastRef,
  });

  const fireMutation = usePostQuery({
    redirectPath: "/menu/kitchen-bar-ops/order-mgt",
    successMessage: "Order sent to kitchen successfully!",
    toastRef,
  });

  const orderSchema = Yup.object().shape({
    table: Yup.string().required("Select a table"),
    orderItems: Yup.array().min(1, "Add at least one menu item"),
  });

  return (
    <Container fluid className="relative">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="kbo-title">Order Management and History</h1>
        </Col>
        <Col xs="auto">
          <YellowButton
            onClick={() => {
              window.location.href = "/menu/kitchen-bar-ops/order-mgt";
            }}
          >
            Back
          </YellowButton>
        </Col>
      </Row>

      <Formik<InitialValues>
        initialValues={{ table: "", orderItems: [] }}
        validationSchema={orderSchema}
        onSubmit={() => {}}
      >
        {(formik) => {
          // ✅ ADDED: helper to create BE payload in the correct format
          const buildOrderPayload = () => ({
            tableId: formik.values.table ? Number(formik.values.table) : null,
            items: formik.values.orderItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              specialInstructions: item.specialInstructions,
            })),
            isDraft: true,
          });

          // ✅ ADDED: manual draft save
          // removed broken auto-save because backend has no update draft endpoint
          const saveDraft = async () => {
            if (!formik.values.table) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Select a table first",
              });
              return;
            }

            if (formik.values.orderItems.length === 0) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Add at least one menu item before saving draft",
              });
              return;
            }

            try {
              const response = await draftMutation.mutateAsync({
                url: "/orders",
                body: buildOrderPayload(),
              });

              const order = response.data?.data;

              if (order?.id && order?.orderNumber) {
                setDraftOrder({
                  id: order.id,
                  orderNumber: order.orderNumber,
                });

                toastRef?.current?.show({
                  severity: "success",
                  summary: "Success",
                  detail: "Order saved as draft successfully!",
                  life: 3000,
                });
              }
            } catch {
              // error toast already handled inside usePostQuery
            }
          };

          // ✅ CHANGED: fire order now first creates draft if needed,
          // then calls the correct send-to-kds endpoint
          const fireOrder = async () => {
            if (!formik.values.table) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Select a table first",
              });
              return;
            }

            if (formik.values.orderItems.length === 0) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Add at least one menu item before firing",
              });
              return;
            }

            let currentOrder = draftOrder;

            // ✅ ADDED: if no draft exists, create one first
            if (!currentOrder) {
              try {
                const draftResponse = await draftMutation.mutateAsync({
                  url: "/orders",
                  body: buildOrderPayload(),
                });

                const createdOrder = draftResponse.data?.data;

                if (!createdOrder?.id) {
                  toastRef?.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to create draft before firing",
                  });
                  return;
                }

                currentOrder = {
                  id: createdOrder.id,
                  orderNumber: createdOrder.orderNumber,
                };

                setDraftOrder(currentOrder);
              } catch {
                return;
              }
            }

            try {
              await fireMutation.mutateAsync({
                url: `/orders/${currentOrder.id}/send-to-kds`,
                body: {
                  orderId: currentOrder.id,
                  tableId: formik.values.table
                    ? Number(formik.values.table)
                    : null,
                },
              });

              // ✅ ADDED: local cleanup after successful fire
              setDraftOrder(null);
              formik.resetForm();
            } catch {
              // error toast already handled inside usePostQuery
            }
          };

          const addItemToForm = (item: MenuItem) => {
            if (!formik.values.table) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Select a table first",
              });
              return;
            }

            const items = [...formik.values.orderItems];
            const index = items.findIndex((i) => i.menuItemId === item.id);

            if (index !== -1) {
              items[index].quantity += 1;
            } else {
              items.push({
                menuItemId: item.id,
                name: item.name,
                quantity: 1,
                specialInstructions: "",
                price: item.price,
              });
            }

            formik.setFieldValue("orderItems", items);
          };

          const removeItemFromForm = (menuItemId: number) => {
            formik.setFieldValue(
              "orderItems",
              formik.values.orderItems.filter(
                (i) => i.menuItemId !== menuItemId
              )
            );
          };

          const updateInstructions = (menuItemId: number, value: string) => {
            formik.setFieldValue(
              "orderItems",
              formik.values.orderItems.map((i) =>
                i.menuItemId === menuItemId
                  ? { ...i, specialInstructions: value }
                  : i
              )
            );
          };

          const changeQuantity = (menuItemId: number, delta: number) => {
            const updatedItems = formik.values.orderItems.map((i) =>
              i.menuItemId === menuItemId
                ? { ...i, quantity: i.quantity + delta }
                : i
            );

            const targetItem = updatedItems.find(
              (i) => i.menuItemId === menuItemId
            );

            if (targetItem && targetItem.quantity <= 0) {
              const confirmRemove = confirm(
                `Quantity of "${targetItem.name}" is 0. Remove item?`
              );

              if (confirmRemove) {
                formik.setFieldValue(
                  "orderItems",
                  updatedItems.filter((i) => i.menuItemId !== menuItemId)
                );
              } else {
                formik.setFieldValue(
                  "orderItems",
                  updatedItems.map((i) =>
                    i.menuItemId === menuItemId ? { ...i, quantity: 1 } : i
                  )
                );
              }
            } else {
              formik.setFieldValue("orderItems", updatedItems);
            }
          };

          // same filtering/grouping logic, only using corrected menuItems source
          const filteredMenuItems = menuItems
            ?.filter((item) => item.isAvailable)
            .filter(
              (item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.category.toLowerCase().includes(searchText.toLowerCase())
            );

          const groupedMenuItems: Record<string, MenuItem[]> = {};
          filteredMenuItems?.forEach((item) => {
            if (!groupedMenuItems[item.category]) {
              groupedMenuItems[item.category] = [];
            }
            groupedMenuItems[item.category].push(item);
          });

          return (
            <Form className="h-screen flex flex-col">
              <div className="flex flex-1 overflow-hidden">
                {/* MENU PANEL */}
                <div className="w-[55%] p-6 overflow-y-auto">
                  {/* SEARCH BAR */}
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Search menu item..."
                      className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button
                      type="button"
                      className="bg-[#FFD166] px-4 rounded flex items-center justify-center"
                    >
                      <i className="pi pi-search text-white"></i>
                    </button>
                  </div>

                  {/* MENU ITEMS */}
                  {isLoading && <p>Loading menu...</p>}
                  {isError && <p className="text-red-500">Failed to load menu.</p>}

                  {Object.keys(groupedMenuItems).map((category) => (
                    <div key={category} className="mb-6">
                      <h2 className="font-bold text-lg mb-3">{category}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {groupedMenuItems[category].map((item) => (
                          <div
                            key={item.id}
                            className="border p-4 rounded-lg flex flex-col items-center justify-between shadow hover:shadow-lg transition"
                          >
                            <p className="font-semibold text-center mb-2">
                              {item.name}
                            </p>
                            <p className="text-gray-700 mb-3">Rs. {item.price}</p>
                            <Button
                              id={`add-item-${item.id}`}
                              text="+"
                              className="bg-[#FFD166] text-white px-4 py-2 rounded"
                              state={true}
                              onClick={() => addItemToForm(item)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-px bg-gray-300"></div>

                {/* ORDER PANEL */}
                <div className="w-[45%] flex flex-col p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="ml-2 text-gray-700">
                        Order ID: {draftOrder?.orderNumber ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[#FFD166] font-semibold text-lg">
                        Table:
                      </span>
                      <select
                        name="table"
                        value={formik.values.table}
                        onChange={formik.handleChange}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">Select</option>
                        <option value="1">Table 1</option>
                        <option value="2">Table 2</option>
                        <option value="3">Table 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b border-gray-300 mb-4"></div>

                  {/* ORDER ITEMS */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    {formik.values.orderItems.length === 0 && (
                      <p className="text-gray-500">No items added</p>
                    )}

                    {formik.values.orderItems.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="border border-black shadow-sm p-3 mb-3 rounded-md flex flex-col gap-2"
                      >
                        <p className="font-bold text-lg">{item.name}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              text="-"
                              id={`decrease-quantity-${item.menuItemId}`}
                              className="bg-white border border-gray-400 text-gray-700 py-1 px-3 rounded"
                              state={true}
                              onClick={() => changeQuantity(item.menuItemId, -1)}
                            />
                            <span className="px-2">{item.quantity}</span>
                            <Button
                              text="+"
                              id={`increase-quantity-${item.menuItemId}`}
                              className="bg-white border border-gray-400 text-gray-700 py-1 px-3 rounded"
                              state={true}
                              onClick={() => changeQuantity(item.menuItemId, 1)}
                            />
                          </div>

                          <div className="font-semibold">
                            Rs. {item.price * item.quantity}
                          </div>
                        </div>

                        <textarea
                          placeholder="Special instructions..."
                          className="w-full p-2 border rounded"
                          value={item.specialInstructions}
                          onChange={(e) =>
                            updateInstructions(item.menuItemId, e.target.value)
                          }
                        />

                        <div className="flex mt-2">
                          <Button
                            text="Remove"
                            id={`remove-item-${item.menuItemId}`}
                            className="bg-white !border-2 !border-red !text-red py-2 px-4 rounded"
                            state={true}
                            onClick={() => removeItemFromForm(item.menuItemId)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="flex gap-2 mb-2">
                      <Button
                        text="Draft"
                        id="draft-btn"
                        className="bg-white !border !border-[#FFD166] font-bold text-[#FFD166] py-2 flex-1 rounded"
                        state={true}
                        onClick={saveDraft} // ✅ CHANGED: Draft button now saves draft
                      />
                      <Button
                        text="Remove"
                        id="remove-bottom-btn"
                        className="bg-white !border !border-red font-bold !text-red py-2 flex-1 rounded"
                        state={true}
                        onClick={() => {
                          formik.resetForm();
                          setDraftOrder(null);
                        }}
                      />
                    </div>

                    <Button
                      text="Fire"
                      id="fire-bottom-btn"
                      className="bg-[#FFD166] text-white py-3 w-full rounded"
                      state={true}
                      onClick={fireOrder}
                      disabled={
                        formik.values.orderItems.length === 0 ||
                        fireMutation.isPending ||
                        draftMutation.isPending
                      } // ✅ CHANGED: removed !draftOrder so Fire can create draft first
                    />
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
}