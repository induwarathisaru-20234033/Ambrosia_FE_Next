"use client";

import { useState } from "react";
import { Form, Formik } from "formik";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import {
  IPaginatedApiResponse,
  IGoodsIssueNote,
  IGoodsIssueNoteListParams,
} from "@/data-types";
import { useGetQuery } from "@/services/queries/getQuery";

const LabelGroup = dynamic(() => import("@/components/LabelGroup"), {
  ssr: false,
});
const DatePicker = dynamic(() => import("@/components/DatePicker"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Button"), { ssr: false });

const formatLocalDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const getDateBoundaryIsoString = (date: Date, boundary: "start" | "end") => {
  const localDate = new Date(date);
  if (boundary === "start") localDate.setHours(0, 0, 0, 0);
  else localDate.setHours(23, 59, 59, 999);
  return localDate.toISOString();
};

const mapFiltersToQueryParams = (filters: IGoodsIssueNoteListParams) => {
  const fromDate = filters.issuedDateFrom
    ? new Date(filters.issuedDateFrom)
    : null;
  const toDate = filters.issuedDateTo ? new Date(filters.issuedDateTo) : null;
  return {
    ...filters,
    giNumber: filters.giNumber?.trim() || "",
    issuedBy: filters.issuedBy?.trim() || "",
    issuedDateFrom:
      fromDate && !Number.isNaN(fromDate.getTime())
        ? getDateBoundaryIsoString(fromDate, "start")
        : undefined,
    issuedDateTo:
      toDate && !Number.isNaN(toDate.getTime())
        ? getDateBoundaryIsoString(toDate, "end")
        : undefined,
  };
};

export default function GoodIssueNotesTable() {
  const toastRef = useToastRef();

  const initialFilters: IGoodsIssueNoteListParams = {
    pageNumber: 1,
    pageSize: 10,
    giNumber: "",
    issuedBy: "",
    issuedDateFrom: undefined,
    issuedDateTo: undefined,
  };

  const [filters, setFilters] = useState<IGoodsIssueNoteListParams>({
    ...initialFilters,
  });
  const queryParams = mapFiltersToQueryParams(filters);

  const { data: goodsIssueNotesData, isLoading } = useGetQuery<
    IPaginatedApiResponse<IGoodsIssueNote>,
    IGoodsIssueNoteListParams
  >(
    ["goodsIssueNotes", JSON.stringify(queryParams)],
    "/GoodsIssue",
    queryParams,
    { toastRef },
  );

  const rows = goodsIssueNotesData?.data?.items ?? [];
  const totalRecords = goodsIssueNotesData?.data?.totalItemCount ?? rows.length;

  const onPage = (event: DataTablePageEvent) => {
    const currentPageIndex = event.page ?? 0;
    setFilters((prev) => ({
      ...prev,
      pageNumber: currentPageIndex + 1,
      pageSize: event.rows,
    }));
  };

  const handleFilter = (values: IGoodsIssueNoteListParams) => {
    setFilters((prev) => ({
      ...prev,
      giNumber: values.giNumber || "",
      issuedBy: values.issuedBy || "",
      issuedDateFrom: values.issuedDateFrom,
      issuedDateTo: values.issuedDateTo,
      pageNumber: 1,
    }));
  };

  return (
    <div className="w-full">
      <Formik<IGoodsIssueNoteListParams>
        initialValues={filters}
        enableReinitialize
        onSubmit={handleFilter}
      >
        {({ resetForm }) => (
          <Form>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <LabelGroup
                label="GI Number"
                name="giNumber"
                type="text"
                placeholder="GI Number"
                id="filterGiNumber"
                disabled={false}
              />
              <LabelGroup
                label="Issued By"
                name="issuedBy"
                type="text"
                placeholder="Issued By"
                id="filterIssuedBy"
                disabled={false}
              />
              <DatePicker
                name="issuedDateFrom"
                id="filterIssuedDateFrom"
                label="Issued Date From"
                placeholder="Select From Date"
              />
              <DatePicker
                name="issuedDateTo"
                id="filterIssuedDateTo"
                label="Issued Date To"
                placeholder="Select To Date"
              />
            </div>
            <div className="mb-4 flex gap-2">
              <Button
                id="filterGoodsIssueNotesBtn"
                text="Filter"
                type="submit"
                className="bg-[#15B097] text-white px-4 py-2 rounded-md"
                state={true}
              />
              <Button
                id="clearGoodsIssueNotesFilterBtn"
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
        emptyMessage="No goods issue notes found"
      >
        <Column field="giNumber" header="GI Number" />
        <Column field="issuedBy" header="Issued By" />
        <Column
          header="Issued Date"
          body={(rowData: IGoodsIssueNote) =>
            formatLocalDate(rowData.issuedDate)
          }
        />
        <Column
          header="Line Items"
          body={(rowData: IGoodsIssueNote) => rowData.items?.length ?? 0}
        />
      </DataTable>
    </div>
  );
}
