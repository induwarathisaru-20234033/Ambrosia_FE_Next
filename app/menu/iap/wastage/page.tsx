"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useToastRef } from "@/contexts/ToastContext";
import { useGetQuery } from "@/services/queries/getQuery";
import { IBaseApiResponse } from "@/data-types";

const Button = dynamic(() => import("@/components/Button"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface WastageRecordListParams {
  pageNumber?: number;
  pageSize?: number;
  wastageEntryNumber?: string;
  recordedBy?: string;
  entryDateFrom?: string;
  entryDateTo?: string;
}

interface IPaginatedData<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const tableStyle = { minWidth: "60rem" };

export default function WastageManagementPage() {
  const router = useRouter();
  const toastRef = useToastRef();

  const [wastageEntryNumber, setWastageEntryNumber] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [entryDateFrom, setEntryDateFrom] = useState<Date | null>(null);
  const [entryDateTo, setEntryDateTo] = useState<Date | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const queryParams: WastageRecordListParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      wastageEntryNumber: wastageEntryNumber.trim() || undefined,
      recordedBy: recordedBy.trim() || undefined,
      entryDateFrom: entryDateFrom ? entryDateFrom.toISOString() : undefined,
      entryDateTo: entryDateTo ? entryDateTo.toISOString() : undefined,
    }),
    [pageNumber, wastageEntryNumber, recordedBy, entryDateFrom, entryDateTo],
  );

  const { data: wastageResponse, isLoading } = useGetQuery<
    IBaseApiResponse<IPaginatedData<WastageRecordDto>>,
    WastageRecordListParams
  >(
    [
      "wastageRecords",
      String(pageNumber),
      wastageEntryNumber,
      recordedBy,
      entryDateFrom?.toISOString() ?? "",
      entryDateTo?.toISOString() ?? "",
    ],
    "/WastageRecords",
    queryParams,
    { toastRef },
  );

  const records = wastageResponse?.data?.items ?? [];
  const totalCount = wastageResponse?.data?.totalCount ?? 0;

  const handleReset = () => {
    setWastageEntryNumber("");
    setRecordedBy("");
    setEntryDateFrom(null);
    setEntryDateTo(null);
    setPageNumber(1);
  };

  const renderActions = (row: WastageRecordDto) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md text-sm"
      onClick={() => router.push(`/menu/iap/wastage-management/${row.id}`)}
    >
      Edit
    </button>
  );

  const renderEntryDate = (row: WastageRecordDto) =>
    row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "-";

  const renderItemCount = (row: WastageRecordDto) => row.items?.length ?? 0;

  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="h1-custom pb-4 text-[#15B097] font-semibold">
            Wastage Management
          </h1>
          <Button
            id="addWastageBtn"
            text="+ Add New"
            type="button"
            className="bg-[#15B097] text-white px-4 py-2 rounded-md"
            state={true}
            onClick={() => router.push("/menu/iap/wastage-management/add")}
          />
        </div>

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="mb-3 label text-xs xs:text-sm sm:text-base">
            <label className="form-label" htmlFor="wastageEntryNumberFilter">
              Wastage Entry Number
            </label>
            <input
              id="wastageEntryNumberFilter"
              type="text"
              className="form-control"
              placeholder="Search by entry number"
              value={wastageEntryNumber}
              onChange={(e) => setWastageEntryNumber(e.target.value)}
            />
          </div>

          <div className="mb-3 label text-xs xs:text-sm sm:text-base">
            <label className="form-label" htmlFor="recordedByFilter">
              Recorded By
            </label>
            <input
              id="recordedByFilter"
              type="text"
              className="form-control"
              placeholder="Search by recorded by"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
            />
          </div>

          <div className="mb-3 label text-xs xs:text-sm sm:text-base">
            <label className="form-label" htmlFor="entryDateFrom">
              Entry Date From
            </label>
            <input
              id="entryDateFrom"
              type="date"
              className="form-control"
              value={
                entryDateFrom
                  ? entryDateFrom.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setEntryDateFrom(
                  e.target.value ? new Date(e.target.value) : null,
                )
              }
            />
          </div>

          <div className="mb-3 label text-xs xs:text-sm sm:text-base">
            <label className="form-label" htmlFor="entryDateTo">
              Entry Date To
            </label>
            <input
              id="entryDateTo"
              type="date"
              className="form-control"
              value={
                entryDateTo ? entryDateTo.toISOString().split("T")[0] : ""
              }
              onChange={(e) =>
                setEntryDateTo(
                  e.target.value ? new Date(e.target.value) : null,
                )
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            id="resetWastageBtn"
            text="Reset"
            type="button"
            className="bg-white border-2 border-[#15B097] text-[#15B097] px-4 py-2 rounded-md"
            state={true}
            onClick={handleReset}
          />
        </div>

        {/* ── Table ── */}
        <DataTable
          value={records}
          loading={isLoading}
          emptyMessage="No wastage records found"
          stripedRows
          size="small"
          scrollable
          tableStyle={tableStyle}
          lazy
          paginator
          rows={pageSize}
          totalRecords={totalCount}
          first={(pageNumber - 1) * pageSize}
          onPage={(e) => setPageNumber((e.first ?? 0) / pageSize + 1)}
        >
          <Column field="wastageEntryNumber" header="Entry Number" />
          <Column header="Entry Date" body={renderEntryDate} />
          <Column field="recordedBy" header="Recorded By" />
          <Column field="generalNotes" header="General Notes" />
          <Column header="No. of Items" body={renderItemCount} />
          <Column
            header="Actions"
            body={renderActions}
            frozen
            alignFrozen="right"
            style={{ minWidth: "8rem" }}
          />
        </DataTable>
      </div>
    </div>
  );
}