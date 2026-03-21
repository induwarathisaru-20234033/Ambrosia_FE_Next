"use client";

import TileCard from "@/components/TileCard";
import { useRouter } from "next/navigation";
import InventoryImage from "@/public/images/InventoryImage.png";
import GRNImage from "@/public/images/GRNImage.png";
import GIImage from "@/public/images/GIImage.png";
import PRImage from "@/public/images/PRImage.png";
import WastageImage from "@/public/images/WastageImage.png";

export default function InventoryAndProcurementPage() {
  const router = useRouter();

  const features = [
    {
      id: "inventory",
      title: "Inventory Management",
      image: InventoryImage,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/iap/inventory/items"),
    },
    {
      id: "grn",
      title: "Goods Receipt Notes (GRN) Management",
      image: GRNImage,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/iap/good-receipt-notes"),
    },
    {
      id: "gi",
      title: "Goods Issue (GI) Management",
      image: GIImage,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/iap/good-issue"),
    },
    {
      id: "pr",
      title: "Purchase Requisitions (PR) Management",
      image: PRImage,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/iap/purchase-requests"),
    },
    {
      id: "wastage",
      title: "Wastage Management",
      image: WastageImage,
      borderColor: "border-gray-400",
      textColor: "text-black",
      onClick: () => router.push("/menu/iap/wastage"),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 flex flex-col justify-center items-start h-full">
            <h1 className="text-6xl md:text-7xl font-bold text-[#15B097] leading-tight text-left">
              Inventory
              <br />
              and
              <br />
              Procurement
            </h1>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col gap-8">
              {/* Row 1: Inventory + Purchase Requisitions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    title={features[3].title}
                    image={features[3].image}
                    borderColor={features[3].borderColor}
                    textColor={features[3].textColor}
                    onClick={features[3].onClick}
                    span="w-full"
                    mobileSpan="w-full"
                  />
                </div>
              </div>

              {/* Row 2: GRN + GI + Wastage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div className="h-full">
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
                <div className="h-full">
                  <TileCard
                    title={features[4].title}
                    image={features[4].image}
                    borderColor={features[4].borderColor}
                    textColor={features[4].textColor}
                    onClick={features[4].onClick}
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
