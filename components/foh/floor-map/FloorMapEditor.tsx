"use client";

import React, { useState, useCallback } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { useMutation, useQuery } from "@tanstack/react-query";
import MapCanvas from "./MapCanvas";
import ShapeLibrary from "./ShapeLibrary";
import TableProperties from "./TableProperties";
import {
  ICanvasShape,
  IBaseApiResponse,
  ITable,
  ShapeType,
  IFloorMapData,
  IApiFloorMapShape,
} from "@/data-types";
import CanvasToolbar from "./CanvasToolBar";
import axiosAuth from "@/utils/AxiosInstance";
import { useToastRef } from "@/contexts/ToastContext";

const defaultFill = "hsl(0, 0%, 90%)";

const shapeDimensions: Record<ShapeType, { width: number; height: number }> = {
  round: { width: 80, height: 80 },
  square: { width: 70, height: 70 },
  rectangle: { width: 120, height: 60 },
  booth: { width: 90, height: 90 },
};

const apiShapeTypeToUi: Record<number, ShapeType> = {
  1: "round",
  2: "square",
  3: "rectangle",
  4: "booth",
};

const uiShapeTypeToApi: Record<ShapeType, number> = {
  round: 1,
  square: 2,
  rectangle: 3,
  booth: 4,
};

const buildLocalShapeId = () =>
  `shape-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toUiShapeType = (type: number): ShapeType =>
  apiShapeTypeToUi[type] ?? "round";

const mapApiShapeToUi = (shape: IApiFloorMapShape): ICanvasShape => {
  const mappedType = toUiShapeType(shape.type);
  const fallbackSize = shapeDimensions[mappedType];

  return {
    id: buildLocalShapeId(),
    type: mappedType,
    x: shape.x ?? 0,
    y: shape.y ?? 0,
    width: shape.width || fallbackSize.width,
    height: shape.height || fallbackSize.height,
    rotation: shape.rotation ?? 0,
    fill: shape.fill || defaultFill,
    assignedTableId:
      shape.assignedTableId && shape.assignedTableId > 0
        ? String(shape.assignedTableId)
        : undefined,
  };
};

const FloorMapEditor: React.FC = () => {
  const toastRef = useToastRef();
  const [shapes, setShapes] = useState<ICanvasShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const {
    data: floorMapResponse,
    isLoading: isFloorMapLoading,
    refetch: refetchFloorMap,
  } = useQuery({
    queryKey: ["foh-floor-map"],
    queryFn: async () => {
      const response =
        await axiosAuth.get<IBaseApiResponse<IFloorMapData>>(
          "/Tables/floor-map",
        );
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: tablesResponse, isLoading: isTablesLoading } = useQuery({
    queryKey: ["foh-floor-map-tables"],
    queryFn: async () => {
      const response =
        await axiosAuth.get<IBaseApiResponse<ITable[]>>("/Tables");
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const publishFloorMapMutation = useMutation({
    mutationFn: async (payload: { shapes: IApiFloorMapShape[] }) =>
      axiosAuth.post("/Tables/floor-map", payload),
    onSuccess: async () => {
      await refetchFloorMap();
      setSelectedShapeId(null);
      setIsEditMode(false);
      setIsPanMode(false);
      setActiveTabIndex(0);

      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Floor map published successfully",
        life: 3000,
      });
    },
    onError: (error: unknown) => {
      const typedError = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };

      const errorMessage =
        typedError?.response?.data?.message ||
        typedError?.response?.data?.error ||
        typedError?.message ||
        "Failed to publish floor map";

      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    },
  });

  React.useEffect(() => {
    const incomingShapes = floorMapResponse?.data?.shapes ?? [];

    if (!Array.isArray(incomingShapes) || incomingShapes.length === 0) {
      setShapes([]);
      setSelectedShapeId(null);
      setIsEditMode(true);
      return;
    }

    const mappedShapes = incomingShapes.map(mapApiShapeToUi);
    setShapes(mappedShapes);
    setSelectedShapeId(null);
    setIsEditMode(false);
  }, [floorMapResponse]);

  const handleAddShape = useCallback(
    (type: ShapeType) => {
      if (!isEditMode) return;

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
    },
    [isEditMode],
  );

  const handleUpdateShape = useCallback(
    (id: string, updates: Partial<ICanvasShape>) => {
      if (!isEditMode) return;

      setShapes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [isEditMode],
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

  const handleRemoveShape = useCallback(
    (shapeId: string) => {
      if (!isEditMode) return;

      setShapes((prev) => prev.filter((s) => s.id !== shapeId));
      setSelectedShapeId(null);
      setActiveTabIndex(0);
    },
    [isEditMode],
  );

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
  const hasShapes = shapes.length > 0;
  const hasConfiguredTable = shapes.some((shape) =>
    Boolean(shape.assignedTableId),
  );
  const isPublishing = publishFloorMapMutation.isPending;
  const tables = tablesResponse?.data ?? [];

  const isEditDisabled = isFloorMapLoading || isPublishing || isEditMode;
  const isPublishDisabled =
    isFloorMapLoading ||
    isPublishing ||
    (hasShapes && (!isEditMode || !hasConfiguredTable));

  const handleEdit = () => {
    if (isEditDisabled) return;
    setIsEditMode(true);
  };

  const handlePublish = () => {
    if (isPublishDisabled) return;

    const payload = {
      shapes: shapes.map((shape) => ({
        type: uiShapeTypeToApi[shape.type],
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        fill: shape.fill,
        assignedTableId: shape.assignedTableId
          ? Number(shape.assignedTableId)
          : 0,
      })),
    };

    publishFloorMapMutation.mutate(payload);
  };

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
                onClick={handleEdit}
                disabled={isEditDisabled}
                className="rounded-[12px] border border-[#ffb7aa] bg-white px-5 py-2 text-sm font-semibold text-[#6b7280] shadow-[0_4px_10px_rgba(15,23,42,0.06)] transition-colors hover:border-[#ff8f84] hover:text-[#ff6b6b] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:text-[#c4c4c4] disabled:shadow-none"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishDisabled}
                className="rounded-[12px] border border-[#ff7e73] bg-[#ff7e73] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,126,115,0.28)] transition-colors hover:bg-[#ff6b6b] disabled:cursor-not-allowed disabled:border-[#d1d5db] disabled:bg-[#e5e7eb] disabled:text-[#9ca3af] disabled:shadow-none"
              >
                {isPublishing ? "Publishing..." : "Publish"}
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
              isEditing={isEditMode}
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
                  disabled={!isEditMode}
                />
              </div>
            </TabPanel>
            <TabPanel header="Table Properties">
              <div className="p-4">
                <TableProperties
                  selectedShape={selectedShape}
                  tables={tables}
                  isTablesLoading={isTablesLoading}
                  assignedTableIds={assignedTableIds}
                  onAssignTable={handleAssignTable}
                  onChangeFill={handleChangeFill}
                  onRemoveShape={handleRemoveShape}
                  onOpenMapElements={handleOpenMapElements}
                  isEditing={isEditMode}
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
