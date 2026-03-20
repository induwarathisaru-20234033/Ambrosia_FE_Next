"use client";

interface ItemCardProps {
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready" | "onhold";
  tag?: string;
  allowModifications?: boolean;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;

}

export default function ItemCard({
  name,
  quantity,
  status,
  tag,
  allowModifications = false,  // Default to false - no buttons
  onIncrease,
  onDecrease,
  onRemove,
}: ItemCardProps) {
  const getCardBg = () => {
    switch (status) {
      case "new":
        return "bg-[#d9d9d9]";
      case "preparing":
        return "bg-[#8db4e6]";
      case "ready":
        return "bg-[#d9b3e6]";
      case "onhold":
        return "bg-[#f08a8a]";
      default:
        return "bg-[#d9d9d9]";
    }
  };

  const isUserInitialTag = !!tag && tag !== "⊕";

  return (
    <div
      className={`rounded-lg px-3 py-3 flex items-center justify-between border border-black/10 shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition-all duration-150 
        hover:-translate-y-[2px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.16)] ${getCardBg()}`}
    >
      <div className="flex items-center gap-3 pr-3 flex-1">
        <div className="min-w-[28px] h-[28px] rounded-md bg-[#153e75] text-white flex items-center justify-center text-sm font-bold shadow-[0_3px_6px_rgba(0,0,0,0.25)]">
          {quantity}
        </div>

        <p className="text-[16px] font-semibold text-black leading-tight">
          {name}
        </p>
      </div>

      {allowModifications && (
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-red-200 hover:bg-red-300 flex items-center justify-center text-red-700 transition-all hover:scale-105 active:scale-95"
            title="Remove item completely"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <button
            onClick={onDecrease}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold transition-all hover:scale-105 active:scale-95"
            title={quantity > 1 ? "Decrease quantity" : "Remove item"}
            type="button"
          >
            <span className="text-lg font-bold">-</span>
          </button>

          <button
            onClick={onIncrease}
            className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-700 font-bold transition-all hover:scale-105 active:scale-95"
            title="Increase quantity"
            type="button"
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>
      )}

      {tag && (
        <div
          className={`min-w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 shadow-[0_4px_8px_rgba(0,0,0,0.18)]
          ${
            isUserInitialTag
              ? "bg-[#ff6b5f] text-white border border-black/30"
              : "bg-white text-black border border-dashed border-black/50"
          }`}
        >
          {tag}
        </div>
      )}
    </div>
  );
}