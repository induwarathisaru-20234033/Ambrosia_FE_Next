"use client";

import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import ServiceHoursAndRules from "@/components/foh/ServiceHoursAndRules";

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
                <div className="text-center py-12">
                  <p className="text-gray-600">Floor Map content coming soon</p>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </main>
  );
}
