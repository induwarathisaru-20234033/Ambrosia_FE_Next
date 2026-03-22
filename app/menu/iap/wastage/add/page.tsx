"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { IBaseApiResponse } from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePostQuery } from "@/services/queries/postQuery";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

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
  uoM: string;
  unitPrice: number;
  currency: string;
  itemCategory: string;
}

interface InventoryItemOption {
  label: string;
  value: InventoryItemOptionValue;
}

interface WastageLineItem {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const WASTAGE_TYPE_OPTIONS = [
  { label: "Spoilage", value: "Spoilage" },
  { label: "Breakage", value: "Breakage" },
  { label: "Expiry", value: "Expiry" },
  { label: "Overproduction", value: "Overproduction" },
  { label: "Other", value: "Other" },
];

const initialFormValues: FormValues = {
  entryDate: new Date(),
  recordedBy: "",
  generalNotes: "",
  inventoryItemOption: null,
  wastageType: "",
  quantity: "",
  reason: "",
};

const tableStyle = { minWidth: "52rem" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddWastagePage() {
  const toastRef = useToastRef();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const postMutation = usePostQuery({
    redirectPath: "/menu/iap/wastage",
    successMessage: "Wastage record created successfully!",
    toastRef,
  });

  const [lineItems, setLineItems] = useState<WastageLineItem[]>([]);

  // ── Fetch inventory items (load all upfront, Dropdown handles client search) ──
  const { data: inventoryItemsResponse } = useGetQuery<
    IBaseApiResponse<PaginatedResultDto<InventoryItemDto>>,
    { pageNumber: number; pageSize: number }
  >(
    ["inventoryItemsForWastage"],
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
        uoM: item.uoM ?? "-",
        unitPrice: item.unitPrice ?? 0,
        currency: item.currency ?? "-",
        itemCategory: item.itemCategory ?? "-",
      },
    }));
  }, [inventoryItemsResponse]);

  // ── Line form helpers ──────────────────────────────────────────────────────

  const clearLineForm = useCallback(() => {
    if (!formikRef.current) return;
    formikRef.current.setFieldValue("inventoryItemOption", null, false);
    formikRef.current.setFieldValue("wastageType", "", false);
    formikRef.current.setFieldValue("quantity", "", false);
    formikRef.current.setFieldValue("reason", "", false);
  }, []);

  const removeLineItem = useCallback((itemNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((i) => i.itemNo !== itemNo);
      return filtered.map((i, idx) => ({ ...i, itemNo: idx + 1 }));
    });
  }, []);

  const renderRemoveAction = (row: WastageLineItem) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
      onClick={() => removeLineItem(row.itemNo)}
    >
      Remove
    </button>
  );

  // ── Add line validation & append ──────────────────────────────────────────

  const handleAddLineItem = (values: FormValues) => {
    if (!values.inventoryItemOption) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select an inventory item.",
        life: 3000,
      });
      return;
    }

    if (!values.wastageType) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select a wastage type.",
        life: 3000,
      });
      return;
    }

    const quantity = Number(values.quantity ?? 0);
    if (quantity <= 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Quantity must be greater than zero.",
        life: 3000,
      });
      return;
    }

    const newItem: WastageLineItem = {
      itemNo: lineItems.length + 1,
      inventoryItemId: values.inventoryItemOption.inventoryItemId,
      itemName: values.inventoryItemOption.itemName,
      wastageType: values.wastageType,
      quantity,
      reason: values.reason?.trim() || "",
    };

    setLineItems((prev) => [...prev, newItem]);
    clearLineForm();
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (values: FormValues) => {
    if (!values.recordedBy.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Recorded By is required.",
        life: 3000,
      });
      return;
    }

    if (lineItems.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "At least one wastage item is required.",
        life: 3000,
      });
      return;
    }

    postMutation.mutate({
      url: "/WastageRecords",
      body: {
        entryDate: values.entryDate
          ? new Date(values.entryDate).toISOString()
          : new Date().toISOString(),
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Formik<FormValues>
      innerRef={formikRef}
      initialValues={initialFormValues}
      enableReinitialize
      onSubmit={() => {
        // Button-driven submit
      }}
    >
      {({ values, setFieldValue, resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl space-y-6">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Add Wastage Record
            </h1>

            {/* ── Wastage Details ── */}
            <h2 className="text-base font-bold text-gray-800 mb-2">
              Wastage Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
              <div className="md:col-span-2 lg:col-span-2">
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
            </div>

            {/* ── Line Details ── */}
            <h2 className="text-base font-bold text-black">Line Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Dropdown
                name="inventoryItemOption"
                id="inventoryItemOption"
                label="Item*"
                placeholder="Select inventory item"
                options={inventoryItemOptions}
                isSearchable
                showClearOption
                onChange={(event: {
                  value?: InventoryItemOptionValue | null;
                }) => {
                  if (!event.value) {
                    setFieldValue("inventoryItemOption", null, false);
                  }
                }}
              />

              <Dropdown
                name="wastageType"
                id="wastageType"
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
                    onChange={(e) =>
                      setFieldValue("reason", e.target.value, false)
                    }
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
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => handleAddLineItem(values)}
              />
              <Button
                id="clearWastageLineBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={clearLineForm}
              />
            </div>

            {/* ── Line Items Table ── */}
            <DataTable
              value={lineItems}
              emptyMessage="No wastage items added yet"
              stripedRows
              size="small"
              scrollable
              tableStyle={tableStyle}
            >
              <Column field="itemNo" header="Item No" />
              <Column field="itemName" header="Item Name" />
              <Column field="wastageType" header="Wastage Type" />
              <Column field="quantity" header="Quantity" />
              <Column field="reason" header="Reason for Wastage" />
              <Column
                header="Actions"
                body={renderRemoveAction}
                frozen
                alignFrozen="right"
                style={{ minWidth: "9rem" }}
              />
            </DataTable>

            {/* ── Footer Actions ── */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="resetWastageFormBtn"
                text="Reset"
                type="button"
                className="bg-[#696E79] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => {
                  resetForm();
                  setLineItems([]);
                }}
              />
              <Button
                id="saveWastageBtn"
                text="Save"
                type="button"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!postMutation.isPending}
                disabled={postMutation.isPending}
                onClick={() => handleSubmit(values)}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}