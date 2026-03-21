"use client";

import ItemCard from "@/components/ItemCard";
import { YellowButton, WhiteButton } from "@/app/menu/kitchen-bar-ops/layout";

interface BDSItem {
  id: number;
  menuItemId?: number;
  name: string;
  quantity: number;
  price?: number;
  specialInstructions?: string;
  status: "new" | "preparing" | "ready" | "onhold";
  tag?: string;
}

interface TabCardProps {
  tabName: string;
  orderNumber: string;
  tableName?: string | null;
  orderStatus: number;
  items: BDSItem[];
  isManual?: boolean;
  isPlaced?: boolean;
  isUpdating?: boolean;
  isPlusDisabled?: boolean;
  onAddClick?: () => void;
  onPlaceOrder?: () => void;
  onStartClick?: () => void;
  onOnHoldClick?: () => void;
  onReadyClick?: () => void;
  onIncreaseItem?: (itemId: number) => void;
  onDecreaseItem?: (itemId: number) => void;
  onRemoveItem?: (itemId: number) => void;
}

const getOrderStatusLabel = (orderStatus: number) => {
  switch (orderStatus) {
    case 1:
      return "Draft";
    case 2:
      return "Sent to KDS";
    case 3:
      return "Preparing";
    case 4:
      return "On Hold";
    case 5:
      return "Ready to Serve";
    default:
      return "-";
  }
};

const getStatusAccentColor = (status: number) => {
  switch (status) {
    case 2:
      return "#60A5FA"; // blue
    case 3:
      return "#F59E0B"; // amber
    case 4:
      return "#94A3B8"; // slate
    case 5:
      return "#22C55E"; // green
    default:
      return "#D1D5DB";
  }
};

const getStatusSoftBg = (status: number) => {
  switch (status) {
    case 2:
      return "#EFF6FF";
    case 3:
      return "#FFFBEB";
    case 4:
      return "#F8FAFC";
    case 5:
      return "#F0FDF4";
    default:
      return "#FFFFFF";
  }
};

const getBottomPanelStyle = (status: number) => {
  switch (status) {
    case 5:
      return {
        backgroundColor: "#DCFCE7",
        borderColor: "#86EFAC",
        textColor: "#166534",
      };
    case 4:
      return {
        backgroundColor: "#F8FAFC",
        borderColor: "#CBD5E1",
        textColor: "#475569",
      };
    case 3:
      return {
        backgroundColor: "#FFFBEB",
        borderColor: "#FCD34D",
        textColor: "#B45309",
      };
    case 2:
      return {
        backgroundColor: "#EFF6FF",
        borderColor: "#93C5FD",
        textColor: "#1D4ED8",
      };
    default:
      return {
        backgroundColor: "#F9FAFB",
        borderColor: "#E5E7EB",
        textColor: "#374151",
      };
  }
};

