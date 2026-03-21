"use client";

import AddReservationModal from "@/components/foh/AddReservationModal";
import ReservationHistoryTable from "@/components/foh/ReservationHistoryTable";
import WaiterAllocations from "@/components/foh/WaiterAllocations";
import dynamic from "next/dynamic";
import { useState } from "react";
import { TabPanel, TabView } from "primereact/tabview";

const Button = dynamic(() => import("@/components/Button"), { ssr: false });

export default function ReservationsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservationRefreshKey, setReservationRefreshKey] = useState(0);

  const handleAddReservation = () => {
    setModalVisible(true);
  };

  const handleModalHide = () => {
    setModalVisible(false);
  };

  const handleReservationSuccess = () => {
    setReservationRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-12">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h1 className="text-5xl font-bold text-[#FF6B6B]">
            Customer Reservations
          </h1>
          {activeIndex === 0 ? (
            <Button
              id="addReservationButton"
              text="Add Reservation"
              type="button"
              className="bg-[#FF6B6B] text-white px-4 py-2 rounded-xl shadow-md"
              state={true}
              onClick={handleAddReservation}
            />
          ) : null}
        </div>

        <div className="overflow-hidden">
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className="custom-tabs"
          >
            <TabPanel header="Reservation History">
              <div className="pt-8">
                <ReservationHistoryTable
                  refreshTrigger={reservationRefreshKey}
                />
              </div>
            </TabPanel>

            <TabPanel header="Allocate waiters">
              <div className="pt-2">
                <WaiterAllocations />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <AddReservationModal
        visible={modalVisible}
        onHide={handleModalHide}
        onSuccess={handleReservationSuccess}
      />
    </main>
  );
}
