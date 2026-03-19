"use client";

import React from "react";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { ICanvasShape, ITable } from "@/data-types";

interface TablePropertiesProps {
  selectedShape: ICanvasShape | null;
  tables: ITable[];
  isTablesLoading: boolean;
  isEditing: boolean;
  assignedTableIds: string[];
  onAssignTable: (shapeId: string, tableId: string | undefined) => void;
  onChangeFill: (shapeId: string, color: string) => void;
  onRemoveShape: (shapeId: string) => void;
  onOpenMapElements: () => void;
}

const fillColors = [
  "hsl(0, 0%, 90%)",
  "hsl(0, 0%, 75%)",
  "hsl(0, 0%, 60%)",
  "hsl(30, 10%, 85%)",
];

const TableProperties: React.FC<TablePropertiesProps> = ({
  selectedShape,
  tables,
  isTablesLoading,
  isEditing,
  assignedTableIds,
  onAssignTable,
  onChangeFill,
  onRemoveShape,
  onOpenMapElements,
}) => {
  if (!selectedShape) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[18px] border border-dashed border-[#ffd0c8] bg-[#fff9f8] px-6 text-center text-sm text-[#8f8f8f]">
        <p>
          Select a table on the canvas to manage assignment, color, and
          visibility.
        </p>
        <Button
          type="button"
          label="Go to Map Elements"
          outlined
          className="!rounded-[10px] !border-[#ffb3a8] !text-[#ff5f57] hover:!bg-[#fff2ef]"
          onClick={onOpenMapElements}
        />
      </div>
    );
  }

  const assignDropdownId = `assign-table-${selectedShape.id}`;
  const assignedTable = selectedShape.assignedTableId
    ? tables.find(
        (table) => table.id.toString() === selectedShape.assignedTableId,
      )
    : null;

  const availableTables = tables.filter(
    (table) =>
      !assignedTableIds.includes(table.id.toString()) ||
      table.id.toString() === selectedShape.assignedTableId,
  );

  const dropdownOptions = [
    { label: "— None —", value: "unassigned" },
    ...availableTables.map((table) => ({
      label: `${table.tableName} (Cap: ${table.capacity})`,
      value: table.id.toString(),
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={assignDropdownId}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d7d7d]"
        >
          Assign to Table?
        </label>
        <Dropdown
          inputId={assignDropdownId}
          value={selectedShape.assignedTableId ?? "unassigned"}
          options={dropdownOptions}
          disabled={!isEditing || isTablesLoading}
          onChange={(e) =>
            onAssignTable(
              selectedShape.id,
              e.value === "unassigned" ? undefined : e.value,
            )
          }
          className="floor-map-dropdown w-full"
          placeholder="Select a table..."
        />
      </div>

      {assignedTable && (
        <div className="rounded-[16px] border border-[#ffb9ae] bg-[#fff8f7] p-4 shadow-[0_8px_18px_rgba(255,107,107,0.08)]">
          <h3 className="mb-3 text-lg font-semibold text-[#ff6b6b]">
            Assigned Table
          </h3>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[#6f6f6f]">
              Table Name
            </span>
            <div className="rounded-[8px] bg-[#d5d7de] px-3 py-2 text-sm font-medium text-[#5e6472]">
              {assignedTable.tableName}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-[#6f6f6f]">Capacity</span>
            <div className="rounded-[8px] bg-[#d5d7de] px-3 py-2 text-sm font-medium text-[#5e6472]">
              {assignedTable.capacity}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-[#6f6f6f]">
              Online Booking Enabled?
            </span>
            <InputSwitch
              checked={assignedTable.isOnlineBookingEnabled}
              disabled
              className="custom-toggle custom-toggle-coral floor-map-switch"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-lg font-semibold text-[#ff6b6b]">
          Fill Colors
        </span>
        <span className="text-xs text-[#9a9a9a]">
          Choose a neutral tone for the selected table.
        </span>
        <div className="flex gap-2">
          {fillColors.map((color) => (
            <button
              key={color}
              type="button"
              disabled={!isEditing}
              onClick={() => onChangeFill(selectedShape.id, color)}
              aria-label={`Apply fill color ${color}`}
              className="h-9 w-9 rounded-[6px] border transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: color,
                borderColor:
                  selectedShape.fill === color ? "#ff6b6b" : "#e5e7eb",
                boxShadow:
                  selectedShape.fill === color
                    ? "0 0 0 2px rgba(255, 107, 107, 0.14)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      <Button
        label="Remove"
        severity="danger"
        outlined
        disabled={!isEditing}
        className="floor-map-remove-button !mt-8 !w-full"
        onClick={() => onRemoveShape(selectedShape.id)}
      />
    </div>
  );
};

export default TableProperties;
