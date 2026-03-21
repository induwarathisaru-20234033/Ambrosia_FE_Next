"use client";

import React, { ButtonHTMLAttributes } from "react";

// Props for layout
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  titleClassName?: string; // optional class for extra styling
}

export default function KitchenBarOpsLayout({
  children,
  title,
  titleClassName,
}: LayoutProps) {
  return (
    <div className="p-6 font-sans">
      {/* Header */}
      {title && (
        <h1 className={`h1-title ${titleClassName ?? ""}`}>{title}</h1>
      )}

      {/* Render children */}
      <div>{children}</div>
    </div>
  );
}

// --- Helper components ---

interface SharedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

// Yellow button
export const YellowButton: React.FC<SharedButtonProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded font-bold ${className ?? ""}`}
    {...props}
  >
    {children}
  </button>
);

// White button with yellow border
export const WhiteButton: React.FC<SharedButtonProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`bg-white hover:bg-gray-100 !border !border-yellow-400 text-yellow-400 px-4 py-2 rounded font-bold ${className ?? ""}`}
    {...props}
  >
    {children}
  </button>
);

// Tabs with yellow underline
export const Tabs = ({
  tabs,
  activeIndex,
  onTabClick,
}: {
  tabs: string[];
  activeIndex: number;
  onTabClick: (index: number) => void;
}) => (
  <div className="flex gap-4 border-b border-gray-200 mb-4">
    {tabs.map((tab, idx) => (
      <div
        key={idx}
        className={`pb-2 cursor-pointer font-semibold ${
          activeIndex === idx
            ? "border-b-2 border-yellow-400 text-yellow-400"
            : "text-gray-600"
        }`}
        onClick={() => onTabClick(idx)}
      >
        {tab}
      </div>
    ))}
  </div>
);