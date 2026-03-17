"use client";

import Button from "@/components/Button";
import GoodReceiptNotesTable from "@/components/iap/GoodReceiptNotesTable";
import { useRouter } from "next/navigation";

export default function ViewGoodReceiptNotesPage() {
  const router = useRouter();

  const handleCreateGoodReceiptNote = () => {
    router.push("/menu/iap/good-receipt-notes/add");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h1 className="text-5xl font-bold text-[#15B097]">
            Good Receipt Notes Management
          </h1>
          <Button
            id="addGoodReceiptNoteButton"
            text="Add Good Receipt Note"
            type="button"
            className="bg-[#15B097] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={handleCreateGoodReceiptNote}
          />
        </div>

        <GoodReceiptNotesTable />
      </div>
    </main>
  );
}
