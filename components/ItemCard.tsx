"use client";

interface ItemCardProps {
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready" | "onhold";
  tag?: string;
}

export default function ItemCard({
  name,
  quantity,
  status,
  tag,
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
      <div className="flex items-center gap-3 pr-3">
        <div className="min-w-[28px] h-[28px] rounded-md bg-[#153e75] text-white flex items-center justify-center text-sm font-bold shadow-[0_3px_6px_rgba(0,0,0,0.25)]">
          {quantity}
        </div>

        <p className="text-[16px] font-semibold text-black leading-tight">
          {name}
        </p>
      </div>

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