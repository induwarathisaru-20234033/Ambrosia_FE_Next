"use client";

import { useState } from "react";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IGoodReceiptNote,
  IGoodReceiptNoteListParams,
  IPaginatedApiResponse,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";
import { GRNStatus } from "@/enums/grnStatus";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const Dropdown = dynamic(() => import("@/components/Dropdown"), { ssr: false });
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

const statusFilterOptions = [
  { label: "Posted", value: GRNStatus.Posted },
  { label: "Draft", value: GRNStatus.Draft },
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

const getDateBoundaryIsoString = (date: Date, boundary: "start" | "end") => {
  const localDate = new Date(date);

  if (boundary === "start") {
    localDate.setHours(0, 0, 0, 0);
  } else {
    localDate.setHours(23, 59, 59, 999);
  }

  return localDate.toISOString();
};

const mapFiltersToQueryParams = (filters: IGoodReceiptNoteListParams) => {
  const fromDate = filters.receivedDateFrom
    ? new Date(filters.receivedDateFrom)
    : null;
  const toDate = filters.receivedDateTo
    ? new Date(filters.receivedDateTo)
    : null;

  return {
    ...filters,
    gRNNumber: filters.gRNNumber?.trim() || "",
    supplier: filters.supplier?.trim() || "",
    receivedBy: filters.receivedBy?.trim() || "",
    grnStatus: filters.grnStatus,
    receivedDateFrom:
      fromDate && !Number.isNaN(fromDate.getTime())
        ? getDateBoundaryIsoString(fromDate, "start")
        : undefined,
    receivedDateTo:
      toDate && !Number.isNaN(toDate.getTime())
        ? getDateBoundaryIsoString(toDate, "end")
        : undefined,
  };
};

const resolveStatusLabel = (status: number | null | undefined) => {
  if (status === GRNStatus.Posted) {
    return "Posted";
  }

  if (status === GRNStatus.Draft) {
    return "Draft";
  }

  return "Unknown";
};

const resolveStatusClass = (status: number | null | undefined) => {
  if (status === GRNStatus.Posted) {
    return "bg-green-100 text-green-700";
  }

  if (status === GRNStatus.Draft) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-gray-100 text-gray-700";
};

const resolveGrnId = (grn: IGoodReceiptNote): string | null => {
  if (grn.id !== undefined && grn.id !== null) {
    return String(grn.id);
  }

  if (grn.grnNumber) {
    return grn.grnNumber;
  }

  return null;
};

const renderStatus = (rowData: IGoodReceiptNote) => {
  const statusValue = rowData.grnStatus;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${resolveStatusClass(statusValue)}`}
    >
      {resolveStatusLabel(statusValue)}
    </span>
  );
};

export default function GoodReceiptNotesTable() {
  const router = useRouter();
  const toastRef = useToastRef();

  const initialFilters: IGoodReceiptNoteListParams = {
    pageNumber: 1,
    pageSize: 10,
    gRNNumber: "",
    supplier: "",
    receivedBy: "",
    grnStatus: undefined,
    receivedDateFrom: undefined,
    receivedDateTo: undefined,
  };

  const [filters, setFilters] = useState<IGoodReceiptNoteListParams>({
    ...initialFilters,
  });

  const queryParams = mapFiltersToQueryParams(filters);

  const { data: goodReceiptNotesData, isLoading } = useGetQuery<
    IPaginatedApiResponse<IGoodReceiptNote>,
    IGoodReceiptNoteListParams
  >(
    ["goodReceiptNotes", JSON.stringify(queryParams)],
    "/GoodReceiptNotes",
    queryParams,
    { toastRef },
  );

  const rows = goodReceiptNotesData?.data?.items ?? [];
  const totalRecords =
    goodReceiptNotesData?.data?.totalItemCount ?? rows.length;

  const onPage = (event: DataTablePageEvent) => {
    const currentPageIndex = event.page ?? 0;

    setFilters((prev) => ({
      ...prev,
      pageNumber: currentPageIndex + 1,
      pageSize: event.rows,
    }));
  };

  const handleFilter = (values: IGoodReceiptNoteListParams) => {
    setFilters((prev) => ({
      ...prev,
      gRNNumber: values.gRNNumber || "",
      supplier: values.supplier || "",
      receivedBy: values.receivedBy || "",
      grnStatus: values.grnStatus,
      receivedDateFrom: values.receivedDateFrom,
      receivedDateTo: values.receivedDateTo,
      pageNumber: 1,
    }));
  };

  const navigateWithId = (grn: IGoodReceiptNote, path: string) => {
    const grnId = resolveGrnId(grn);

    if (!grnId) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Identifier",
        detail: "Unable to proceed because GRN id is unavailable.",
        life: 3000,
      });
      return;
    }

    router.push(path.replace(":id", grnId));
  };

  const renderActions = (rowData: IGoodReceiptNote) => {
    const isPosted = rowData.grnStatus === GRNStatus.Posted;

    return (
      <div className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap min-w-max">
        <button
          type="button"
          className="bg-[#15B097] text-white py-1 px-3 rounded-md hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={isPosted}
          onClick={() =>
            navigateWithId(rowData, "/menu/iap/good-receipt-notes/:id")
          }
        >
          Update
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Formik<IGoodReceiptNoteListParams>
        initialValues={filters}
        enableReinitialize
        onSubmit={handleFilter}
      >
        {({ resetForm }) => (
          <Form>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <LabelGroup
                label="GRN Number"
                name="grnNumber"
                type="text"
                placeholder="GRN Number"
                id="filterGrnNumber"
                disabled={false}
              />
              <LabelGroup
                label="Supplier"
                name="supplier"
                type="text"
                placeholder="Supplier"
                id="filterGrnSupplier"
                disabled={false}
              />
              <LabelGroup
                label="Received By"
                name="receivedBy"
                type="text"
                placeholder="Received By"
                id="filterGrnReceivedBy"
                disabled={false}
              />
              <Dropdown
                name="grnStatus"
                id="filterGrnStatus"
                label="GRN Status"
                placeholder="Select Status"
                options={statusFilterOptions}
                showClearOption
              />
              <DatePicker
                name="receivedDateFrom"
                id="filterReceivedDateFrom"
                label="Received Date From"
                placeholder="Select From Date"
              />
              <DatePicker
                name="receivedDateTo"
                id="filterReceivedDateTo"
                label="Received Date To"
                placeholder="Select To Date"
              />
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                id="filterGoodReceiptNotesBtn"
                text="Filter"
                type="submit"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
              />
              <Button
                id="clearGoodReceiptNotesFilterBtn"
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

      <DataTable
        value={rows}
        stripedRows
        paginator
        lazy
        loading={isLoading}
        first={(filters.pageNumber - 1) * filters.pageSize}
        rows={filters.pageSize}
        totalRecords={totalRecords}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No good receipt notes found"
      >
        <Column
          header="GRN Number"
          body={(rowData: IGoodReceiptNote) => rowData.grnNumber ?? "-"}
        />
        <Column field="supplier" header="Supplier" />
        <Column field="receivedBy" header="Received By" />
        <Column
          header="Received Date"
          body={(rowData: IGoodReceiptNote) =>
            formatLocalDate(rowData.receivedDate)
          }
        />
        <Column
          header="Received Facility"
          body={(rowData: IGoodReceiptNote) => rowData.receivedFacility ?? "-"}
        />
        <Column header="Status" body={renderStatus} />
        <Column header="Actions" body={renderActions} />
      </DataTable>
    </div>
  );
}
