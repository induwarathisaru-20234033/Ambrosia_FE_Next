"use client";

import { Field, Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useToastRef } from "@/contexts/ToastContext";
import { IBaseApiResponse, IPurchaseRequest } from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { usePatchQuery } from "@/services/queries/patchQuery";

const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface FormValues {
  requisionCode: string;
  description: string;
  supplier: string;
  requester: string;
  requestedDeliveryDate: Date | null;
  urgent: string;
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

const reviewQuantityBody = (row: MaterialLineItem) => {
  return (
    <input
      type="number"
      min={0}
      step="any"
      className="form-control !py-1 !text-sm w-20"
      value={row.quantity}
      disabled
      readOnly
    />
  );
};

const reviewUnitPriceBody = (row: MaterialLineItem) => {
  return row.unitPrice.toFixed(2);
};

const reviewTotalPriceBody = (row: MaterialLineItem) => {
  return (row.quantity * row.unitPrice).toFixed(2);
};

const reviewTableStyle = { minWidth: "50rem" };

const urgentOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export default function ReviewPurchaseRequestsPage() {
  const params = useParams<{ id: string }>();
  const toastRef = useToastRef();
  const requestId = useMemo(() => params?.id ?? "", [params?.id]);

  const approveMutation = usePatchQuery({
    redirectPath: "/menu/iap/purchase-requests",
    invalidateKey: ["purchaseRequests"],
    successMessage: "Purchase request approved successfully!",
    toastRef,
  });

  const rejectMutation = usePatchQuery({
    redirectPath: "/menu/iap/purchase-requests",
    invalidateKey: ["purchaseRequests"],
    successMessage: "Purchase request rejected successfully!",
    toastRef,
  });

  const {
    data: purchaseRequestResponse,
    isLoading,
    isFetching,
  } = useGetQuery<IBaseApiResponse<IPurchaseRequest>, undefined>(
    ["getPurchaseRequest", requestId],
    `/PurchaseRequests/${requestId}`,
    undefined,
    {
      enabled: !!requestId,
      toastRef,
    },
  );

  const purchaseRequestData = purchaseRequestResponse?.data;

  const lineItems = useMemo<MaterialLineItem[]>(() => {
    if (!purchaseRequestData?.prItems?.length) {
      return [];
    }

    return purchaseRequestData.prItems.map((item, idx) => ({
      lineNo: item.lineItemNo ?? idx + 1,
      itemNumber:
        item.inventoryItem?.itemNumber ||
        (item.inventoryItemId ? String(item.inventoryItemId) : "-"),
      itemName: item.inventoryItem?.itemName || "-",
      itemCategory: item.inventoryItem?.itemCategory || "-",
      quantity: Number(item.requestedQuantity ?? 0),
      uoM: item.inventoryItem?.uoM || item.inventoryItem?.uom || "-",
      unitPrice: Number(item.price ?? 0),
    }));
  }, [purchaseRequestData]);

  const isInitialLoading = (isLoading || isFetching) && !purchaseRequestData;

  if (isInitialLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading request...</div>;
  }

  const initialValues: FormValues = {
    requisionCode: purchaseRequestData?.purchaseRequestCode ?? requestId,
    description: purchaseRequestData?.description ?? "",
    supplier: purchaseRequestData?.supplier ?? "",
    requester: purchaseRequestData?.requestedBy ?? "",
    requestedDeliveryDate: purchaseRequestData?.requestedDeliveryDate
      ? new Date(purchaseRequestData.requestedDeliveryDate)
      : null,
    urgent: purchaseRequestData?.isUrgent ? "Yes" : "No",
  };

  const handleApprove = () => {
    if (!requestId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to approve because request id is unavailable.",
        life: 3000,
      });
      return;
    }

    approveMutation.mutate({
      url: `/PurchaseRequests/${requestId}/approve`,
      body: {},
    });
  };

  const handleReject = () => {
    if (!requestId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to reject because request id is unavailable.",
        life: 3000,
      });
      return;
    }

    rejectMutation.mutate({
      url: `/PurchaseRequests/${requestId}/reject`,
      body: {},
    });
  };

  const isActionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={() => {
        // Review actions are handled via button click handlers.
      }}
    >
      {() => (
        <Form className="p-3 sm:p-6">
          <div className="max-w-7xl">
            <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
              Review Purchase Request
            </h1>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Requision Details
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <LabelGroup
                  label="Requision Number"
                  name="requisionCode"
                  type="text"
                  placeholder=""
                  id="requisionCode"
                  disabled={true}
                />

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
                      rows={3}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <LabelGroup
                  label="Supplier"
                  name="supplier"
                  type="text"
                  placeholder=""
                  id="supplier"
                  disabled={true}
                />

                <LabelGroup
                  label="Requester"
                  name="requester"
                  type="text"
                  placeholder=""
                  id="requester"
                  disabled={true}
                />

                <DatePicker
                  name="requestedDeliveryDate"
                  id="requestedDeliveryDate"
                  label="Requested Delivery Date"
                  placeholder="Select Date"
                  disabled={true}
                />

                <Dropdown
                  name="urgent"
                  id="urgent"
                  label="Urgent"
                  placeholder="Select Urgent Status"
                  options={urgentOptions}
                  disabled={true}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-2">
                Materials
              </h2>
              <hr className="mb-4 border-gray-300" />

              <div className="mt-6">
                <DataTable
                  value={lineItems}
                  emptyMessage="No items added yet"
                  stripedRows
                  size="small"
                  tableStyle={reviewTableStyle}
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
                    body={reviewQuantityBody}
                  />
                  <Column field="uoM" header="UoM" />
                  <Column
                    header="Unit Price"
                    style={{ textAlign: "right" }}
                    body={reviewUnitPriceBody}
                  />
                  <Column
                    header="Total Price"
                    style={{ textAlign: "right", maxWidth: "8rem" }}
                    body={reviewTotalPriceBody}
                  />
                </DataTable>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button
                id="reject-purchase-request-btn"
                text="Reject"
                type="button"
                className="bg-[#DC2626] text-white mr-2 p-[12px] rounded-xl box-shadow w-full"
                state={!isActionPending}
                disabled={isActionPending}
                onClick={handleReject}
              />
              <Button
                id="approve-purchase-request-btn"
                text="Approve"
                type="button"
                className="bg-[#15B097] text-white p-[12px] rounded-xl box-shadow w-full"
                state={!isActionPending}
                disabled={isActionPending}
                onClick={handleApprove}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
