"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Button = dynamic(() => import("@/components/Button"), { ssr: false });

interface EmpMgtBackButtonProps {
  text?: string;
  className?: string;
}

export default function EmpMgtBackButton({
  text = "Back",
  className = "",
}: EmpMgtBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      text={text}
      type="button"
      className={`bg-[#0086ED] text-white px-4 py-2 rounded-xl shadow-md ${className}`}
      state={true}
      onClick={() => router.back()}
      id="emp-mgt-back"
    />
  );
}