export default function TabCard({
  tabName,
  orderNumber,
  tableName,
  orderStatus,
  items,
  isManual = false,
  isPlaced = false,
  isUpdating = false,
  isPlusDisabled = false,
  onAddClick,
  onPlaceOrder,
  onStartClick,
  onReadyClick,
  onOnHoldClick,
  onIncreaseItem,
  onDecreaseItem,
  onRemoveItem,
}: TabCardProps) {
  const isManualDraftCard = isManual && !isPlaced;
  const allowItemModifications = isManualDraftCard;

  const accentColor = getStatusAccentColor(orderStatus);
  const statusSoftBg = getStatusSoftBg(orderStatus);
  const bottomPanelStyle = getBottomPanelStyle(orderStatus);

  return (
    <div
      className="bg-white rounded-2xl border border-[#ddd6cf] border-l-[6px]
                 shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                 p-4 min-h-[280px] flex flex-col transition-all duration-200
                 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 text-center">
          <h2 className="text-[24px] font-bold text-black leading-tight">
            {orderNumber ? `${tabName} - #${orderNumber}` : tabName}
          </h2>

          {tableName && (
            <div className="text-[12px] text-gray-500 mt-1 font-medium">
              {tableName}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onAddClick}
          disabled={isPlusDisabled}
          className={`w-10 h-10 rounded-full border flex items-center justify-center
                      text-[28px] font-bold leading-none ml-3 transition-all duration-150
            ${
              isPlusDisabled
                ? "bg-[#e5e5e5] border-[#d5d5d5] text-gray-400 cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                : "bg-[#fff8ef] border-[#e2c89b] text-[#8a5a00] shadow-[0_5px_12px_rgba(0,0,0,0.18)] hover:-translate-y-[1px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.22)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.14)]"
            }`}
        >
          +
        </button>
      </div>

      <div className="mb-4">
        <div
          className="inline-block rounded-xl px-3 py-2 text-sm font-bold border
                     shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          style={{
            backgroundColor: statusSoftBg,
            color: accentColor,
            borderColor: accentColor,
          }}
        >
          {getOrderStatusLabel(orderStatus)}
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {items.length > 0 ? (
          items.map((item) => (
            <ItemCard
              key={item.id}
              name={item.name}
              quantity={item.quantity}
              status={item.status}
              tag={item.tag}
              allowModifications={allowItemModifications}
              onIncrease={
                allowItemModifications
                  ? () => onIncreaseItem?.(item.id)
                  : undefined
              }
              onDecrease={
                allowItemModifications
                  ? () => onDecreaseItem?.(item.id)
                  : undefined
              }
              onRemove={
                allowItemModifications
                  ? () => onRemoveItem?.(item.id)
                  : undefined
              }
            />
          ))
        ) : isManualDraftCard ? (
          <div className="border border-dashed border-[#d6d3d1] rounded-xl p-6 text-center text-gray-400 bg-[#fafaf9] font-medium">
            Click + to add drink items
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex gap-3">
        {isManualDraftCard ? (
          <div className="w-full">
            <YellowButton onClick={onPlaceOrder} disabled={items.length === 0}>
              Place Order
            </YellowButton>
          </div>
        ) : (
          <>
            {(orderStatus === 2 || orderStatus === 4) && (
              <div className="flex-1">
                <button
                  type="button"
                  onClick={onStartClick}
                  disabled={isUpdating}
                  className="w-full rounded-xl px-4 py-2.5 font-bold text-white
                             bg-[#F4A62A] border border-[#d8901c]
                             shadow-[0_5px_12px_rgba(0,0,0,0.18)]
                             hover:-translate-y-[1px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.22)]
                             active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.14)]
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUpdating ? "Updating..." : "Start"}
                </button>
              </div>
            )}

            {(orderStatus === 2 || orderStatus === 3) && (
              <div className="flex-1">
                <button
                  type="button"
                  onClick={onOnHoldClick}
                  disabled={isUpdating}
                  className="w-full rounded-xl px-4 py-2.5 font-bold
                             bg-white text-[#475569] border border-[#cbd5e1]
                             shadow-[0_5px_12px_rgba(0,0,0,0.14)]
                             hover:-translate-y-[1px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.18)]
                             active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.10)]
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUpdating ? "Updating..." : "Hold"}
                </button>
              </div>
            )}

            {(orderStatus === 3 || orderStatus === 4) && (
              <div className="flex-1">
                <button
                  type="button"
                  onClick={onReadyClick}
                  disabled={isUpdating}
                  className="w-full rounded-xl px-4 py-2.5 font-bold
                             bg-[#D1FAE5] text-[#166534] border border-[#86EFAC]
                             shadow-[0_5px_12px_rgba(0,0,0,0.14)]
                             hover:-translate-y-[1px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.18)]
                             active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.10)]
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUpdating ? "Updating..." : "Ready"}
                </button>
              </div>
            )}

            {orderStatus === 5 && (
              <div
                className="w-full rounded-xl border text-[18px] font-bold animate-pulse py-2.5 text-center
                          shadow-[0_4px_10px_rgba(0,0,0,0.10)]"
                style={{
                  backgroundColor: "#14a047",
                  borderColor: "#46ec83",
                  color: "#e2efe7",
                }}
              >
                Ready to Serve
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}