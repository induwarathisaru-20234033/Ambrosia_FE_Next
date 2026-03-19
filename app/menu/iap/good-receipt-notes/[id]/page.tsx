"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { GRNStatus } from "@/enums/grnStatus";
import {
  IBaseApiResponse,
  IGoodReceiptNote,
  IPurchaseRequest,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";

const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface FormValues {
  grnNumber: string;
  supplier: string;
  receivedBy: string;
  receivedDate: Date | null;
  receivingFacility: string;
}

interface EditableGrnItem {
  lineItemNo: number;
  prItemId: number;
  itemName: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  uoM: string;
  unitPrice: number;
  currency: string;
  remarks: string;
}

interface AddLineItemOption {
  prItemId: number;
  itemName: string;
  uoM: string;
  unitPrice: number;
  currency: string;
  requestedQuantity: number;
}

const tableStyle = { minWidth: "64rem" };

export default function EditGoodReceiptNotePage() {
  const params = useParams<{ id: string }>();
  const toastRef = useToastRef();

  const requestId = useMemo(() => params?.id ?? "", [params?.id]);
  const numericRequestId = useMemo(() => Number(requestId), [requestId]);

  const patchMutation = usePatchQuery({
    redirectPath: "/menu/iap/good-receipt-notes",
    successMessage: "Good receipt note updated successfully!",
    toastRef,
  });

  const {
    data: goodReceiptResponse,
    isLoading: isGoodReceiptLoading,
    isFetching: isGoodReceiptFetching,
  } = useGetQuery<IBaseApiResponse<IGoodReceiptNote>, undefined>(
    ["goodReceiptNoteById", requestId],
    `/GoodReceiptNotes/${requestId}`,
    undefined,
    {
      enabled: !!requestId,
      toastRef,
    },
  );

  const goodReceipt = goodReceiptResponse?.data;

  const purchaseRequestId = goodReceipt?.purchaseRequestId;

  const { data: purchaseRequestResponse } = useGetQuery<
    IBaseApiResponse<IPurchaseRequest>,
    undefined
  >(
    ["purchaseRequestForGrnEdit", String(purchaseRequestId ?? "")],
    `/PurchaseRequests/${purchaseRequestId}`,
    undefined,
    {
      enabled: !!purchaseRequestId,
      toastRef,
    },
  );

  const initialValues: FormValues = {
    grnNumber: goodReceipt?.grnNumber ?? "",
    supplier: goodReceipt?.supplier ?? "",
    receivedBy: goodReceipt?.receivedBy ?? "",
    receivedDate: goodReceipt?.receivedDate
      ? new Date(goodReceipt.receivedDate)
      : null,
    receivingFacility: goodReceipt?.receivedFacility ?? "",
  };

  const initialLineItems = useMemo<EditableGrnItem[]>(() => {
    const items = goodReceipt?.items ?? [];

    return items.map((item, index) => {
      const purchaseRequestItem = item.purchaseRequestItem;
      const inventoryItem = purchaseRequestItem?.inventoryItem;

      return {
        lineItemNo: item.lineItemNo ?? index + 1,
        prItemId: Number(item.prItemId ?? purchaseRequestItem?.id ?? 0),
        itemName: inventoryItem?.itemName ?? "-",
        receivedQuantity: Number(item.receivedQuantity ?? 0),
        acceptedQuantity: Number(item.acceptedQuantity ?? 0),
        rejectedQuantity: Number(item.rejectedQuantity ?? 0),
        uoM: inventoryItem?.uoM ?? "-",
        unitPrice: Number(
          purchaseRequestItem?.price ?? inventoryItem?.unitPrice ?? 0,
        ),
        currency: inventoryItem?.currency ?? "-",
        remarks: "",
      };
    });
  }, [goodReceipt]);

  const [lineItems, setLineItems] = useState<EditableGrnItem[]>([]);
  const [selectedAddPrItemId, setSelectedAddPrItemId] = useState("");
  const [addReceivedQuantity, setAddReceivedQuantity] = useState("");
  const [addAcceptedQuantity, setAddAcceptedQuantity] = useState("");
  const [addRejectedQuantity, setAddRejectedQuantity] = useState("");
  const [addRemarks, setAddRemarks] = useState("");

  useEffect(() => {
    setLineItems(initialLineItems);
  }, [initialLineItems]);

  const addLineItemOptions = useMemo<AddLineItemOption[]>(() => {
    const prItems = purchaseRequestResponse?.data?.prItems ?? [];

    return prItems
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        prItemId: Number(item.id),
        itemName: item.inventoryItem?.itemName ?? "Item",
        uoM: item.inventoryItem?.uoM ?? item.inventoryItem?.uom ?? "-",
        unitPrice: Number(item.price ?? item.inventoryItem?.unitPrice ?? 0),
        currency: item.inventoryItem?.currency ?? "-",
        requestedQuantity: Number(item.requestedQuantity ?? 0),
      }));
  }, [purchaseRequestResponse]);

  const selectedAddLineItem = useMemo(() => {
    return addLineItemOptions.find(
      (item) => String(item.prItemId) === selectedAddPrItemId,
    );
  }, [addLineItemOptions, selectedAddPrItemId]);

  const resetAddLineForm = () => {
    setSelectedAddPrItemId("");
    setAddReceivedQuantity("");
    setAddAcceptedQuantity("");
    setAddRejectedQuantity("");
    setAddRemarks("");
  };

  const handleAddLineItem = () => {
    if (!selectedAddLineItem) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select an item to add.",
        life: 3000,
      });
      return;
    }

    const receivedQuantity = Math.max(0, Number(addReceivedQuantity) || 0);
    const acceptedQuantity = Math.max(0, Number(addAcceptedQuantity) || 0);
    const rejectedQuantity = Math.max(0, Number(addRejectedQuantity) || 0);

    if (receivedQuantity <= 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Received quantity must be greater than zero.",
        life: 3000,
      });
      return;
    }

    if (acceptedQuantity > receivedQuantity) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Accepted quantity cannot be more than received quantity.",
        life: 3000,
      });
      return;
    }

    if (rejectedQuantity > receivedQuantity) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Rejected quantity cannot be more than received quantity.",
        life: 3000,
      });
      return;
    }

    const newLine: EditableGrnItem = {
      lineItemNo: lineItems.length + 1,
      prItemId: selectedAddLineItem.prItemId,
      itemName: selectedAddLineItem.itemName,
      receivedQuantity,
      acceptedQuantity,
      rejectedQuantity,
      uoM: selectedAddLineItem.uoM,
      unitPrice: selectedAddLineItem.unitPrice,
      currency: selectedAddLineItem.currency,
      remarks: addRemarks.trim(),
    };

    setLineItems((prev) => [...prev, newLine]);
    resetAddLineForm();
  };

  const updateLineItemField = useCallback(
    (
      lineItemNo: number,
      field:
        | "receivedQuantity"
        | "acceptedQuantity"
        | "rejectedQuantity"
        | "remarks",
      value: string,
    ) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.lineItemNo !== lineItemNo) {
            return item;
          }

          if (field === "remarks") {
            return { ...item, remarks: value };
          }

          return {
            ...item,
            [field]: Math.max(0, Number(value) || 0),
          };
        }),
      );
    },
    [],
  );

  const removeLineItem = useCallback((lineItemNo: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.lineItemNo !== lineItemNo);
      return filtered.map((item, idx) => ({ ...item, lineItemNo: idx + 1 }));
    });
  }, []);

  const validateLineItems = () => {
    if (lineItems.length === 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "At least one GRN item is required.",
        life: 3000,
      });
      return false;
    }

    const hasInvalidLine = lineItems.some(
      (item) =>
        item.receivedQuantity < 0 ||
        item.acceptedQuantity < 0 ||
        item.rejectedQuantity < 0 ||
        item.acceptedQuantity > item.receivedQuantity ||
        item.rejectedQuantity > item.receivedQuantity,
    );

    if (hasInvalidLine) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail:
          "Accepted and rejected quantities must be non-negative and cannot exceed received quantity.",
        life: 3500,
      });
      return false;
    }

    return true;
  };

  const renderReceivedQuantityInput = (row: EditableGrnItem) => {
    return (
      <input
        type="number"
        min={0}
        className="form-control !py-1 !text-sm w-24"
        value={row.receivedQuantity}
        onChange={(event) =>
          updateLineItemField(
            row.lineItemNo,
            "receivedQuantity",
            event.target.value,
          )
        }
      />
    );
  };

  const renderAcceptedQuantityInput = (row: EditableGrnItem) => {
    return (
      <input
        type="number"
        min={0}
        max={row.receivedQuantity}
        className="form-control !py-1 !text-sm w-24"
        value={row.acceptedQuantity}
        onChange={(event) =>
          updateLineItemField(
            row.lineItemNo,
            "acceptedQuantity",
            event.target.value,
          )
        }
      />
    );
  };

  const renderRejectedQuantityInput = (row: EditableGrnItem) => {
    return (
      <input
        type="number"
        min={0}
        max={row.receivedQuantity}
        className="form-control !py-1 !text-sm w-24"
        value={row.rejectedQuantity}
        onChange={(event) =>
          updateLineItemField(
            row.lineItemNo,
            "rejectedQuantity",
            event.target.value,
          )
        }
      />
    );
  };

  const renderRemarksInput = (row: EditableGrnItem) => {
    return (
      <input
        type="text"
        className="form-control !py-1 !text-sm w-32"
        value={row.remarks}
        onChange={(event) =>
          updateLineItemField(row.lineItemNo, "remarks", event.target.value)
        }
      />
    );
  };

  const renderRemoveAction = (row: EditableGrnItem) => {
    return (
      <button
        type="button"
        className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
        onClick={() => removeLineItem(row.lineItemNo)}
      >
        Remove
      </button>
    );
  };

  const patchWithStatus = (values: FormValues, grnStatus: GRNStatus) => {
    if (!requestId || Number.isNaN(numericRequestId)) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Invalid GRN id.",
        life: 3000,
      });
      return;
    }

    if (!values.receivedBy.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Received By is required.",
        life: 3000,
      });
      return;
    }

    if (!values.receivingFacility.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Receiving Facility is required.",
        life: 3000,
      });
      return;
    }

    if (!validateLineItems()) {
      return;
    }

    patchMutation.mutate({
      url: `/GoodReceiptNotes/${requestId}`,
      body: {
        id: numericRequestId,
        receivedBy: values.receivedBy.trim(),
        receivedDate: values.receivedDate
          ? new Date(values.receivedDate).toISOString()
          : new Date().toISOString(),
        receivingFacility: values.receivingFacility.trim(),
        grnStatus,
        items: lineItems.map((item) => ({
          prItemId: item.prItemId,
          lineItemNo: item.lineItemNo,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          totalPrice: item.acceptedQuantity * item.unitPrice,
          remarks: item.remarks || "",
        })),
      },
    });
  };

  const isInitialLoading =
    (isGoodReceiptLoading || isGoodReceiptFetching) && !goodReceipt;

  if (isInitialLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading GRN...</div>;
  }

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      enableReinitialize
      onSubmit={() => {
        // Button-driven actions control submit status.
      }}
    >
      {({ values, resetForm }) => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl space-y-6">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Update Good Receipt Note
            </h1>

            <h2 className="text-base font-bold text-gray-800 mb-2">
              GRN Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <LabelGroup
                name="grnNumber"
                id="grnNumber"
                label="GRN Number"
                type="text"
                disabled
              />
              <LabelGroup
                name="supplier"
                id="supplier"
                label="Supplier"
                type="text"
                disabled
              />
              <LabelGroup
                name="receivedBy"
                id="receivedBy"
                label="Received By*"
                type="text"
              />
              <DatePicker
                name="receivedDate"
                id="receivedDate"
                label="Received Date"
                placeholder="Select Date"
              />
              <LabelGroup
                name="receivingFacility"
                id="receivingFacility"
                label="Receiving Facility*"
                type="text"
              />
            </div>

            <h2 className="text-base font-bold text-black">Line Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                <label className="form-label" htmlFor="addLineItemSelect">
                  Item*
                </label>
                <select
                  id="addLineItemSelect"
                  className="form-control"
                  value={selectedAddPrItemId}
                  onChange={(event) => {
                    const selectedValue = event.target.value;
                    setSelectedAddPrItemId(selectedValue);

                    const selectedItem = addLineItemOptions.find(
                      (item) => String(item.prItemId) === selectedValue,
                    );

                    if (selectedItem) {
                      const quantity = String(selectedItem.requestedQuantity);
                      setAddReceivedQuantity(quantity);
                      setAddAcceptedQuantity(quantity);
                      setAddRejectedQuantity("0");
                    }
                  }}
                >
                  <option value="">Select item</option>
                  {addLineItemOptions.map((item) => (
                    <option key={item.prItemId} value={String(item.prItemId)}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
              </div>

              <LabelGroup
                name="addReceivedQuantity"
                id="addReceivedQuantity"
                label="Received Quantity*"
                type="number"
                min={0}
                value={addReceivedQuantity}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAddReceivedQuantity(event.target.value)
                }
              />

              <LabelGroup
                name="addAcceptedQuantity"
                id="addAcceptedQuantity"
                label="Accepted Quantity*"
                type="number"
                min={0}
                max={
                  addReceivedQuantity === ""
                    ? undefined
                    : Number(addReceivedQuantity)
                }
                value={addAcceptedQuantity}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAddAcceptedQuantity(event.target.value)
                }
              />

              <LabelGroup
                name="addRejectedQuantity"
                id="addRejectedQuantity"
                label="Rejected Quantity*"
                type="number"
                min={0}
                max={
                  addReceivedQuantity === ""
                    ? undefined
                    : Number(addReceivedQuantity)
                }
                value={addRejectedQuantity}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAddRejectedQuantity(event.target.value)
                }
              />

              <LabelGroup
                name="addUoM"
                id="addUoM"
                label="UoM"
                type="text"
                value={selectedAddLineItem?.uoM ?? ""}
                disabled
              />

              <LabelGroup
                name="addUnitPrice"
                id="addUnitPrice"
                label="Unit Price"
                type="number"
                value={selectedAddLineItem?.unitPrice ?? ""}
                disabled
              />

              <LabelGroup
                name="addCurrency"
                id="addCurrency"
                label="Currency"
                type="text"
                value={selectedAddLineItem?.currency ?? ""}
                disabled
              />

              <div className="md:col-span-2 lg:col-span-2">
                <div className="mb-3 label text-xs xs:text-sm sm:text-base">
                  <label className="form-label" htmlFor="addLineRemarks">
                    Remarks
                  </label>
                  <textarea
                    id="addLineRemarks"
                    className="form-control"
                    rows={2}
                    value={addRemarks}
                    onChange={(event) => setAddRemarks(event.target.value)}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                id="addGrnLineBtn"
                text="Add Line"
                type="button"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={handleAddLineItem}
              />
              <Button
                id="clearGrnLineBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={resetAddLineForm}
              />
            </div>

            <DataTable
              value={lineItems}
              emptyMessage="No items found"
              stripedRows
              size="small"
              scrollable
              tableStyle={tableStyle}
            >
              <Column field="lineItemNo" header="Line Item No" />
              <Column field="itemName" header="Item" />
              <Column
                header="Received Quantity"
                body={renderReceivedQuantityInput}
              />
              <Column
                header="Accepted Quantity"
                body={renderAcceptedQuantityInput}
              />
              <Column
                header="Rejected Quantity"
                body={renderRejectedQuantityInput}
              />
              <Column field="uoM" header="UoM" />
              <Column
                header="Unit Price"
                body={(row: EditableGrnItem) => row.unitPrice.toFixed(2)}
              />
              <Column field="currency" header="Currency" />
              <Column
                header="Total Price"
                body={(row: EditableGrnItem) =>
                  (row.acceptedQuantity * row.unitPrice).toFixed(2)
                }
              />
              <Column header="Remarks" body={renderRemarksInput} />
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
                id="reset-grn-update-btn"
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
                id="save-grn-draft-btn"
                text="Save as Draft"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => patchWithStatus(values, GRNStatus.Draft)}
              />
              <Button
                id="post-grn-btn"
                text="Post"
                type="button"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!patchMutation.isPending}
                disabled={patchMutation.isPending}
                onClick={() => patchWithStatus(values, GRNStatus.Posted)}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
