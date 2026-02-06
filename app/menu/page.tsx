"use client";

import MainMenuGrid from "@/components/MenuGrid";

export default function MenuPage() {
  return (
    <main className="flex-1 p-6 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <MainMenuGrid />
      </div>
    </main>
  );
}
