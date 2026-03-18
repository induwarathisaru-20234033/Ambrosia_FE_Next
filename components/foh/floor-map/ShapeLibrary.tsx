import React from "react";
import { Circle, Square, RectangleHorizontal, Hexagon } from "lucide-react";
import { ICanvasShape, ShapeType } from "@/data-types";

interface ShapeLibraryProps {
  onAddShape: (type: ShapeType) => void;
  shapes: ICanvasShape[];
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
}

const shapeOptions: {
  type: ShapeType;
  label: string;
  icon: React.ElementType;
  hint: string;
}[] = [
  { type: "round", label: "Round", icon: Circle, hint: "Cafe" },
  { type: "square", label: "Square", icon: Square, hint: "2-4 pax" },
  {
    type: "rectangle",
    label: "Rectangle",
    icon: RectangleHorizontal,
    hint: "Family",
  },
  { type: "booth", label: "Booth", icon: Hexagon, hint: "Cluster" },
];

const shapeLabels: Record<ShapeType, string> = {
  round: "Round",
  square: "Square",
  rectangle: "Rectangle",
  booth: "Booth",
};

const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  onAddShape,
  shapes,
  selectedShapeId,
  onSelectShape,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8d82]">
          Table Shapes
        </h3>
        <p className="mt-1 text-xs text-[#8a8a8a]">
          Add a table type, then assign it from the properties panel.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shapeOptions.map(({ type, label, icon: Icon, hint }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAddShape(type)}
            className="group flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-[16px] border border-[#ffd3cb] bg-[#fff8f6] p-4 text-center transition-all hover:-translate-y-0.5 hover:border-[#ff8d82] hover:bg-[#fff1ee] hover:shadow-[0_12px_24px_rgba(255,107,107,0.12)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#ff7f76] shadow-[0_6px_14px_rgba(255,107,107,0.12)] transition-colors group-hover:bg-[#ff7f76] group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-[#434343]">
              {label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#b2b2b2]">
              {hint}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
            Added Elements
          </h4>
          <span className="rounded-full bg-[#fff1ee] px-2 py-0.5 text-[11px] font-semibold text-[#ff6b6b]">
            {shapes.length}
          </span>
        </div>

        {shapes.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#ffd3cb] bg-[#fffdfc] px-3 py-2 text-xs text-[#999999]">
            No elements yet. Add a shape above.
          </div>
        ) : (
          <div className="max-h-[180px] space-y-2 overflow-auto pr-1">
            {shapes.map((shape, index) => {
              const isActive = selectedShapeId === shape.id;

              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => onSelectShape(shape.id)}
                  className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "border-[#ff9f94] bg-[#fff1ee] text-[#3f3f46]"
                      : "border-[#ececec] bg-white text-[#666] hover:border-[#ffd0c8]"
                  }`}
                >
                  <span className="font-medium">
                    {shapeLabels[shape.type]} {index + 1}
                  </span>
                  <span className="text-[11px] text-[#9a9a9a]">
                    {shape.assignedTableId
                      ? `Assigned #${shape.assignedTableId}`
                      : "Unassigned"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeLibrary;
