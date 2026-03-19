"use client";

import ItemCard from "@/components/ItemCard";
import BumpButton from "@/components/BumpButton";

interface BDSItem {
  id: number;
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready";
  tag?: string;
}

interface TabCardProps {
  tabName: string;
  orderNumber: string;
  items: BDSItem[];
  onAddClick?: () => void;
  onBumpClick?: () => void;
}

export default function TabCard({
  tabName,
  orderNumber,
  items,
  onAddClick,
  onBumpClick,
}: TabCardProps) {
  const readyItems = items.filter((item) => item.status === "ready");
  const nonReadyItems = items.filter((item) => item.status !== "ready");

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 min-h-[260px] flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 text-center">
          <h2 className="text-[24px] font-bold text-black">
            {tabName} - {orderNumber}
          </h2>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-10 h-10 rounded-full bg-[#f1ece8] shadow flex items-center justify-center text-[28px] font-bold leading-none text-black ml-3"
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {nonReadyItems.map((item) => (
          <ItemCard
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            status={item.status}
            tag={item.tag}
          />
        ))}
      </div>

      {readyItems.length > 0 && (
        <div className="mt-4">
          <BumpButton onClick={onBumpClick} />
        </div>
      )}
    </div>
  );
}