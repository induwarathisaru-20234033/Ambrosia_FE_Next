"use client";

import { useEffect, useMemo, useState } from "react";
import { YellowButton } from "@/app/menu/kitchen-bar-ops/layout";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabName: string;
  drinkItems: MenuItem[];
  onEnter: (item: {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
  }) => void;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  tabName,
  drinkItems,
  onEnter,
}: ItemDetailModalProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
      setSelectedItemId(null);
      setQuantity(1);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    return drinkItems.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [drinkItems, keyword]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    drinkItems.find((item) => item.id === selectedItemId) ??
    null;

  const handleEnter = () => {
    if (!selectedItem || quantity <= 0) return;

    onEnter({
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
    });
      // reset fields after adding item, while keeping modal open
      setKeyword("");
      setSelectedItemId(null);
      setQuantity(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="w-[440px] max-w-full bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-[#f0a85a] px-4 py-3 flex items-center justify-between relative">
            <h2 className="text-white font-semibold text-center w-full text-lg">
              Item Detail
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-white text-xl font-bold absolute right-4"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                {tabName || "Direct Bar Tab"}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 bg-white outline-none"
              />

              <button
                type="button"
                className="bg-[#f0a85a] text-white px-3 rounded-md flex items-center justify-center"
              >
                <i className="pi pi-search text-sm"></i>
              </button>
            </div>

            <div className="border rounded-md p-3 h-[180px] overflow-y-auto bg-[#fafafa] text-sm">
              {filteredItems.length === 0 ? (
                <p className="text-gray-400">No drink items found</p>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={`w-full text-left border rounded-md px-3 py-2 transition
                        ${
                          selectedItemId === item.id
                            ? "bg-[#fde7d2] border-[#f0a85a]"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className="font-medium text-black">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        Rs. {item.price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Count</p>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-20 text-center border rounded-md py-1 bg-white"
              />
            </div>

            <div className="flex justify-center">
              <YellowButton
                onClick={handleEnter}
                disabled={!selectedItem || quantity <= 0}
              >
                Enter
              </YellowButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}