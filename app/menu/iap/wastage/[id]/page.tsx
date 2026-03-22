"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { IBaseApiResponse } from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface InventoryItemDto {
  id: number;
  itemName: string;
  itemNumber: string;
  uoM: string;
  itemCategory: string;
  unitPrice: number;
  currency: string;
}

interface PaginatedResultDto<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface InventoryItemOptionValue {
  inventoryItemId: number;
  itemName: string;
}

interface InventoryItemOption {
  label: string;
  value: InventoryItemOptionValue;
}

interface WastageEntryItemDto {
  id: number;
  itemNo: number;
  wastageType: string;
  quantity: number;
  reason: string;
  inventoryItemId: number;
  inventoryItemName: string;
}

interface WastageRecordDto {
  id: number;
  wastageEntryNumber: string;
  entryDate: string;
  recordedBy: string;
  generalNotes: string;
  items: WastageEntryItemDto[];
}

interface EditableWastageItem {
  itemNo: number;
  inventoryItemId: number;
  itemName: string;
  wastageType: string;
  quantity: number;
  reason: string;
}

interface FormValues {
  entryDate: Date | null;
  recordedBy: string;
  generalNotes: string;
  inventoryItemOption: InventoryItemOptionValue | null;
  wastageType: string;
  quantity: number | "";
  reason: string;
}

const WASTAGE_TYPE_OPTIONS = [
  { label: "Spoilage", value: "Spoilage" },
  { label: "Breakage", value: "Breakage" },
  { label: "Expiry", value: "Expiry" },
  { label: "Overproduction", value: "Overproduction" },
  { label: "Other", value: "Other" },
];

const tableStyle = { minWidth: "52rem" };

