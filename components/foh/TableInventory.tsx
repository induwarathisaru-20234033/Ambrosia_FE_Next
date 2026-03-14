"use client";

import { useState } from "react";
import AddTableForm from "./AddTableForm";
import TablesList from "./TablesList";

export default function TableInventory() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleTableAdded = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-8">
        <h2 className="text-3xl font-light text-[#FF6B6B]">Table Inventory</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[450px]">
        <div className="lg:col-span-1 h-full">
          <AddTableForm onTableAdded={handleTableAdded} />
        </div>

        <div className="lg:col-span-2 h-full">
          <TablesList key={refreshTrigger.toString()}></TablesList>
        </div>
      </div>
    </div>
  );
}
