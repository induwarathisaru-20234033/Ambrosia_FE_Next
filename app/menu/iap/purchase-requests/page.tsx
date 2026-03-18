"use client";

import Button from "@/components/Button";
import PurchaseRequestTable from "@/components/iap/PurchaseRequestTable";
import { useRouter } from "next/navigation";

export default function PurchaseRequestsPage() {
  const router = useRouter();

  const handleCreatePurchaseRequest = () => {
    router.push("/menu/iap/purchase-requests/add");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h1 className="text-5xl font-bold text-[#15B097]">
            Purchase Requisitions Management
          </h1>
          <Button
            id="addRequestButton"
            text="Add Purchase Request"
            type="button"
            className="bg-[#15B097] text-white px-4 py-2 rounded-xl shadow-md"
            state={true}
            onClick={handleCreatePurchaseRequest}
          />
        </div>

        <PurchaseRequestTable />
      </div>
    </main>
  );
}
