"use client";

import TileCard from "@/components/TileCard";
import CustomerReservation from "@/public/images/CustomerReservation.png";
import TableManagement from "@/public/images/TableManagement.png";
import Configuration from "@/public/images/Configurations.png";
import { useRouter } from "next/navigation";

export default function ViewFrontOfHousePage() {
  const router = useRouter();

  const features = [
    {
      id: "reservation",
      title: "Customer Reservation Management",
      image: CustomerReservation,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/foh/configurations"),
    },
    {
      id: "table",
      title: "Table Management & Waiter Allocation",
      image: TableManagement,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => console.log("Table Management clicked"),
    },
    {
      id: "config",
      title: "Configurations",
      image: Configuration,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => console.log("Configurations clicked"),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 flex flex-col justify-center items-start h-full">
            <h1 className="text-6xl md:text-7xl font-bold text-[#FF6B6B] leading-tight text-left">
              Front of
              <br />
              House
              <br />
              Operations
            </h1>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">
              <div className="h-full">
                <TileCard
                  title={features[0].title}
                  image={features[0].image}
                  borderColor={features[0].borderColor}
                  textColor={features[0].textColor}
                  onClick={features[0].onClick}
                  span="w-full"
                  mobileSpan="w-full"
                />
              </div>

              <div className="h-full">
                <TileCard
                  title={features[1].title}
                  image={features[1].image}
                  borderColor={features[1].borderColor}
                  textColor={features[1].textColor}
                  onClick={features[1].onClick}
                  span="w-full"
                  mobileSpan="w-full"
                />
              </div>

              <div className="md:col-span-2 h-full flex justify-center">
                <div className="w-full md:w-1/2">
                  <TileCard
                    title={features[2].title}
                    image={features[2].image}
                    borderColor={features[2].borderColor}
                    textColor={features[2].textColor}
                    onClick={features[2].onClick}
                    span="w-full"
                    mobileSpan="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
