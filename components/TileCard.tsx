"use client";

import Image, { StaticImageData } from "next/image";

interface TileCardProps {
  readonly title: string;
  readonly image: StaticImageData | string;
  readonly borderColor: string;
  readonly textColor: string;
  readonly onClick: () => void;
  readonly span: string;
  readonly mobileSpan: string;
}

export default function TileCard({
  title,
  image,
  borderColor,
  textColor,
  onClick,
  span,
  mobileSpan,
}: TileCardProps) {
  return (
    <button
      className={`${span} ${mobileSpan} h-full rounded-3xl border-4 ${borderColor} p-6 md:p-8 flex flex-col items-center justify-center bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
      onClick={onClick}
      type="button"
    >
      <div className="relative w-full h-40 md:h-48 mb-6">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h2 className={`text-center font-bold text-lg md:text-xl ${textColor}`}>
        {title}
      </h2>
    </button>
  );
}
