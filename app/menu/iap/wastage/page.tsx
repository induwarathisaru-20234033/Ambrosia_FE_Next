"use client";

import { useState } from "react";
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

// ─── Component ────────────────────────────────────────────────────────────────

const tableStyle = { minWidth: "60rem" };

export default function WastageManagementPage() {
  const router = useRouter();
  const toastRef = useToastRef();

  const [wastageEntryNumber, setWastageEntryNumber] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [entryDateFrom, setEntryDateFrom] = useState("");
  const [entryDateTo, setEntryDateTo] = useState("");

  // ── Fetch — plain array response ─────────────────────────────────────────
  const { data: wastageResponse, isLoading } = useGetQuery<
    IBaseApiResponse<WastageRecordDto[]>,
    undefined
  >(
    ["wastageRecords"],
    "/WastageRecords",
    undefined,
    { toastRef },
  );

  const allRecords = wastageResponse?.data ?? [];

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredRecords = allRecords.filter((record) => {
    const matchesEntryNumber = wastageEntryNumber.trim()
      ? record.wastageEntryNumber
          .toLowerCase()
          .includes(wastageEntryNumber.trim().toLowerCase())
      : true;

    const matchesRecordedBy = recordedBy.trim()
      ? record.recordedBy
          .toLowerCase()
          .includes(recordedBy.trim().toLowerCase())
      : true;

    const recordDate = new Date(record.entryDate);

    const matchesDateFrom = entryDateFrom
      ? recordDate >= new Date(entryDateFrom)
      : true;

    const matchesDateTo = entryDateTo
      ? recordDate <= new Date(new Date(entryDateTo).setHours(23, 59, 59, 999))
      : true;

    return (
      matchesEntryNumber &&
      matchesRecordedBy &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const handleReset = () => {
    setWastageEntryNumber("");
    setRecordedBy("");
    setEntryDateFrom("");
    setEntryDateTo("");
  };

  // ── Column renderers ──────────────────────────────────────────────────────

  const renderActions = (row: WastageRecordDto) => (
    <button
      type="button"
      className="bg-white border-2 border-[#15B097] text-[#15B097] py-1 px-3 rounded-md text-sm"
      onClick={() => router.push(`/menu/iap/wastage/${row.id}`)}
    >
      Edit
    </button>
  );

  const renderEntryDate = (row: WastageRecordDto) =>
    row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "-";

  const renderItemCount = (row: WastageRecordDto) => row.items?.length ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────

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
            onClick={() => router.push("/menu/iap/wastage/add")}
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
              value={entryDateFrom}
              onChange={(e) => setEntryDateFrom(e.target.value)}
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
              value={entryDateTo}
              onChange={(e) => setEntryDateTo(e.target.value)}
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
          value={filteredRecords}
          loading={isLoading}
          emptyMessage="No wastage records found"
          stripedRows
          size="small"
          scrollable
          tableStyle={tableStyle}
          paginator
          rows={10}
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