"use client";

interface ItemCardProps {
  name: string;
  quantity: number;
  status: "new" | "preparing" | "ready";
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
      default:
        return "bg-[#d9d9d9]";
    }
  };

  const isUserInitialTag = !!tag && tag !== "⊕";

  return (
    <div
      className={`rounded-md px-3 py-3 flex items-center justify-between ${getCardBg()}`}
    >
      <div className="flex items-center gap-3 pr-3">
        <div className="min-w-[28px] h-[28px] rounded-sm bg-[#153e75] text-white flex items-center justify-center text-sm font-bold">
          {quantity}
        </div>

        <p className="text-[16px] font-semibold text-black leading-tight">
          {name}
        </p>
      </div>

      {tag && (
        <div
          className={`min-w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0
            ${
              isUserInitialTag
                ? "bg-[#ff6b5f] text-white border border-black"
                : "bg-white text-black border border-dashed border-black"
            }`}
        >
          {tag}
        </div>
      )}
    </div>
  );
}