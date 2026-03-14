"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Button = dynamic(() => import("@/components/Button"), { ssr: false });
const InventoryItemsTable = dynamic(
  () => import("@/components/iap/InventoryItemsTable"),
  { ssr: false },
);

export default function InventoryManagementPage() {
  const router = useRouter();

  const handleAddItem = () => {
    router.push("/menu/iap/inventory/items/add");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h1 className="text-5xl font-bold text-[#15B097]">
            Inventory Management
          </h1>
          <Button
            id="addItemButton"
            text="Add Inventory Item"
            type="button"
            className="bg-[#15B097] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={handleAddItem}
          />
        </div>

        <InventoryItemsTable />
      </div>
    </main>
  );
}
