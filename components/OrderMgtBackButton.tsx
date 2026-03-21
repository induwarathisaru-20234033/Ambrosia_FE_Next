"use client";

import { useRouter } from "next/navigation";
import { YellowButton } from "@/app/menu/kitchen-bar-ops/layout";

export default function OrderMgtBackButton() {
  const router = useRouter();

  return (
    <YellowButton onClick={() => router.back()}>
      Back
    </YellowButton>
  );
}