"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToastRef } from "@/contexts/ToastContext";
import { usePostQuery } from "@/services/queries/postQuery";
import { useGetQuery } from "@/services/queries/getQuery";
import dynamic from "next/dynamic";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import "primeicons/primeicons.css";
import { YellowButton } from "../../layout";
import { Col, Container, Row } from "react-bootstrap";
import { IBaseApiResponse, ITable, IBackendOrder } from "@/data-types";
import { usePutQuery } from "@/services/queries/putQuery";
import { useDeleteQuery } from "@/services/queries/deleteQuery";
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

export default function AddOrderPage() {
  const toastRef = useToastRef();
  const searchParams = useSearchParams();
  const draftOrderId = searchParams.get("id");
  console.log("draftOrderId:", draftOrderId);
  const [searchText, setSearchText] = useState("");
  const [draftOrder, setDraftOrder] = useState<{
    id: number;
    orderNumber: string;
  } | null>(null);

  const { data: menuItemsResponse, isLoading, isError } = useGetQuery<
  IBaseApiResponse<MenuItem[]> | MenuItem[],
  undefined
>(["menuItems"], "/menu");
  

  // safely get menu list whether API returns wrapped or direct array
  const menuItems: MenuItem[] = Array.isArray(menuItemsResponse)
    ? menuItemsResponse
    : menuItemsResponse?.data ?? [];
  
  const { 
    data: tablesResponse, 
    isLoading: isTablesLoading, 
    isError: isTablesError } =
      useGetQuery<IBaseApiResponse<ITable[]>, undefined>
        (["tables"], "/tables");
  
  const {
    data: existingDraftResponse,
    isLoading: isDraftLoading, } = 
      useGetQuery<IBaseApiResponse<IBackendOrder>, undefined>(
  ["draftOrder", draftOrderId || ""],
  `/orders/${draftOrderId}`, undefined,
  {
    enabled: !!draftOrderId, // only run if id exists
    toastRef,
  }
);

  const tables: ITable[] = tablesResponse?.data ?? [];

  // because saving draft should NOT redirect away from Add Order page
  const draftMutation = usePostQuery({
    toastRef,
  });

  const updateDraftMutation = usePutQuery({
  toastRef,
});

const deleteDraftItemMutation = useDeleteQuery({
  toastRef,
  successMessage: null,
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
      {isDraftLoading && (
        <p className="text-gray-500 mb-3">Loading draft order...</p>)}
      <Formik<InitialValues>
        initialValues={{ table: "", orderItems: [] }}
        validationSchema={orderSchema}
        onSubmit={() => {}}
      >
        {(formik) => {
          useEffect(() => {
            console.log("existingDraftResponse:", existingDraftResponse);

            const existingOrder = existingDraftResponse?.data;

            if (!existingOrder || draftOrder) return; // prevent overwrite

            setDraftOrder({
              id: existingOrder.id,
              orderNumber: existingOrder.orderNumber,
            });

            formik.setValues({
              table: existingOrder.tableId ? String(existingOrder.tableId) : "",
              orderItems: existingOrder.items.map((item) => ({
                menuItemId: item.menuItemId,
                name: item.menuItemName,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions ?? "",
                price: item.unitPrice,
              })),
            });
          }, [existingDraftResponse]);
          // helper to create BE payload in the correct format
          const buildOrderPayload = (items: OrderItem[] = formik.values.orderItems) => ({
            tableId: formik.values.table ? Number(formik.values.table) : null,
            items: items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              specialInstructions: item.specialInstructions,
            })),
            isDraft: true,
          });

          const syncDraftItems = async (items: OrderItem[]) => {
            if (!draftOrder) return;

            try {
              await updateDraftMutation.mutateAsync({
                url: `/orders/${draftOrder.id}/items`,
                body: {
                  orderId: draftOrder.id,
                  items: items.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                  })),
                },
              });
            } catch {
              // error toast handled in usePutQuery
            }
          };
          
          const deleteDraftItem = async (menuItemId: number) => {
            if (!draftOrder) return;

            try {
              await deleteDraftItemMutation.mutateAsync({
                url: `/orders/${draftOrder.id}/items/${menuItemId}`,
              });
            } catch {
              // error toast handled in useDeleteQuery
            }
          };

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
            // if draft already exists, just update it
            if (draftOrder) {
              await syncDraftItems(formik.values.orderItems);

              toastRef?.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Order Saved successfully!",
                life: 3000,
              });

              return;
            }

            // if no draft exists, create one
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
                  detail: "Order saved successfully!",
                  life: 3000,
                });
              }
            } catch {
              // error toast already handled inside usePostQuery
            }
          };

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

          const addItemToForm = async (item: MenuItem) => {
            if (!formik.values.table) {
              toastRef?.current?.show({
                severity: "warn",
                summary: "Validation",
                detail: "Select a table first",
              });
              return;
            }

            if (draftMutation.isPending || updateDraftMutation.isPending) return;

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

            // update FE panel immediately
            formik.setFieldValue("orderItems", items);

            // STEP 1: if draft does not exist yet, create it automatically
            if (!draftOrder) {
              try {
                const response = await draftMutation.mutateAsync({
                  url: "/orders",
                  body: buildOrderPayload(items),
                });

                const order = response.data?.data;
                
                if (order?.id && order?.orderNumber) {
                  setDraftOrder({
                    id: order.id,
                    orderNumber: order.orderNumber,
                  });
                }
              } catch {
                  formik.setFieldValue(
                    "orderItems",
                    items.filter((i) => i.menuItemId !== item.id)
                  );
              } 
            } else {
                  await syncDraftItems(items);
            }
          };

          const removeItemFromForm = async (menuItemId: number) => {
              const item = formik.values.orderItems.find(
                (i) => i.menuItemId === menuItemId
              );

              const confirmDelete = confirm(
                `Remove "${item?.name}" from order?`
              );

              if (!confirmDelete) return;
              
            const updatedItems = formik.values.orderItems.filter(
              (i) => i.menuItemId !== menuItemId
            );

            formik.setFieldValue("orderItems", updatedItems);

            if (draftOrder) {
              await deleteDraftItem(menuItemId);
            }
          };

          let instructionTimeout: any;
          const updateInstructions = async (menuItemId: number, value: string) => {
            const updatedItems = formik.values.orderItems.map((i) =>
              i.menuItemId === menuItemId
                ? { ...i, specialInstructions: value }
                : i
            );
            formik.setFieldValue("orderItems", updatedItems);

            if (draftOrder) {
              clearTimeout(instructionTimeout);
              instructionTimeout = setTimeout(async () => {
                await syncDraftItems(updatedItems);
              }, 500); // wait 0.5s after typing
            }
          };

            const changeQuantity = async (menuItemId: number, delta: number) => {
              const updatedItems = formik.values.orderItems.map((i) =>
                i.menuItemId === menuItemId
                  ? { ...i, quantity: i.quantity + delta }
                  : i
              );

              const targetItem = updatedItems.find((i) => i.menuItemId === menuItemId);

              if (targetItem && targetItem.quantity <= 0) {
                const confirmRemove = confirm(
                  `Quantity of "${targetItem.name}" is 0. Remove item?`
                );

                if (confirmRemove) {
                  const filteredItems = updatedItems.filter(
                    (i) => i.menuItemId !== menuItemId
                  );

                  formik.setFieldValue("orderItems", filteredItems);
                    if (draftOrder) {
                    await deleteDraftItem(menuItemId);
                  }
                // remove sync will be handled properly in Step 3
                // for now just leave FE state updated
                } else {
                  const restoredItems = updatedItems.map((i) =>
                    i.menuItemId === menuItemId ? { ...i, quantity: 1 } : i
                  );
                  formik.setFieldValue("orderItems", restoredItems);

                  if (draftOrder) {
                    await syncDraftItems(restoredItems);
                  }
                }
              } else {
                formik.setFieldValue("orderItems", updatedItems);

                if (draftOrder) {
                  await syncDraftItems(updatedItems);
                }
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
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#FFD166] font-semibold text-lg">Table:</span>
                      <select
                        name="table"
                        value={formik.values.table}
                        onChange={formik.handleChange}
                        className="border rounded px-3 py-2 min-w-[220px]"
                      >
                        <option value="">Select</option>
                        {tables.map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.tableName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isTablesLoading && (
                      <p className="text-sm text-gray-500">Loading tables...</p>
                    )}
                    {isTablesError && (
                      <p className="text-sm text-red-500">Failed to load tables.</p>
                    )}
                  </div>
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
                        <span className="text-[#FFD166] font-semibold text-lg">Order Number: </span>
                         {draftOrder?.orderNumber ?? "—"}
                      </span>
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
                        text="Save"
                        id="draft-btn"
                        className="bg-white !border !border-[#FFD166] font-bold text-[#FFD166] py-2 flex-1 rounded"
                        state={true}
                        onClick={saveDraft} // Draft button now saves draft
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
                        draftMutation.isPending ||
                        updateDraftMutation.isPending ||
                        deleteDraftItemMutation.isPending
                      }
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