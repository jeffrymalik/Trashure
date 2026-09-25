import React from 'react';
import { Wine, Package, Boxes, ShoppingBag, Leaf } from 'lucide-react';

interface WasteIconProps {
  type: string;
  size?: number;
  className?: string;
}

// Ikon sampah mengikuti gaya warga (WasteBadgeIcon):
// badge kotak berwarna + ikon Lucide berdasarkan nama jenis sampah.
export default function WasteIcon({ type, size = 16, className = '' }: WasteIconProps) {
  const lower = (type || '').toLowerCase();

  // Samakan skala badge dengan size yang diminta
  // (warga memakai h-8 w-8 + ikon h-4 untuk daftar, h-11 untuk katalog)
  const badgeSize = size <= 14 ? 'h-7 w-7' : size >= 18 ? 'h-9 w-9' : 'h-8 w-8';
  const iconSize = size <= 14 ? 'h-3.5 w-3.5' : size >= 18 ? 'h-[18px] w-[18px]' : 'h-4 w-4';

  if (lower.includes('botol') || lower.includes('pet')) {
    return (
      <div className={`flex ${badgeSize} items-center justify-center rounded-lg bg-blue-50 text-blue-500 border border-blue-100 flex-shrink-0 ${className}`}>
        <Wine className={iconSize} />
      </div>
    );
  }

  if (lower.includes('kardus') || lower.includes('kertas') || lower.includes('koran')) {
    return (
      <div className={`flex ${badgeSize} items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0 ${className}`}>
        <Package className={iconSize} />
      </div>
    );
  }

  if (lower.includes('kaleng') || lower.includes('aluminium') || lower.includes('besi') || lower.includes('logam')) {
    return (
      <div className={`flex ${badgeSize} items-center justify-center rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0 ${className}`}>
        <Boxes className={iconSize} />
      </div>
    );
  }

  if (lower.includes('plastik') || lower.includes('kresek')) {
    return (
      <div className={`flex ${badgeSize} items-center justify-center rounded-lg bg-pink-50 text-pink-500 border border-pink-100 flex-shrink-0 ${className}`}>
        <ShoppingBag className={iconSize} />
      </div>
    );
  }

  return (
    <div className={`flex ${badgeSize} items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0 ${className}`}>
      <Leaf className={iconSize} />
    </div>
  );
}