export default function EditWastagePage() {
  const params = useParams<{ id: string }>();
  const toastRef = useToastRef();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const requestId = useMemo(() => params?.id ?? "", [params?.id]);
  const numericRequestId = useMemo(() => Number(requestId), [requestId]);

  const patchMutation = usePatchQuery({
    redirectPath: "/menu/iap/wastage",
    successMessage: "Wastage record updated successfully!",
    toastRef,
  });

  const {
    data: wastageResponse,
    isLoading,
    isFetching,
  } = useGetQuery<IBaseApiResponse<WastageRecordDto>, undefined>(
    ["wastageRecordById", requestId],
    `/WastageRecords/${requestId}`,
    undefined,
    { enabled: !!requestId, toastRef },
  );

  const wastageRecord = wastageResponse?.data;

  const { data: inventoryItemsResponse } = useGetQuery<
    IBaseApiResponse<PaginatedResultDto<InventoryItemDto>>,
    { pageNumber: number; pageSize: number }
  >(
    ["inventoryItemsForWastageEdit"],
    "/Inventory/items",
    { pageNumber: 1, pageSize: 100 },
    { enabled: true, toastRef },
  );

  const inventoryItemOptions: InventoryItemOption[] = useMemo(() => {
    const items = inventoryItemsResponse?.data?.items ?? [];
    return items.map((item) => ({
      label: `${item.itemName} (${item.itemNumber})`,
      value: {
        inventoryItemId: item.id,
        itemName: item.itemName,
      },
    }));
  }, [inventoryItemsResponse]);

  const initialLineItems = useMemo<EditableWastageItem[]>(() => {
    return (wastageRecord?.items ?? []).map((item) => ({
      itemNo: item.itemNo,
      inventoryItemId: item.inventoryItemId,
      itemName: item.inventoryItemName,
      wastageType: item.wastageType,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }, [wastageRecord]);

  const [lineItems, setLineItems] = useState<EditableWastageItem[]>([]);

  useEffect(() => {
    setLineItems(initialLineItems);
  }, [initialLineItems]);

  const initialValues: FormValues = {
    entryDate: wastageRecord?.entryDate ? new Date(wastageRecord.entryDate) : null,
    recordedBy: wastageRecord?.recordedBy ?? "",
    generalNotes: wastageRecord?.generalNotes ?? "",
    inventoryItemOption: null,
    wastageType: "",
    quantity: "",
    reason: "",
  };

  const updateLineItemField = useCallback(
    (itemNo: number, field: "wastageType" | "quantity" | "reason", value: string) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.itemNo !== itemNo) return item;
          if (field === "quantity") return { ...item, quantity: Math.max(0, Number(value) || 0) };
          return { ...item, [field]: value };
        }),
      );
    },
    [],
  );

  const removeLineItem = useCallback((itemNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((i) => i.itemNo !== itemNo);
      return filtered.map((i, idx) => ({ ...i, itemNo: idx + 1 }));
    });
  }, []);

  const clearLineForm = useCallback(() => {
    if (!formikRef.current) return;
    formikRef.current.setFieldValue("inventoryItemOption", null, false);
    formikRef.current.setFieldValue("wastageType", "", false);
    formikRef.current.setFieldValue("quantity", "", false);
    formikRef.current.setFieldValue("reason", "", false);
  }, []);

  const handleAddLineItem = (values: FormValues) => {
    if (!values.inventoryItemOption) {
      toastRef.current?.show({ severity: "warn", summary: "Validation", detail: "Please select an inventory item.", life: 3000 });
      return;
    }
    if (!values.wastageType) {
      toastRef.current?.show({ severity: "warn", summary: "Validation", detail: "Please select a wastage type.", life: 3000 });
      return;
    }
    const quantity = Number(values.quantity ?? 0);
    if (quantity <= 0) {
      toastRef.current?.show({ severity: "warn", summary: "Validation", detail: "Quantity must be greater than zero.", life: 3000 });
      return;
    }
    setLineItems((prev) => [
      ...prev,
      {
        itemNo: prev.length + 1,
        inventoryItemId: values.inventoryItemOption!.inventoryItemId,
        itemName: values.inventoryItemOption!.itemName,
        wastageType: values.wastageType,
        quantity,
        reason: values.reason?.trim() || "",
      },
    ]);
    clearLineForm();
  };

  const renderWastageTypeInput = (row: EditableWastageItem) => (
    <select
      className="form-control !py-1 !text-sm w-32"
      value={row.wastageType}
      onChange={(e) => updateLineItemField(row.itemNo, "wastageType", e.target.value)}
    >
      <option value="">Select</option>
      {WASTAGE_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const renderQuantityInput = (row: EditableWastageItem) => (
    <input
      type="number"
      min={0}
      className="form-control !py-1 !text-sm w-24"
      value={row.quantity}
      onChange={(e) => updateLineItemField(row.itemNo, "quantity", e.target.value)}
    />
  );

  const renderReasonInput = (row: EditableWastageItem) => (
    <input
      type="text"
      className="form-control !py-1 !text-sm w-36"
      value={row.reason}
      onChange={(e) => updateLineItemField(row.itemNo, "reason", e.target.value)}
    />
  );

  const renderRemoveAction = (row: EditableWastageItem) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
      onClick={() => removeLineItem(row.itemNo)}
    >
      Remove
    </button>
  );

  const handleSubmit = (values: FormValues) => {
    if (!requestId || Number.isNaN(numericRequestId)) {
      toastRef.current?.show({ severity: "error", summary: "Error", detail: "Invalid wastage record ID.", life: 3000 });
      return;
    }
    if (!values.recordedBy.trim()) {
      toastRef.current?.show({ severity: "warn", summary: "Validation", detail: "Recorded By is required.", life: 3000 });
      return;
    }
    if (lineItems.length === 0) {
      toastRef.current?.show({ severity: "warn", summary: "Validation", detail: "At least one wastage item is required.", life: 3000 });
      return;
    }
    patchMutation.mutate({
      url: `/WastageRecords/${requestId}`,
      body: {
        id: numericRequestId,
        entryDate: values.entryDate ? new Date(values.entryDate).toISOString() : new Date().toISOString(),
        recordedBy: values.recordedBy.trim(),
        generalNotes: values.generalNotes.trim(),
        items: lineItems.map((item) => ({
          itemNo: item.itemNo,
          inventoryItemId: item.inventoryItemId,
          wastageType: item.wastageType,
          quantity: item.quantity,
          reason: item.reason,
        })),
      },
    });
  };


  if ((isLoading || isFetching) && !wastageRecord) {
    return <div className="p-6 text-sm text-gray-600">Loading wastage record...</div>;
  }

  return (
    <Formik<FormValues>
      innerRef={formikRef}
      initialValues={initialValues}
      enableReinitialize
      onSubmit={() => {}}
    >
      {({ values, setFieldValue, resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl space-y-6">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Edit Wastage Record
            </h1>

            <h2 className="text-base font-bold text-gray-800 mb-2">
              Wastage Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">          
              <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                <label className="form-label" htmlFor="wastageEntryNumber">
                  Entry Number
                </label>
                <input
                  id="wastageEntryNumber"
                  type="text"
                  className="form-control bg-gray-100 cursor-not-allowed"
                  value={wastageRecord?.wastageEntryNumber ?? ""}
                  disabled
                  readOnly
                />
              </div>

              <DatePicker
                name="entryDate"
                id="entryDate"
                label="Entry Date"
                placeholder="Select date"
              />
              <LabelGroup
                name="recordedBy"
                id="recordedBy"
                label="Recorded By*"
                type="text"
                placeholder="Enter name"
              />
              <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                <label className="form-label" htmlFor="generalNotes">
                  General Notes
                </label>
                <Field
                  as="textarea"
                  id="generalNotes"
                  name="generalNotes"
                  className="form-control"
                  placeholder="Enter general notes"
                  rows={2}
                />
              </div>
            </div>

            <h2 className="text-base font-bold text-black">Add Line Item</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              <Dropdown
                name="inventoryItemOption"
                id="inventoryItemOption"
                label="Item*"
                placeholder="Select inventory item"
                options={inventoryItemOptions}
                isSearchable
                showClearOption
                onChange={(event: { value?: InventoryItemOptionValue | null }) => {
                  if (!event.value) setFieldValue("inventoryItemOption", null, false);
                }}
              />
              <Dropdown
                name="wastageType"
                id="wastageTypeAdd"
                label="Wastage Type*"
                placeholder="Select type"
                options={WASTAGE_TYPE_OPTIONS}
                showClearOption
              />
              <LabelGroup
                name="quantity"
                id="quantity"
                label="Quantity*"
                type="number"
                min={0}
                placeholder="Enter quantity"
              />
              <div className="md:col-span-2 lg:col-span-2">
                <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                  <label className="form-label" htmlFor="reason">
                    Reason for Wastage
                  </label>
                  <textarea
                    id="reason"
                    className="form-control"
                    rows={2}
                    value={values.reason}
                    onChange={(e) => setFieldValue("reason", e.target.value, false)}
                    placeholder="Enter reason"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                id="addWastageLineBtn"
                text="Add Line"
                type="button"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => handleAddLineItem(values)}
              />
              <Button
                id="clearWastageLineBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={clearLineForm}
              />
            </div>

            <DataTable
              value={lineItems}
              emptyMessage="No wastage items found"
              stripedRows
              size="small"
              scrollable
              tableStyle={tableStyle}
            >
              <Column field="itemNo" header="Item No" />
              <Column field="itemName" header="Item Name" />
              <Column header="Wastage Type" body={renderWastageTypeInput} />
              <Column header="Quantity" body={renderQuantityInput} />
              <Column header="Reason for Wastage" body={renderReasonInput} />
              <Column
                header="Actions"
                body={renderRemoveAction}
                frozen
                alignFrozen="right"
                style={{ minWidth: "9rem" }}
              />
            </DataTable>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="resetWastageEditBtn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => {
                  resetForm({ values: initialValues });
                  setLineItems(initialLineItems);
                }}
              />
              <Button
                id="saveWastageEditBtn"
                text="Save"
                type="button"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => handleSubmit(values)}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}