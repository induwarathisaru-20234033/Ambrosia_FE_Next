import { useState } from "react";
import AddExclusionForm from "./AddExclusionForm";
import ExclusionsList from "./ExclusionsList";

export default function CalenderExclusions() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleExclusionAdded = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-8">
        <h2 className="text-3xl font-light text-[#FF6B6B]">
          Calendar Exclusions
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[450px]">
        <div className="lg:col-span-1 h-full">
          <AddExclusionForm onExclusionAdded={handleExclusionAdded} />
        </div>

        <div className="lg:col-span-2 h-full">
          <ExclusionsList key={refreshTrigger.toString()} />
        </div>
      </div>
    </div>
  );
}
