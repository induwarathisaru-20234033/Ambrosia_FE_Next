"use client";

interface BumpButtonProps {
  onClick?: () => void;
}

export default function BumpButton({ onClick }: BumpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md bg-[#d7b0e5] text-black text-[20px] font-bold py-3"
    >
      Bump
    </button>
  );
}