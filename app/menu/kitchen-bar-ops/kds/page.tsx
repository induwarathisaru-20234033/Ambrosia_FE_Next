"use client";

import { AiButton } from "@/components/AiButton";
import { useRouter } from "next/navigation";

export default function ViewKitchenBarOpsPage() {
    const router = useRouter();

    return (
  <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex justify-between items-start mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-[#FBB365] text-left">
                Kitchen Display System
            </h2>
            <div className="flex justify-end gap-3">
                <AiButton className="px-3 py-2 text-sm bg-[#FBB365] text-black rounded-lg">
                    AI Recommendation
                </AiButton>
            </div>
        </div>
    </div>
</main>
    );
}

