"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IInventoryItem,
  IPaginatedApiResponse,
  IPurchaseRequest,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useParams } from "next/navigation";

const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface FormValues {
  description: string;
  supplier: string;
  requester: string;
  requestedDeliveryDate: Date | null;
  urgent: string;
}

interface MaterialSearchParams {
  itemName: string;
  pageNumber: number;
  pageSize: number;
}

interface MaterialLineItem {
  lineNo: number;
  itemNumber: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  uoM: string;
  unitPrice: number;
}

type QuantityChangeHandler = (lineNo: number, value: string) => void;
type RemoveLineHandler = (lineNo: number) => void;

const createEditableQuantityBody = (
  onQuantityChange: QuantityChangeHandler,
) => {
  return (row: MaterialLineItem) => (
    <input
      type="number"
      min={0}
      step="any"
      className="form-control !py-1 !text-sm w-20"
      value={row.quantity}
      onChange={(e) => onQuantityChange(row.lineNo, e.target.value)}
    />
  );
};

const createRemoveActionBody = (onRemove: RemoveLineHandler) => {
  return (row: MaterialLineItem) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
      onClick={() => onRemove(row.lineNo)}
    >
      Remove
    </button>
  );
};

const urgentOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export default function EditPurchaseRequestsPage() {
  const toastRef = useToastRef();
  const params = useParams<{ id: string }>();
  const requestId = useMemo(() => params?.id ?? "", [params?.id]);

  const [materialSearch, setMaterialSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<IInventoryItem | null>(null);
  const [lineItems, setLineItems] = useState<MaterialLineItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: purchaseRequestResponse,
    isLoading: isRequestLoading,
    isFetching: isRequestFetching,
  } = useGetQuery<IBaseApiResponse<IPurchaseRequest>, undefined>(
    ["getPurchaseRequestForEdit", requestId],
    `/PurchaseRequests/${requestId}`,
    undefined,
    {
      enabled: !!requestId,
      toastRef,
    },
  );

  const purchaseRequestData = purchaseRequestResponse?.data;

  const initialLineItems = useMemo<MaterialLineItem[]>(() => {
    if (!purchaseRequestData?.prItems?.length) {
      return [];
    }

    return purchaseRequestData.prItems.map((item, idx) => ({
      lineNo: item.lineItemNo ?? idx + 1,
      itemNumber:
        item.inventoryItem?.itemNumber ||
        (item.inventoryItemId ? String(item.inventoryItemId) : ""),
      itemName: item.inventoryItem?.itemName || "",
      itemCategory: item.inventoryItem?.itemCategory || "",
      quantity: Number(item.requestedQuantity ?? 0),
      uoM: item.inventoryItem?.uoM || item.inventoryItem?.uom || "",
      unitPrice: Number(item.price ?? 0),
    }));
  }, [purchaseRequestData]);

  useEffect(() => {
    setLineItems(initialLineItems);
  }, [initialLineItems]);

  const { data: materialItemsData } = useGetQuery<
    IPaginatedApiResponse<IInventoryItem>,
    MaterialSearchParams
  >(
    ["inventoryItemsSearch", debouncedSearch],
    "/Inventory/items",
    { itemName: debouncedSearch, pageNumber: 1, pageSize: 10 },
    { enabled: debouncedSearch.length >= 4, toastRef },
  );

  const materialSuggestions = materialItemsData?.data?.items ?? [];

  const initialValues: FormValues = {
    description: purchaseRequestData?.description ?? "",
    supplier: purchaseRequestData?.supplier ?? "",
    requester: purchaseRequestData?.requestedBy ?? "",
    requestedDeliveryDate: purchaseRequestData?.requestedDeliveryDate
      ? new Date(purchaseRequestData.requestedDeliveryDate)
      : null,
    urgent: purchaseRequestData?.isUrgent ? "Yes" : "No",
  };

  const handleMaterialSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setMaterialSearch(value);
    setSelectedMaterial(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 4) {
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setShowSuggestions(true);
      }, 500);
    } else {
      setDebouncedSearch("");
      setShowSuggestions(false);
    }
  };

  const handleSelectMaterial = (item: IInventoryItem) => {
    setSelectedMaterial(item);
    setMaterialSearch(item.itemName ?? "");
    setShowSuggestions(false);
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial) return;

    const newLineItem: MaterialLineItem = {
      lineNo: lineItems.length + 1,
      itemNumber: selectedMaterial.itemNumber ?? "",
      itemName: selectedMaterial.itemName ?? "",
      itemCategory: selectedMaterial.itemCategory ?? "",
      quantity: 1,
      uoM: selectedMaterial.uoM ?? selectedMaterial.uom ?? "",
      unitPrice: Number(selectedMaterial.unitPrice ?? 0),
    };

    setLineItems((prev) => [...prev, newLineItem]);
    setMaterialSearch("");
    setSelectedMaterial(null);
    setDebouncedSearch("");
  };

  const handleQuantityChange = useCallback((lineNo: number, value: string) => {
    const qty = Math.max(0, Number(value) || 0);
    setLineItems((prev) =>
      prev.map((item) =>
        item.lineNo === lineNo ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  const handleRemoveLine = useCallback((lineNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.lineNo !== lineNo);
      return filtered.map((item, idx) => ({ ...item, lineNo: idx + 1 }));
    });
  }, []);

  const editableQuantityBody = useMemo(
    () => createEditableQuantityBody(handleQuantityChange),
    [handleQuantityChange],
  );

  const removeActionBody = useMemo(
    () => createRemoveActionBody(handleRemoveLine),
    [handleRemoveLine],
  );

  const isInitialLoading =
    (isRequestLoading || isRequestFetching) && !purchaseRequestData;

  if (isInitialLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading request...</div>;
  }

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={() => {
        // Update API integration will be connected in the next step.
      }}
      enableReinitialize
    >
      {({ resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Edit Purchase Request {requestId ? `- ${requestId}` : ""}
            </h1>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Requision Details
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                    <label className="form-label" htmlFor="description">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      className="form-control"
                      placeholder="Rice requirement for main kitchen operations"
                      rows={3}
                    />
                    <ErrorMessage
                      name="description"
                      render={(msg) => (
                        <div className="text-red text-xs mt-1">{msg}</div>
                      )}
                    />
                  </div>
                </div>

                <LabelGroup
                  label="Supplier"
                  name="supplier"
                  type="text"
                  placeholder="Enter Supplier"
                  id="supplier"
                  disabled={false}
                />

                <LabelGroup
                  label="Requester"
                  name="requester"
                  type="text"
                  placeholder=""
                  id="requester"
                  disabled={false}
                />

                <DatePicker
                  name="requestedDeliveryDate"
                  id="requestedDeliveryDate"
                  label="Requested Delivery Date"
                  placeholder="Select Date"
                  disabled={false}
                />

                <Dropdown
                  name="urgent"
                  id="urgent"
                  label="Urgent"
                  placeholder="Select Urgent Status"
                  options={urgentOptions}
                  disabled={false}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Materials
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div
                className="flex items-start gap-2"
                style={{ maxWidth: "24rem" }}
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Item name"
                    value={materialSearch}
                    onChange={handleMaterialSearchChange}
                    onFocus={() => {
                      if (materialSuggestions.length > 0)
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    autoComplete="off"
                  />
                  {showSuggestions && materialSuggestions.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {materialSuggestions.map((item) => (
                        <li key={item.id ?? item.itemNumber}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            onMouseDown={() => handleSelectMaterial(item)}
                          >
                            {item.itemNumber}
                            {item.itemName ? ` - ${item.itemName}` : ""}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  id="add-material-btn"
                  text="Add"
                  type="button"
                  className="!h-9 !px-7 !text-xs !font-medium !rounded-md !bg-[#15B097] !border !border-[#15B097] !text-white !shrink-0 !whitespace-nowrap"
                  state={true}
                  disabled={!selectedMaterial}
                  onClick={handleAddMaterial}
                />
              </div>

              <div className="mt-6">
                <DataTable
                  value={lineItems}
                  emptyMessage="No items added yet"
                  stripedRows
                  size="small"
                  tableStyle={{ minWidth: "50rem" }}
                >
                  <Column
                    field="lineNo"
                    header="Line Item No"
                    style={{ width: "6rem", textAlign: "center" }}
                  />
                  <Column field="itemNumber" header="Item Number" />
                  <Column field="itemName" header="Item Name" />
                  <Column field="itemCategory" header="Item Category" />
                  <Column
                    header="Quantity"
                    style={{ width: "8rem" }}
                    body={editableQuantityBody}
                  />
                  <Column field="uoM" header="UoM" />
                  <Column
                    header="Unit Price"
                    style={{ textAlign: "right" }}
                    body={(row: MaterialLineItem) => row.unitPrice.toFixed(2)}
                  />
                  <Column
                    header="Total Price"
                    style={{ textAlign: "right", maxWidth: "8rem" }}
                    body={(row: MaterialLineItem) =>
                      (row.quantity * row.unitPrice).toFixed(2)
                    }
                  />
                  <Column
                    style={{ width: "10rem", textAlign: "center" }}
                    body={removeActionBody}
                  />
                </DataTable>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="reset-purchase-request-btn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={true}
                onClick={() => {
                  resetForm();
                  setMaterialSearch("");
                  setDebouncedSearch("");
                  setShowSuggestions(false);
                  setSelectedMaterial(null);
                  setLineItems(initialLineItems);
                }}
              />
              <Button
                id="save-purchase-request-btn"
                text="Save"
                type="submit"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={true}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
