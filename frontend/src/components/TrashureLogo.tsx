import React from "react";
import { Leaf } from "lucide-react";

interface TrashureLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function TrashureLogo({
  className = "",
  size = "md",
}: TrashureLogoProps) {
  const boxSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const titleSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-[22px]";
  const subtitleSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Icon — sama seperti sidebar admin */}
      <div
        className={`flex ${boxSize} items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-md shadow-green-200 flex-shrink-0`}
      >
        <Leaf className={`${iconSize} text-white`} strokeWidth={2.5} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight text-[#16a34a] leading-none ${titleSize}`}
        >
          TRASHURE
        </span>
        <span
          className={`font-medium text-gray-400 leading-tight -mt-0.5 ${subtitleSize}`}
        >
          Bank Sampah
        </span>
      </div>
    </div>
  );
}
