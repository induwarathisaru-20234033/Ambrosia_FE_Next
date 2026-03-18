"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  RegularPolygon,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import { ICanvasShape } from "@/data-types";

interface MapCanvasProps {
  shapes: ICanvasShape[];
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  onUpdateShape: (id: string, updates: Partial<ICanvasShape>) => void;
  isPanMode: boolean;
  stageScale: number;
  stagePosition: { x: number; y: number };
  onStageScaleChange: (scale: number) => void;
  onStagePositionChange: (pos: { x: number; y: number }) => void;
}

const getStrokeProps = (isSelected: boolean) => ({
  stroke: isSelected ? "#ff6b6b" : "#cfcfcf",
  strokeWidth: isSelected ? 2.5 : 1.25,
  shadowColor: isSelected ? "rgba(255, 107, 107, 0.28)" : "transparent",
  shadowBlur: isSelected ? 14 : 0,
});

const getCommonShapeProps = (
  shape: ICanvasShape,
  isPanMode: boolean,
  onSelectShape: (id: string | null) => void,
  handleDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void,
  handleTransformEnd: (id: string, e: Konva.KonvaEventObject<Event>) => void,
) => ({
  id: shape.id,
  x: shape.x,
  y: shape.y,
  rotation: shape.rotation,
  draggable: !isPanMode,
  onClick: () => onSelectShape(shape.id),
  onTap: () => onSelectShape(shape.id),
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
    handleDragEnd(shape.id, e),
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
    handleTransformEnd(shape.id, e),
});

const renderRectShape = (
  shape: ICanvasShape,
  commonProps: Record<string, unknown>,
  strokeProps: ReturnType<typeof getStrokeProps>,
  width: number,
  height: number,
) => (
  <Rect
    key={shape.id}
    {...commonProps}
    width={width}
    height={height}
    offsetX={width / 2}
    offsetY={height / 2}
    fill={shape.fill}
    cornerRadius={height === width ? 8 : 10}
    {...strokeProps}
  />
);

const renderCanvasShape = (
  shape: ICanvasShape,
  selectedShapeId: string | null,
  isPanMode: boolean,
  onSelectShape: (id: string | null) => void,
  handleDragEnd: (id: string, e: Konva.KonvaEventObject<DragEvent>) => void,
  handleTransformEnd: (id: string, e: Konva.KonvaEventObject<Event>) => void,
) => {
  const strokeProps = getStrokeProps(selectedShapeId === shape.id);
  const commonProps = getCommonShapeProps(
    shape,
    isPanMode,
    onSelectShape,
    handleDragEnd,
    handleTransformEnd,
  );

  if (shape.type === "round") {
    return (
      <Circle
        key={shape.id}
        {...commonProps}
        radius={shape.width / 2}
        fill={shape.fill}
        {...strokeProps}
      />
    );
  }

  if (shape.type === "square") {
    return renderRectShape(
      shape,
      commonProps,
      strokeProps,
      shape.width,
      shape.width,
    );
  }

  if (shape.type === "rectangle") {
    return renderRectShape(
      shape,
      commonProps,
      strokeProps,
      shape.width,
      shape.height,
    );
  }

  if (shape.type === "booth") {
    return (
      <RegularPolygon
        key={shape.id}
        {...commonProps}
        sides={6}
        radius={shape.width / 2}
        fill={shape.fill}
        {...strokeProps}
      />
    );
  }

  return null;
};

const renderGridDots = () =>
  Array.from({ length: 50 }).map((_, row) =>
    Array.from({ length: 50 }).map((_, col) => (
      <Circle
        key={`dot-${row}-${col}`}
        x={col * 40}
        y={row * 40}
        radius={1.4}
        fill="#dddddd"
        listening={false}
      />
    )),
  );

const MapCanvas: React.FC<MapCanvasProps> = ({
  shapes,
  selectedShapeId,
  onSelectShape,
  onUpdateShape,
  isPanMode,
  stageScale,
  stagePosition,
  onStageScaleChange,
  onStagePositionChange,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedShapeId) {
      const node = stageRef.current.findOne(`#${selectedShapeId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedShapeId, shapes]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const oldScale = stageScale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const scaleBy = 1.08;
      const newScale =
        e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.2, Math.min(5, newScale));
      const mousePointTo = {
        x: (pointer.x - stagePosition.x) / oldScale,
        y: (pointer.y - stagePosition.y) / oldScale,
      };
      onStageScaleChange(clampedScale);
      onStagePositionChange({
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      });
    },
    [stageScale, stagePosition, onStageScaleChange, onStagePositionChange],
  );

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) {
      onSelectShape(null);
    }
  };

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    onUpdateShape(id, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    onUpdateShape(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * node.scaleX()),
      height: Math.max(20, node.height() * node.scaleY()),
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <div className="flex h-full min-h-[540px] items-center justify-center rounded-[24px] border border-[#ffe2a6] bg-[#fffbd7] p-4 lg:p-5">
      <div
        ref={containerRef}
        className="relative h-full min-h-[480px] w-full overflow-hidden rounded-[18px] border border-[#d2d2d2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={isPanMode}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={() => onSelectShape(null)}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              onStagePositionChange({ x: e.target.x(), y: e.target.y() });
            }
          }}
          style={{ cursor: isPanMode ? "grab" : "default" }}
        >
          <Layer>
            {renderGridDots()}
            {shapes.map((shape) =>
              renderCanvasShape(
                shape,
                selectedShapeId,
                isPanMode,
                onSelectShape,
                handleDragEnd,
                handleTransformEnd,
              ),
            )}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
              borderStroke="#ff6b6b"
              anchorStroke="#ff6b6b"
              anchorFill="white"
              anchorSize={8}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default MapCanvas;
