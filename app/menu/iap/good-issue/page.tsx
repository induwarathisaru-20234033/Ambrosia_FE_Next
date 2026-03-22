"use client";

import Button from "@/components/Button";
import GoodIssueNotesTable from "@/components/iap/GoodIssueNotesTable";
import { useRouter } from "next/navigation";

export default function ViewGoodIssuePage() {
  const router = useRouter();

  const handleCreateGoodIssueNote = () => {
    router.push("/menu/iap/good-issue/add");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h1 className="text-5xl font-bold text-[#15B097]">
            Good Issue Management
          </h1>
          <Button
            id="addGoodIssueNoteButton"
            text="Add Good Issue Note"
            type="button"
            className="bg-[#15B097] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={handleCreateGoodIssueNote}
          />
        </div>
        <GoodIssueNotesTable />
      </div>
    </main>
  );
}
