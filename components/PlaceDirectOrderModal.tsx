"use client";

import { useEffect, useState } from "react";
import { YellowButton, WhiteButton } from "@/app/menu/kitchen-bar-ops/layout";
import type { ITable } from "@/data-types";

interface PlaceDirectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: ITable[];
  onConfirm: (tableId: number) => void;
}

export default function PlaceDirectOrderModal({
  isOpen,
  onClose,
  tables,
  onConfirm,
}: PlaceDirectOrderModalProps) {
  const [selectedTableId, setSelectedTableId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedTableId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="w-[420px] max-w-full bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-[#f0a85a] px-4 py-3 flex items-center justify-between relative">
            <h2 className="text-white font-semibold text-center w-full text-lg">
              Select Table
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-white text-xl font-bold absolute right-4"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">
                Table
              </label>

              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white outline-none"
              >
                <option value="">Select table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.tableName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <YellowButton
                onClick={() => onConfirm(Number(selectedTableId))}
                disabled={!selectedTableId}
              >
                Confirm
              </YellowButton>

              <WhiteButton onClick={onClose}>Cancel</WhiteButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}