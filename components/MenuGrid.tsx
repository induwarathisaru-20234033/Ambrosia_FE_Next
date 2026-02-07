"use client";

import Image from 'next/image';
import PurchasingInventory from '@/public/images/PurchaseInventory.png';
import KitchenBarOps from '@/public/images/KitchenBarOps.png';
import UserManagement from '@/public/images/EmpManagement.png';
import FrontHouseOps from '@/public/images/FrontHouseOps.png';

export default function MainMenuGrid() {
  const tiles = [
    {
      id: 1,
      title: "Kitchen and Bar Operations",
      image: KitchenBarOps,
      borderColor: "border-slate-400",
      textColor: "text-slate-950",
      span: "col-span-1 row-span-1",
      mobileSpan: "md:col-span-1",
    },
    {
      id: 3,
      title: "Purchasing and Inventory",
      image: PurchasingInventory,
      borderColor: "border-slate-400",
      textColor: "text-slate-950",
      span: "col-span-1 row-span-1",
      mobileSpan: "md:col-span-1",
    },
    {
      id: 4,
      title: "Front of House Operations",
      image: FrontHouseOps,
      borderColor: "border-slate-400",
      textColor: "text-slate-950",
      span: "col-span-1 row-span-1",
      mobileSpan: "md:col-span-1",
    },
    {
      id: 2,
      title: "User Management",
      image: UserManagement,
      borderColor: "border-slate-400",
      textColor: "text-slate-950",
      span: "col-span-1 row-span-1",
      mobileSpan: "md:col-span-1",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-center text-4xl md:text-5xl font-light text-gray-800">
          Welcome to <span className="font-bold text-orange-500">Ambrosia.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`${tile.span} ${tile.mobileSpan} rounded-3xl border-4 ${tile.borderColor} p-6 md:p-8 flex flex-col items-center justify-center bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
          >
            <div className="relative w-full h-40 md:h-48 mb-6">
              <Image
                src={tile.image || "/placeholder.svg"}
                alt={tile.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h2 className={`text-center font-bold text-lg md:text-xl ${tile.textColor}`}>
              {tile.title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
