"use client";

interface KDSItem {
  id: number;
  name: string;
  quantity: number;
  specialInstructions?: string;
  status: "new" | "preparing" | "ready" | "done";
  tag?: string;
}

interface KitchenCardProps {
  cardName: string;
  orderNumber: string;
  tableName?: string | null;
  orderStatus: number;
  items: KDSItem[];
  isUpdating: boolean;
  onStartClick?: () => void;
  onHoldClick?: () => void;
  onReadyClick?: () => void;
}

const itemColors: Record<KDSItem["status"], string> = {
  new:       "bg-blue-200",
  preparing: "bg-orange-200",
  ready:     "bg-green-200",
  done:      "bg-gray-200",
};

const cardBackground: Record<number, string> = {
  2: "bg-[#f5ebe0]",   
  3: "bg-[#f5ebe0]",   
  4: "bg-red-100",     
  5: "bg-green-50",    
};

const statusBadge: Record<number, { label: string; className: string }> = {
  2: { label: "New",        className: "bg-blue-100 text-blue-800" },
  3: { label: "Preparing",  className: "bg-orange-100 text-orange-800" },
  4: { label: "On Hold",    className: "bg-red-200 text-red-800" },
  5: { label: "Ready",      className: "bg-green-200 text-green-800" },
};

export default function KitchenCard({
  cardName,
  orderNumber,
  tableName,
  orderStatus,
  items,
  isUpdating,
  onStartClick,
  onHoldClick,
  onReadyClick,
}: KitchenCardProps) {
  const bg = cardBackground[orderStatus] ?? "bg-[#f5ebe0]";
  const badge = statusBadge[orderStatus];

  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col shadow-md transition-colors duration-300`}>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{cardName}</h2>
        {orderNumber && (
          <p className="text-sm text-gray-500">#{orderNumber}</p>
        )}
        {tableName && (
          <p className="text-xs text-gray-400">{tableName}</p>
        )}
        {badge && (
          <span className={`inline-block mt-1 px-3 py-0.5 text-xs rounded-full font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${itemColors[item.status]}`}
          >
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs font-bold rounded px-2 py-0.5">
                {item.quantity}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>
                {item.specialInstructions && (
                  <p className="text-xs text-gray-600">{item.specialInstructions}</p>
                )}
              </div>
            </div>
            {item.tag && (
             <span className="bg-blue-500 text-white text-xs font-bold rounded px-2 py-0.5">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
  
        {orderStatus === 2 && (
          <div className="flex gap-2">
            <button
              onClick={onStartClick}
              disabled={isUpdating}
              className="flex-1 py-2 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold disabled:opacity-50 transition-all active:scale-95"
            >
              {isUpdating ? "..." : "Start"}
            </button>
            <button
              onClick={onHoldClick}
              disabled={isUpdating}
              className="flex-1 py-2 rounded-xl bg-orange-300 hover:bg-orange-400 text-white font-bold disabled:opacity-50 transition-all active:scale-95"
            >
              {isUpdating ? "..." : "Hold"}
            </button>
          </div>
        )}

    
        {orderStatus === 3 && (
          <button
            onClick={onReadyClick}
            disabled={isUpdating}
            className="w-full py-2 rounded-xl bg-green-400 hover:bg-green-500 text-white font-bold disabled:opacity-50 transition-all active:scale-95"
          >
            {isUpdating ? "Updating..." : "Ready"}
          </button>
        )}

        {orderStatus === 4 && (
          <div className="flex gap-2">
            <button
              onClick={onStartClick}
              disabled={isUpdating}
              className="flex-1 py-2 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold disabled:opacity-50 transition-all active:scale-95"
            >
              {isUpdating ? "..." : "Start"}
            </button>
            <button
              onClick={onReadyClick}
              disabled={isUpdating}
              className="flex-1 py-2 rounded-xl bg-green-400 hover:bg-green-500 text-white font-bold disabled:opacity-50 transition-all active:scale-95"
            >
              {isUpdating ? "..." : "Ready"}
            </button>
          </div>
        )}

        {orderStatus === 5 && (
          <div className="w-full py-2 rounded-xl bg-green-500 border border-green-300 text-green-50 font-bold text-center animate-pulse">
            Ready to Serve
          </div>
        )}

      </div>
    </div>
  );
}
