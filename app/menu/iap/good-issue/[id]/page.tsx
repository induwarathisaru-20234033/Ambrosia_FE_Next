"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Form, Formik, FormikProps } from "formik";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { IGoodsIssueNote } from "@/data-types";
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

  const renderRemoveAction = (rowData: GoodIssueLineItem) => {
    const handleRemove = () => {
      setLineItems((prev) => {
        const filtered = prev.filter(
          (item) => item.lineItemNo !== rowData.lineItemNo,
        );
        return filtered.map((item, idx) => ({ ...item, lineItemNo: idx + 1 }));
      });
    };
    return (
      <button
        type="button"
        className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
        onClick={handleRemove}
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
