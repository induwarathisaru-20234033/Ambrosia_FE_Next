"use client";

import { useRouter } from "next/navigation";
import { YellowButton } from "@/app/menu/kitchen-bar-ops/layout";

interface OrderMgtBackButtonProps {
  text?: string;
  fallbackPath?: string;
  className?: string;
}

export default function OrderMgtBackButton({
  text = "Back",
  fallbackPath = "/menu/order-mgt",
  className = "",
}: OrderMgtBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  return (
    <YellowButton onClick={handleBack} className={className}>
      {text}
    </YellowButton>
  );
}