"use client";

import { YellowButton, WhiteButton } from "@/app/menu/kitchen-bar-ops/layout";

interface PlaceDirectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PlaceDirectOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: PlaceDirectOrderModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="w-[420px] max-w-full bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-[#f0a85a] px-4 py-3 flex items-center justify-between relative">
            <h2 className="text-white font-semibold text-center w-full text-lg">
              Confirm Order
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-white text-xl font-bold absolute right-4"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-4 text-center">
            <p className="text-gray-700">
              Are you sure you want to place this direct bar order?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <YellowButton onClick={onConfirm}>
                Confirm
              </YellowButton>

              <WhiteButton onClick={onClose}>
                Cancel
              </WhiteButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}