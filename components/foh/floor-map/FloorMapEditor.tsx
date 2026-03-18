"use client";

import React, { useState, useCallback } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import MapCanvas from "./MapCanvas";
import ShapeLibrary from "./ShapeLibrary";
import TableProperties from "./TableProperties";
import { ICanvasShape, ShapeType } from "@/data-types";
import CanvasToolbar from "./CanvasToolBar";

const defaultFill = "hsl(0, 0%, 90%)";

const shapeDimensions: Record<ShapeType, { width: number; height: number }> = {
  round: { width: 80, height: 80 },
  square: { width: 70, height: 70 },
  rectangle: { width: 120, height: 60 },
  booth: { width: 90, height: 90 },
};

const FloorMapEditor: React.FC = () => {
  const [shapes, setShapes] = useState<ICanvasShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isPanMode, setIsPanMode] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleAddShape = useCallback((type: ShapeType) => {
    const id = `shape-${Date.now()}`;
    const dims = shapeDimensions[type];
    const newShape: ICanvasShape = {
      id,
      type,
      x: 400,
      y: 300,
      width: dims.width,
      height: dims.height,
      rotation: 0,
      fill: defaultFill,
    };
    setShapes((prev) => [...prev, newShape]);
    setSelectedShapeId(id);
    setActiveTabIndex(1);
  }, []);

  const handleUpdateShape = useCallback(
    (id: string, updates: Partial<ICanvasShape>) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const handleSelectShape = useCallback((id: string | null) => {
    setSelectedShapeId(id);
    if (id) setActiveTabIndex(1);
  }, []);

  const handleAssignTable = useCallback(
    (shapeId: string, tableId: string | undefined) => {
      handleUpdateShape(shapeId, { assignedTableId: tableId });
    },
    [handleUpdateShape],
  );

  const handleChangeFill = useCallback(
    (shapeId: string, color: string) => {
      handleUpdateShape(shapeId, { fill: color });
    },
    [handleUpdateShape],
  );

  const handleRemoveShape = useCallback((shapeId: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== shapeId));
    setSelectedShapeId(null);
    setActiveTabIndex(0);
  }, []);

  const handleOpenMapElements = useCallback(() => {
    setActiveTabIndex(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setStageScale((s) => Math.min(5, s * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setStageScale((s) => Math.max(0.2, s / 1.2));
  }, []);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) ?? null;
  const assignedTableIds = shapes
    .filter((s) => s.assignedTableId)
    .map((s) => s.assignedTableId!);

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#ffb7aa] bg-white shadow-[0_12px_30px_rgba(255,107,107,0.08)]">
      <div className="flex min-h-[700px] flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col bg-[#fffef6] p-5 lg:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-[#ff7b73]">
                Floor Map Editor
              </h1>
              <p className="mt-1 text-sm text-[#7f7f7f]">
                Arrange your dining layout and configure each table visually.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPanMode(false)}
                className="rounded-[12px] border border-[#ffb7aa] bg-white px-5 py-2 text-sm font-semibold text-[#6b7280] shadow-[0_4px_10px_rgba(15,23,42,0.06)] transition-colors hover:border-[#ff8f84] hover:text-[#ff6b6b]"
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-[12px] border border-[#ff7e73] bg-[#ff7e73] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,126,115,0.28)] transition-colors hover:bg-[#ff6b6b]"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <MapCanvas
              shapes={shapes}
              selectedShapeId={selectedShapeId}
              onSelectShape={handleSelectShape}
              onUpdateShape={handleUpdateShape}
              isPanMode={isPanMode}
              stageScale={stageScale}
              stagePosition={stagePosition}
              onStageScaleChange={setStageScale}
              onStagePositionChange={setStagePosition}
            />
            <CanvasToolbar
              isPanMode={isPanMode}
              onTogglePan={() => setIsPanMode((p) => !p)}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </div>
        </div>

        <aside className="w-full border-t border-[#ffd7cd] bg-white lg:w-[330px] lg:border-l lg:border-t-0">
          <TabView
            activeIndex={activeTabIndex}
            onTabChange={(e) => setActiveTabIndex(e.index)}
            className="floor-map-editor-tabs flex h-full flex-col"
          >
            <TabPanel header="Map Elements">
              <div className="p-4">
                <ShapeLibrary
                  onAddShape={handleAddShape}
                  shapes={shapes}
                  selectedShapeId={selectedShapeId}
                  onSelectShape={handleSelectShape}
                />
              </div>
            </TabPanel>
            <TabPanel header="Table Properties">
              <div className="p-4">
                <TableProperties
                  selectedShape={selectedShape}
                  assignedTableIds={assignedTableIds}
                  onAssignTable={handleAssignTable}
                  onChangeFill={handleChangeFill}
                  onRemoveShape={handleRemoveShape}
                  onOpenMapElements={handleOpenMapElements}
                />
              </div>
            </TabPanel>
          </TabView>
        </aside>
      </div>
    </div>
  );
};

export default FloorMapEditor;
