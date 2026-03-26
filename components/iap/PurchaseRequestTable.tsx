"use client";

import { useState } from "react";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Column } from "primereact/column";
import { Sidebar } from "primereact/sidebar";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IBaseApiResponse,
  IPaginatedApiResponse,
  IPurchaseRequest,
  IPurchaseRequestListParams,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { PurchaseRequestStatus } from "@/enums/purchaseRequestStatus";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const TableSkeleton = dynamic(
  () => import("@/components/skeletons/TableSkeleton"),
  { ssr: false },
);

const resolveStatusLabel = (status: number | null | undefined) => {
  if (status === PurchaseRequestStatus.ApprovalPending) {
    return "Approval Pending";
  }

  if (status === PurchaseRequestStatus.Approved) {
    return "Approved";
  }

  if (status === PurchaseRequestStatus.Rejected) {
    return "Rejected";
  }

  return "Unknown";
};

const isApprovalPending = (status: number | null | undefined) => {
  return status === PurchaseRequestStatus.ApprovalPending;
};

const isFinalizedStatus = (status: number | null | undefined) => {
  return (
    status === PurchaseRequestStatus.Approved ||
    status === PurchaseRequestStatus.Rejected
  );
};

const statusFilterOptions = [
  { label: "Approval Pending", value: PurchaseRequestStatus.ApprovalPending },
  { label: "Approved", value: PurchaseRequestStatus.Approved },
  { label: "Rejected", value: PurchaseRequestStatus.Rejected },
];

const formatLocalDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
};

const resolveRequestId = (request: IPurchaseRequest): string | null => {
  if (request.id !== undefined && request.id !== null) {
    return String(request.id);
  }

  if (request.purchaseRequestCode) {
    return request.purchaseRequestCode;
  }

  return null;
};

const resolveStatusClass = (status: number | null | undefined) => {
  if (status === PurchaseRequestStatus.Approved) {
    return "bg-green-100 text-green-700";
  }

  if (status === PurchaseRequestStatus.Rejected) {
    return "!bg-red-100  !text-red-700";
  }

  if (status === PurchaseRequestStatus.ApprovalPending) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-gray-100 text-gray-700";
};

const requestedDeliveryDateBody = (rowData: IPurchaseRequest) =>
  formatLocalDate(rowData.requestedDeliveryDate);

const requestedDateBody = (rowData: IPurchaseRequest) =>
  formatLocalDate(rowData.createdDate);

const createdDateBody = (rowData: IPurchaseRequest) =>
  formatLocalDate(rowData.createdDate);

const formatLocalDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const sideSheetTableStyle = { minWidth: "42rem" };

interface PurchaseRequestDetailLineItem {
  lineNo: number;
  itemNumber: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  uoM: string;
  unitPrice: number;
}

const detailQuantityBody = (row: PurchaseRequestDetailLineItem) => {
  return (
    <input
      type="number"
      min={0}
      className="form-control !py-1 !text-sm w-20"
      value={row.quantity}
      disabled
      readOnly
    />
  );
};

const detailUnitPriceBody = (row: PurchaseRequestDetailLineItem) => {
  return row.unitPrice.toFixed(2);
};

const detailTotalPriceBody = (row: PurchaseRequestDetailLineItem) => {
  return (row.quantity * row.unitPrice).toFixed(2);
};

const renderDetailItem = (label: string, value: string) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value || "-"}</span>
    </div>
  );
};

const getDateBoundaryIsoString = (date: Date, boundary: "start" | "end") => {
  const localDate = new Date(date);

  if (boundary === "start") {
    localDate.setHours(0, 0, 0, 0);
  } else {
    localDate.setHours(23, 59, 59, 999);
  }

  return localDate.toISOString();
};

