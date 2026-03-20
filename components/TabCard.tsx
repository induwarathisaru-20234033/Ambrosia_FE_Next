"use client";

import ItemCard from "@/components/ItemCard";
import { YellowButton, WhiteButton } from "@/app/menu/kitchen-bar-ops/layout";

interface BDSItem {
  id: number;
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready" | "onhold";
  tag?: string;
}

interface TabCardProps {
  tabName: string;
  orderNumber: string;
  orderStatus: number;
  items: BDSItem[];
  isUpdating?: boolean;
  onAddClick?: () => void;
  onStartClick?: () => void;
  onOnHoldClick?: () => void;
  onReadyClick?: () => void;
}

const getOrderStatusLabel = (orderStatus: number) => {
  switch (orderStatus) {
    case 2:
      return "Sent to KDS";
    case 3:
      return "Preparing";
    case 4:
      return "OnHold";
    case 5:
      return "Ready to Serve";
    default:
      return "-";
  }
};

export default function TabCard({
  tabName,
  orderNumber,
  orderStatus,
  items,
  isUpdating = false,
  onAddClick,
  onStartClick,
  onReadyClick,
  onOnHoldClick,
}: TabCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#d8d8d8] shadow-[0_8px_20px_rgba(0,0,0,0.12)] 
                        p-4 min-h-[260px] flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 text-center">
          <h2 className="text-[24px] font-bold text-black">
            {orderNumber ? `${tabName} - ${orderNumber}` : tabName}
          </h2>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-10 h-10 rounded-full bg-[#f1ece8] border border-[#d5cec7] shadow-[0_4px_10px_rgba(0,0,0,0.18)] flex items-center justify-center text-[28px] font-bold leading-none text-black ml-3 transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_7px_14px_rgba(0,0,0,0.22)] active:translate-y-[1px] active:shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
        >
          +
        </button>
      </div>

      <div className="mb-4">
        <div className="inline-block rounded-lg bg-[#f3f4f6] border border-[#d9dde2] px-3 py-2 text-sm font-semibold text-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.08)]">
          {getOrderStatusLabel(orderStatus)}
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            status={item.status}
            tag={item.tag}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        {(orderStatus === 2 || orderStatus === 4) && (
          <YellowButton onClick={onStartClick} disabled={isUpdating}>
            {isUpdating ? "Starting..." : "Start"}
          </YellowButton>
        )}

        {(orderStatus === 2 || orderStatus === 3) && (
          <WhiteButton onClick={onOnHoldClick} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "On Hold"}
          </WhiteButton>
        )}

        {(orderStatus === 3 || orderStatus === 4) && (
          <WhiteButton onClick={onReadyClick} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Ready"}
          </WhiteButton>
        )}

        {orderStatus === 5 && (
          <div className="w-full rounded-md bg-[#d7b0e5] text-black text-[18px] font-bold py-2 text-center">
            Ready to Serve
          </div>
        )}
      </div>
    </div>
  );
}