"use client";

import React from "react";
import { Button } from "primereact/button";

interface CanvasToolbarProps {
  isPanMode: boolean;
  onTogglePan: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  isPanMode,
  onTogglePan,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#3b3b3b] bg-[#2f2f2f] px-2 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
      <Button
        icon="pi pi-arrows-alt"
        rounded
        text
        size="small"
        onClick={onTogglePan}
        tooltip="Pan mode"
        tooltipOptions={{ position: "top" }}
        className={
          isPanMode
            ? "!h-8 !w-8 !bg-[#4b4b4b] !text-white"
            : "!h-8 !w-8 !text-white/90 hover:!bg-[#4b4b4b]"
        }
      />
      <div className="mx-1 h-5 w-px bg-white/20" />
      <Button
        icon="pi pi-plus"
        rounded
        text
        size="small"
        onClick={onZoomIn}
        tooltip="Zoom in"
        tooltipOptions={{ position: "top" }}
        className="!h-8 !w-8 !text-white/90 hover:!bg-[#4b4b4b]"
      />
      <Button
        icon="pi pi-minus"
        rounded
        text
        size="small"
        onClick={onZoomOut}
        tooltip="Zoom out"
        tooltipOptions={{ position: "top" }}
        className="!h-8 !w-8 !text-white/90 hover:!bg-[#4b4b4b]"
      />
    </div>
  );
};

export default CanvasToolbar;
