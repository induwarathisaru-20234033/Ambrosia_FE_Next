"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Form, Formik, FormikProps, Field } from "formik";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { IGoodsIssueNote, IInventoryItem, IMaterialSearchParams, IPaginatedApiResponse } from "@/data-types";
interface InventoryItemOption {
  label: string;
  value: number;
  itemName: string;
  itemNumber: string;
  currentInventoryQuantity: number | "";
  storageLocation: string;
  itemCategory: string;
  uoM: string;
  unitPrice: number;
  currency: string;
}

import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface InitialValues {
  giNumber: string;
  issuedBy: string;
  issuedDate: Date | null;
  remarks: string;
}

interface GoodIssueLineItem {
  lineItemNo: number;
  inventoryItemId: number;
  itemNumber: string;
  itemName: string;
  issuedFrom: string;
  issuedTo: string;
  requestedQuantity: number;
  issuedQuantity: number;
  itemCategory: string;
  uoM: string;
  unitPrice: number;
  currency: string;
  remarks: string;
}

const tableStyle = { minWidth: "72rem" };

export default function UpdateGoodIssueNotePage() {
  const { id } = useParams();
  const toastRef = useToastRef();
  const formikRef = useRef<FormikProps<InitialValues>>(null);
  const [lineItems, setLineItems] = useState<GoodIssueLineItem[]>([]);

  const [itemSearch, setItemSearch] = useState("");
  const [debouncedItemSearch, setDebouncedItemSearch] = useState("");
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryItemOption | null>(null);
  const [inventoryItemOptions, setInventoryItemOptions] = useState<
    InventoryItemOption[]
  >([]);

  // Debounce item search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedItemSearch(itemSearch.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [itemSearch]);

  // Use useGetQuery for inventory items
  const inventoryItemQueryParams = {
    itemName: debouncedItemSearch,
    pageNumber: 1,
    pageSize: 10,
  };

  const { data: inventoryItemsData, isFetching: isInventoryItemsFetching } =
    useGetQuery<IPaginatedApiResponse<IInventoryItem>, IMaterialSearchParams>(
      ["inventoryItemsForGoodIssue", debouncedItemSearch],
      "/Inventory/items",
      inventoryItemQueryParams,
      {
        enabled: debouncedItemSearch.length >= 2,
        toastRef,
      },
    );

  useEffect(() => {
    if (debouncedItemSearch.length < 2) {
      setInventoryItemOptions([]);
      return;
    }
    const items = inventoryItemsData?.data?.items ?? [];
    setInventoryItemOptions(
      items
        .filter((item: any) => item.id !== undefined && item.id !== null)
        .map((item: any) => ({
          label: item.itemName ?? "Inventory Item",
          value: Number(item.id),
          itemName: item.itemName ?? "Inventory Item",
          itemNumber: item.itemNumber ?? "",
          currentInventoryQuantity: Number(
            item.currentQuantity ?? item.openingQuantity ?? 0,
          ),
          storageLocation: item.storageLocation ?? "",
          itemCategory: item.itemCategory ?? "",
          uoM: item.uoM ?? item.uom ?? "",
          unitPrice: Number(item.unitPrice ?? 0),
          currency: item.currency ?? "",
        })),
    );
  }, [debouncedItemSearch, inventoryItemsData]);

  // Handler to apply selected inventory item to form fields
  const applySelectedInventoryItem = (option: InventoryItemOption | null) => {
    setSelectedInventoryItem(option);
    if (!formikRef.current) return;
    if (!option) {
      formikRef.current.setFieldValue("issuedFrom", "", false);
      formikRef.current.setFieldValue("currentInventoryQuantity", "", false);
      formikRef.current.setFieldValue("itemCategory", "", false);
      formikRef.current.setFieldValue("uoM", "", false);
      formikRef.current.setFieldValue("unitPrice", "", false);
      formikRef.current.setFieldValue("currency", "", false);
      return;
    }
    setItemSearch(option.itemName);
    formikRef.current.setFieldValue(
      "issuedFrom",
      option.storageLocation,
      false,
    );
    formikRef.current.setFieldValue(
      "currentInventoryQuantity",
      option.currentInventoryQuantity,
      false,
    );
    formikRef.current.setFieldValue("itemCategory", option.itemCategory, false);
    formikRef.current.setFieldValue("uoM", option.uoM, false);
    formikRef.current.setFieldValue("unitPrice", option.unitPrice, false);
    formikRef.current.setFieldValue("currency", option.currency, false);
  };

  // Handler to clear line details
  const clearLineDetails = (clearSelectedItem = true) => {
    if (!formikRef.current) return;
    if (clearSelectedItem) {
      clearSelectedInventoryItem();
    }
    clearLineDetailFields();
  };

  const clearSelectedInventoryItem = () => {
    applySelectedInventoryItem(null);
    setSelectedInventoryItem(null);
    setItemSearch("");
    setDebouncedItemSearch("");
    setShowItemSuggestions(false);
  };

  const clearLineDetailFields = () => {
    if (!formikRef.current) return;
    formikRef.current.setFieldValue("requestedQuantity", "", false);
    formikRef.current.setFieldValue("issuedQuantity", "", false);
    formikRef.current.setFieldValue("issuedFrom", "", false);
    formikRef.current.setFieldValue("issuedTo", "", false);
    formikRef.current.setFieldValue("currentInventoryQuantity", "", false);
    formikRef.current.setFieldValue("itemCategory", "", false);
    formikRef.current.setFieldValue("uoM", "", false);
    formikRef.current.setFieldValue("unitPrice", "", false);
    formikRef.current.setFieldValue("currency", "", false);
    formikRef.current.setFieldValue("remarks", "", false);
  };

  // Handler to add a line item
  const addLineItem = (values: any) => {
    if (!selectedInventoryItem) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select an item.",
        life: 3000,
      });
      return;
    }
    const requestedQuantity = Number(values.requestedQuantity ?? 0);
    const issuedQuantity = Number(values.issuedQuantity ?? 0);
    const unitPrice = Number(values.unitPrice ?? 0);
    if (requestedQuantity <= 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Requested quantity must be greater than zero.",
        life: 3000,
      });
      return;
    }
    if (issuedQuantity <= 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Issued quantity must be greater than zero.",
        life: 3000,
      });
      return;
    }
    if (issuedQuantity > requestedQuantity) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Issued quantity cannot be greater than requested quantity.",
        life: 3000,
      });
      return;
    }
    if (!values.issuedFrom?.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Issued From is required.",
        life: 3000,
      });
      return;
    }
    if (!values.issuedTo?.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Issued To is required.",
        life: 3000,
      });
      return;
    }
    const isDuplicateItem = lineItems.some(
      (item) => item.inventoryItemId === selectedInventoryItem.value,
    );
    if (isDuplicateItem) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "This item is already added to the list.",
        life: 3000,
      });
      return;
    }
    const newRow: GoodIssueLineItem = {
      lineItemNo: lineItems.length + 1,
      inventoryItemId: selectedInventoryItem.value,
      itemNumber: selectedInventoryItem.itemNumber,
      itemName: selectedInventoryItem.itemName,
      issuedFrom: values.issuedFrom.trim(),
      issuedTo: values.issuedTo.trim(),
      requestedQuantity,
      issuedQuantity,
      itemCategory: selectedInventoryItem.itemCategory,
      uoM: selectedInventoryItem.uoM,
      unitPrice,
      currency: selectedInventoryItem.currency,
      remarks: values.remarks?.trim() || "",
    };
    setLineItems((prev) => [...prev, newRow]);
    clearLineDetails(true);
  };

  // Ensure id is string or number for query key
  const idParam = typeof id === "string" || typeof id === "number" ? id : "";
  const { data: giResponse, isLoading } = useGetQuery<
    { succeeded: boolean; data: IGoodsIssueNote },
    undefined
  >(["goodsIssueNote", idParam], `/GoodsIssue/${idParam}`, undefined, {
    enabled: !!idParam,
    toastRef,
  });

  const patchMutation = usePatchQuery({
    redirectPath: "/menu/iap/good-issue",
    successMessage: "Good Issue Note updated successfully!",
    toastRef,
  });

  useEffect(() => {
    if (giResponse?.succeeded && giResponse.data) {
      const note = giResponse.data;
      formikRef.current?.setValues({
        giNumber: note.giNumber,
        issuedBy: note.issuedBy,
        issuedDate: note.issuedDate ? new Date(note.issuedDate) : null,
        remarks: "",
      });
      setLineItems(
        (note.items || []).map((item, idx) => ({
          lineItemNo: item.lineItemNo,
          inventoryItemId: item.inventoryItemId,
          itemNumber: item.inventoryItem?.itemNumber || "",
          itemName: item.inventoryItem?.itemName || "",
          issuedFrom: item.issuedFrom,
          issuedTo: item.issuedTo,
          requestedQuantity: item.requestedQuantity,
          issuedQuantity: item.issuedQuantity,
          itemCategory: item.inventoryItem?.itemCategory || "",
          uoM: item.inventoryItem?.uoM || item.inventoryItem?.uom || "",
          unitPrice: Number(item.inventoryItem?.unitPrice ?? 0),
          currency: item.inventoryItem?.currency || "",
          remarks: item.remarks || "",
        })),
      );
    }
  }, [giResponse]);

  const handleSubmit = (values: InitialValues) => {
    if (!values.issuedBy.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Issued By is required.",
        life: 3000,
      });
      return;
    }
    if (lineItems.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please add at least one item.",
        life: 3000,
      });
      return;
    }
    patchMutation.mutate({
      url: `/GoodsIssue/${id}`,
      body: {
        id: giResponse?.data?.id,
        issuedBy: values.issuedBy.trim(),
        issuedDate: values.issuedDate
          ? new Date(values.issuedDate).toISOString()
          : new Date().toISOString(),
        items: lineItems.map((item) => ({
          lineItemNo: item.lineItemNo,
          inventoryItemId: item.inventoryItemId,
          requestedQuantity: item.requestedQuantity,
          issuedQuantity: item.issuedQuantity,
          issuedFrom: item.issuedFrom,
          issuedTo: item.issuedTo,
          remarks: item.remarks,
        })),
      },
    });
  };

  const removeLineItem = (lineItemNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.lineItemNo !== lineItemNo);
      return filtered.map((item, idx) => ({ ...item, lineItemNo: idx + 1 }));
    });
  };

  const renderRemoveAction = (rowData: GoodIssueLineItem) => {
    return (
      <button
        type="button"
        className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
        onClick={() => removeLineItem(rowData.lineItemNo)}
      >
        Remove
      </button>
    );
  };

  if (isLoading || !giResponse?.data) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading Good Issue Note...
      </div>
    );
  }

  return (
    <Formik<InitialValues>
      innerRef={formikRef}
      initialValues={{
        giNumber: giResponse.data.giNumber,
        issuedBy: giResponse.data.issuedBy,
        issuedDate: giResponse.data.issuedDate
          ? new Date(giResponse.data.issuedDate)
          : null,
        remarks: "",
      }}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl space-y-6">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Update Goods Issue Note
            </h1>
            <h2 className="text-base font-bold text-gray-800 mb-2">
              Good Issue Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <LabelGroup
                name="giNumber"
                id="giNumber"
                label="Good Issue Number"
                type="text"
                disabled
              />
              <LabelGroup
                name="issuedBy"
                id="issuedBy"
                label="Issued By"
                type="text"
                disabled
              />
              <DatePicker
                name="issuedDate"
                id="issuedDate"
                label="Issued Date"
                disabled
              />
            </div>
            <h2 className="text-base font-bold text-black">Line Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                <label
                  htmlFor="inventoryItemSearch"
                  className="block mb-2 text-black"
                >
                  Item*
                </label>
                <div className="relative">
                  <input
                    id="inventoryItemSearch"
                    type="text"
                    className="form-control"
                    placeholder="Type inventory item name"
                    value={itemSearch}
                    onChange={(event) => {
                      const value = event.target.value;
                      setItemSearch(value);
                      applySelectedInventoryItem(null);
                      if (value.trim().length >= 2) {
                        setShowItemSuggestions(true);
                      } else {
                        setShowItemSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (
                        itemSearch.trim().length >= 2 &&
                        inventoryItemOptions.length > 0
                      ) {
                        setShowItemSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowItemSuggestions(false), 150);
                    }}
                    autoComplete="off"
                  />
                  {showItemSuggestions && inventoryItemOptions.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {inventoryItemOptions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            onMouseDown={() => {
                              applySelectedInventoryItem(option);
                              setShowItemSuggestions(false);
                            }}
                          >
                            <div className="font-medium">{option.itemName}</div>
                            {option.itemNumber && (
                              <div className="text-xs text-gray-500">
                                {option.itemNumber}
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {isInventoryItemsFetching && (
                  <small className="text-gray-500">Loading...</small>
                )}
              </div>
              <LabelGroup
                name="requestedQuantity"
                id="requestedQuantity"
                label="Requested Quantity*"
                type="number"
                min={0}
              />
              <LabelGroup
                name="currentInventoryQuantity"
                id="currentInventoryQuantity"
                label="Current Inventory Quantity"
                type="number"
                disabled
              />
              <LabelGroup
                name="issuedQuantity"
                id="issuedQuantity"
                label="Issued Quantity*"
                type="number"
                min={0}
              />
              <LabelGroup
                name="issuedFrom"
                id="issuedFrom"
                label="Issued From*"
                type="text"
                placeholder="Auto-filled from item storage location"
                disabled
              />
              <LabelGroup
                name="issuedTo"
                id="issuedTo"
                label="Issued To*"
                type="text"
                placeholder="Enter issued to"
              />
              <LabelGroup
                name="itemCategory"
                id="itemCategory"
                label="Item Category"
                type="text"
                disabled
              />
              <LabelGroup
                name="uoM"
                id="uoM"
                label="UOM"
                type="text"
                disabled
              />
              <LabelGroup
                name="unitPrice"
                id="unitPrice"
                label="Unit Price"
                type="number"
                disabled
              />
              <LabelGroup
                name="currency"
                id="currency"
                label="Currency"
                type="text"
                disabled
              />
              <div className="md:col-span-2 lg:col-span-2">
                <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                  <label className="form-label" htmlFor="remarks">
                    Remarks
                  </label>
                  <Field
                    as="textarea"
                    id="remarks"
                    name="remarks"
                    className="form-control"
                    placeholder="Enter remarks"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                id="addGoodIssueItemBtn"
                text="Add Item"
                type="button"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
                onClick={() => addLineItem(values)}
              />
              <Button
                id="clearGoodIssueItemBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={true}
                onClick={() => clearLineDetails(true)}
              />
            </div>
            <div className="mt-6">
              <DataTable
                value={lineItems}
                emptyMessage="No items found"
                stripedRows
                size="small"
                scrollable
                tableStyle={tableStyle}
              >
                <Column field="lineItemNo" header="Line Item No" />
                <Column
                  header="Item"
                  body={(rowData: GoodIssueLineItem) =>
                    `${rowData.itemNumber || "-"} - ${rowData.itemName}`
                  }
                />
                <Column field="itemCategory" header="Item Category" />
                <Column field="requestedQuantity" header="Requested Quantity" />
                <Column field="issuedQuantity" header="Issued Quantity" />
                <Column field="issuedFrom" header="Issued From" />
                <Column field="issuedTo" header="Issued To" />
                <Column field="uoM" header="UoM" />
                <Column
                  header="Action"
                  body={renderRemoveAction}
                  frozen
                  alignFrozen="right"
                  style={{ minWidth: "9rem" }}
                />
              </DataTable>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="reset-gi-update-btn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => {
                  resetForm();
                  setLineItems(
                    (giResponse.data.items || []).map((item, idx) => ({
                      lineItemNo: item.lineItemNo,
                      inventoryItemId: item.inventoryItemId,
                      itemNumber: item.inventoryItem?.itemNumber || "",
                      itemName: item.inventoryItem?.itemName || "",
                      issuedFrom: item.issuedFrom,
                      issuedTo: item.issuedTo,
                      requestedQuantity: item.requestedQuantity,
                      issuedQuantity: item.issuedQuantity,
                      itemCategory: item.inventoryItem?.itemCategory || "",
                      uoM:
                        item.inventoryItem?.uoM ||
                        item.inventoryItem?.uom ||
                        "",
                      unitPrice: Number(item.inventoryItem?.unitPrice ?? 0),
                      currency: item.inventoryItem?.currency || "",
                      remarks: item.remarks || "",
                    })),
                  );
                }}
              />
              <Button
                id="save-gi-update-btn"
                text="Save"
                type="submit"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