const mapFiltersToQueryParams = (filters: IPurchaseRequestListParams) => {
  const fromDate = filters.createdDateFrom
    ? new Date(filters.createdDateFrom)
    : null;
  const toDate = filters.createdDateTo ? new Date(filters.createdDateTo) : null;

  return {
    ...filters,
    purchaseRequestCode: filters.purchaseRequestCode?.trim() || "",
    supplier: filters.supplier?.trim() || "",
    requestedBy: filters.requestedBy?.trim() || "",
    purchaseRequestStatus: filters.purchaseRequestStatus,
    createdDateFrom:
      fromDate && !Number.isNaN(fromDate.getTime())
        ? getDateBoundaryIsoString(fromDate, "start")
        : undefined,
    createdDateTo:
      toDate && !Number.isNaN(toDate.getTime())
        ? getDateBoundaryIsoString(toDate, "end")
        : undefined,
  };
};

const renderStatus = (rowData: IPurchaseRequest) => {
  const statusValue = rowData.purchaseRequestStatus;
  const statusLabel = resolveStatusLabel(statusValue);
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resolveStatusClass(statusValue)}`}
    >
      {statusLabel}
    </span>
  );
};

export default function PurchaseRequestTable() {
  const router = useRouter();
  const toastRef = useToastRef();

  const initialFilters: IPurchaseRequestListParams = {
    pageNumber: 1,
    pageSize: 10,
    purchaseRequestCode: "",
    supplier: "",
    requestedBy: "",
    purchaseRequestStatus: undefined,
    createdDateFrom: undefined,
    createdDateTo: undefined,
  };

  const [filters, setFilters] = useState<IPurchaseRequestListParams>({
    ...initialFilters,
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const queryParams = mapFiltersToQueryParams(filters);

  const {
    data: selectedPurchaseRequestResponse,
    isLoading: isSelectedRequestLoading,
    isFetching: isSelectedRequestFetching,
  } = useGetQuery<IBaseApiResponse<IPurchaseRequest>, undefined>(
    ["purchaseRequestDetails", selectedRequestId ?? ""],
    `/PurchaseRequests/${selectedRequestId}`,
    undefined,
    {
      enabled: !!selectedRequestId,
      toastRef,
    },
  );

  const { data: purchaseRequestsData, isLoading } = useGetQuery<
    IPaginatedApiResponse<IPurchaseRequest>,
    IPurchaseRequestListParams
  >(
    ["purchaseRequests", JSON.stringify(queryParams)],
    "/PurchaseRequests",
    queryParams,
    { toastRef },
  );

  const rows = purchaseRequestsData?.data?.items ?? [];
  const totalRecords =
    purchaseRequestsData?.data?.totalItemCount ?? rows.length;
  const selectedPurchaseRequest = selectedPurchaseRequestResponse?.data;
  const selectedDetailLineItems: PurchaseRequestDetailLineItem[] =
    selectedPurchaseRequest?.prItems?.map((item, idx) => ({
      lineNo: item.lineItemNo ?? idx + 1,
      itemNumber: item.inventoryItem?.itemNumber ?? "-",
      itemName: item.inventoryItem?.itemName ?? "-",
      itemCategory: item.inventoryItem?.itemCategory ?? "-",
      quantity: Number(item.requestedQuantity ?? 0),
      uoM: item.inventoryItem?.uoM ?? "-",
      unitPrice: Number(item.price ?? 0),
    })) ?? [];
  const selectedDetailTotalPrice = selectedDetailLineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const onPage = (event: DataTablePageEvent) => {
    const currentPageIndex = event.page ?? 0;

    setFilters((prev) => ({
      ...prev,
      pageNumber: currentPageIndex + 1,
      pageSize: event.rows,
    }));
  };

  const handleFilter = (values: IPurchaseRequestListParams) => {
    setFilters((prev) => ({
      ...prev,
      purchaseRequestCode: values.purchaseRequestCode || "",
      supplier: values.supplier || "",
      requestedBy: values.requestedBy || "",
      purchaseRequestStatus: values.purchaseRequestStatus,
      createdDateFrom: values.createdDateFrom,
      createdDateTo: values.createdDateTo,
      pageNumber: 1,
    }));
  };

  const navigateWithId = (request: IPurchaseRequest, path: string) => {
    const requestId = resolveRequestId(request);
    if (!requestId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to proceed because request id is unavailable.",
        life: 3000,
      });
      return;
    }

    router.push(path.replace(":id", requestId));
  };

  const openViewMoreSheet = (request: IPurchaseRequest) => {
    const requestId = resolveRequestId(request);
    if (!requestId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to open details because request id is unavailable.",
        life: 3000,
      });
      return;
    }

    setSelectedRequestId(requestId);
  };

  const closeViewMoreSheet = () => {
    setSelectedRequestId(null);
  };

  let sideSheetContent: React.ReactNode;

  if (isSelectedRequestLoading || isSelectedRequestFetching) {
    sideSheetContent = (
      <div className="text-sm text-gray-600">Loading details...</div>
    );
  } else if (selectedPurchaseRequest) {
    sideSheetContent = (
      <Accordion multiple activeIndex={[0, 1]}>
        <AccordionTab header="Main Details">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {renderDetailItem(
              "Requisition ID",
              selectedPurchaseRequest.purchaseRequestCode ?? "-",
            )}
            {renderDetailItem(
              "Description",
              selectedPurchaseRequest.description ?? "-",
            )}
            {renderDetailItem(
              "Requested By",
              selectedPurchaseRequest.requestedBy ?? "-",
            )}
            {renderDetailItem(
              "Requested Date",
              formatLocalDateTime(selectedPurchaseRequest.createdDate),
            )}
            {renderDetailItem(
              "Approved By",
              selectedPurchaseRequest.purchaseRequestStatus ===
                PurchaseRequestStatus.Approved
                ? (selectedPurchaseRequest.reviewedBy ?? "-")
                : "-",
            )}
            {renderDetailItem(
              "Approved Date",
              selectedPurchaseRequest.purchaseRequestStatus ===
                PurchaseRequestStatus.Approved
                ? formatLocalDateTime(selectedPurchaseRequest.reviewedDate)
                : "-",
            )}
            {renderDetailItem(
              "Rejected By",
              selectedPurchaseRequest.purchaseRequestStatus ===
                PurchaseRequestStatus.Rejected
                ? (selectedPurchaseRequest.reviewedBy ?? "-")
                : "-",
            )}
            {renderDetailItem(
              "Rejected Date",
              selectedPurchaseRequest.purchaseRequestStatus ===
                PurchaseRequestStatus.Rejected
                ? formatLocalDateTime(selectedPurchaseRequest.reviewedDate)
                : "-",
            )}
          </div>
        </AccordionTab>
        <AccordionTab header="Materials">
          <div className="space-y-4">
            <DataTable
              value={selectedDetailLineItems}
              emptyMessage="No items added yet"
              stripedRows
              size="small"
              tableStyle={sideSheetTableStyle}
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
                body={detailQuantityBody}
              />
              <Column field="uoM" header="UoM" />
              <Column
                header="Unit Price"
                style={{ textAlign: "right" }}
                body={detailUnitPriceBody}
              />
              <Column
                header="Total Price"
                style={{ textAlign: "right", maxWidth: "8rem" }}
                body={detailTotalPriceBody}
              />
            </DataTable>

            <div className="flex justify-end border-t border-gray-200 pt-4">
              <div className="flex items-center gap-4 text-sm font-semibold text-gray-900">
                <span>Total Price</span>
                <span>{selectedDetailTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    );
  } else {
    sideSheetContent = (
      <div className="text-sm text-gray-600">No detail found.</div>
    );
  }

  const renderActions = (rowData: IPurchaseRequest) => {
    const isFinalized = isFinalizedStatus(rowData.purchaseRequestStatus);
    const actionButtonsDisabled = isFinalized;

    return (
      <div className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap min-w-max">
        <button
          type="button"
          className="bg-[#15B097] text-white py-1 px-3 rounded-md hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={actionButtonsDisabled}
          onClick={() =>
            navigateWithId(rowData, "/menu/iap/purchase-requests/:id")
          }
        >
          Update
        </button>
        <button
          type="button"
          className="bg-[#15B097] text-white py-1 px-3 rounded-md hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={actionButtonsDisabled}
          onClick={() =>
            navigateWithId(
              rowData,
              "/menu/iap/purchase-requests/:id/review?action=approve",
            )
          }
        >
          Approve
        </button>
        <button
          type="button"
          className="bg-[#DC2626] text-white py-1 px-3 rounded-md hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={actionButtonsDisabled}
          onClick={() =>
            navigateWithId(
              rowData,
              "/menu/iap/purchase-requests/:id/review?action=reject",
            )
          }
        >
          Reject
        </button>
        <button
          type="button"
          className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md"
          onClick={() => openViewMoreSheet(rowData)}
        >
          View More
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Sidebar
        visible={Boolean(selectedRequestId)}
        onHide={closeViewMoreSheet}
        position="right"
        showCloseIcon
        dismissable
        className="!w-[min(96vw,880px)]"
        header={
          <div className="w-full text-[28px] font-medium text-[#15B097]">
            More Information
          </div>
        }
      >
        <div className="space-y-6 border-t border-[#E5E7EB] pt-6">
          {sideSheetContent}
        </div>
      </Sidebar>

      <Formik<IPurchaseRequestListParams>
        initialValues={filters}
        enableReinitialize
        onSubmit={handleFilter}
      >
        {({ resetForm }) => (
          <Form>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <LabelGroup
                label="Requision Number"
                name="purchaseRequestCode"
                type="text"
                placeholder="Requision Number"
                id="filterRequisionNumber"
                disabled={false}
              />
              <LabelGroup
                label="Supplier"
                name="supplier"
                type="text"
                placeholder="Supplier"
                id="filterSupplier"
                disabled={false}
              />
              <LabelGroup
                label="Requester"
                name="requestedBy"
                type="text"
                placeholder="Requester"
                id="filterRequester"
                disabled={false}
              />
              <Dropdown
                name="purchaseRequestStatus"
                id="filterPrStatus"
                label="Status"
                placeholder="Select Status"
                options={statusFilterOptions}
                showClearOption
              />
              <DatePicker
                name="createdDateFrom"
                id="filterCreatedDateFrom"
                label="Created Date From"
                placeholder="Select From Date"
              />
              <DatePicker
                name="createdDateTo"
                id="filterCreatedDateTo"
                label="Created Date To"
                placeholder="Select To Date"
              />
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                id="filterPurchaseRequestBtn"
                text="Filter"
                type="submit"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
              />
              <Button
                id="clearPurchaseRequestFilterBtn"
                text="Clear"
                type="button"
                className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
                state={true}
                onClick={() => {
                  resetForm({ values: initialFilters });
                  setFilters(initialFilters);
                }}
              />
            </div>
          </Form>
        )}
      </Formik>

      {isLoading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <DataTable
          value={rows}
          stripedRows
          paginator
          lazy
          first={(filters.pageNumber - 1) * filters.pageSize}
          rows={filters.pageSize}
          totalRecords={totalRecords}
          onPage={onPage}
          rowsPerPageOptions={[10, 20, 50]}
          emptyMessage="No purchase requests found"
        >
          <Column field="purchaseRequestCode" header="Requision Number" />
          <Column field="description" header="Description" />
          <Column field="requestedBy" header="Requester" />
          <Column
            header="Requested Delivery Date"
            body={requestedDeliveryDateBody}
          />
          <Column header="Requested Date" body={requestedDateBody} />
          <Column header="Created Date" body={createdDateBody} />
          <Column header="PR Status" body={renderStatus} />
          <Column header="" body={renderActions} />
        </DataTable>
      )}
    </div>
  );
}
