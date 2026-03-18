"use client";

import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import ServiceHoursAndRules from "@/components/foh/ServiceHoursAndRules";
import TableInventory from "@/components/foh/TableInventory";
import { Divider } from "primereact/divider";
import CalenderExclusions from "@/components/foh/CalenderExclusions";
import FloorMapEditor from "@/components/foh/floor-map/FloorMapEditor";

export default function ConfigurationsPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <h1 className="text-5xl font-bold text-[#FF6B6B] mb-12">
          Configurations
        </h1>

        <div className="overflow-hidden">
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className="custom-tabs"
          >
            <TabPanel
              header={
                <div className="flex items-center justify-center w-96 h-full px-8 py-4">
                  <span className="font-semibold text-gray-900">
                    Reservation Availabilities
                  </span>
                </div>
              }
            >
              <div className="pt-8">
                <ServiceHoursAndRules />
                <Divider />
                <TableInventory />
                <Divider />
                <CalenderExclusions />
              </div>
            </TabPanel>

            <TabPanel
              header={
                <div className="flex items-center justify-center w-96 h-full px-8 py-4">
                  <span className="font-semibold text-gray-900">Floor Map</span>
                </div>
              }
            >
              <div className="p-8">
                <FloorMapEditor />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </main>
  );
}
