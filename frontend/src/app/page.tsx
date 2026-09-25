import React from "react";
import TrashureLogo from "@/components/TrashureLogo";
import BankSampahIllustration from "@/components/BankSampahIllustration";
import LeafDecorations from "@/components/LeafDecorations";
import LoginForm from "@/components/LoginForm";
import { Users, Recycle, TreePine } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen lg:h-screen lg:max-h-screen w-full bg-gradient-to-br from-[#eaf4ec] via-[#dfefe4] to-[#eaf3ec] flex flex-col justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-[#167e41]/20 selection:text-[#167e41]">
      {/* Ambient Leaf Floating Background Accents */}
      <LeafDecorations />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-2 flex items-center justify-between flex-shrink-0">
        <TrashureLogo size="md" />
      </header>

      {/* Main Content Area - Vertically balanced, strictly zero scroll on desktop */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-10 my-auto py-3 sm:py-4">

        {/* Left Column: Overline, Headline, Subtitle, Stats Card & Illustration (Cohesive vertical unit) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-start max-w-[500px] xl:max-w-[560px] pr-2 space-y-3 xl:space-y-3.5">
          {/* Overline & Headline Block */}
          <div>
            <div className="flex items-center gap-2 text-[11px] xl:text-xs font-bold tracking-widest text-[#15803d] uppercase mb-1.5 select-none">
              <span>KELOLA SAMPAH, RAIH MANFAAT</span>
              <span className="w-8 xl:w-10 h-[1.5px] bg-emerald-400/70 inline-block"></span>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-[36px] font-black text-gray-900 tracking-tight leading-[1.16] mb-2">
              Sampah Hari Ini,<br />
              <span className="text-[#15803d] inline-flex items-center gap-2">
                Masa Depan Lebih Bersih
                <span className="inline-flex items-center gap-1 -mt-1.5">
                  <svg className="w-5 h-5 text-[#15803d] rotate-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6.2 7.5 4.25 9.5 3 11.5l1.5 1C6 10 9 8 17 8z" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-xs xl:text-sm text-gray-600 leading-relaxed max-w-md">
              <strong className="font-semibold text-emerald-950">Kelola sampah, raih manfaat.</strong> Bersama Trashure, setiap sampah terpilah punya nilai nyata untuk lingkungan yang lebih hijau.
            </p>
          </div>

          {/* Stats Card - Placed directly below text with clean spacing */}
          <div className="w-full max-w-[460px] xl:max-w-[480px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white/80 flex items-center justify-between select-none">
            {/* 1. 1.250+ Pengguna Aktif */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-gray-900 leading-tight">1.250+</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">Pengguna Aktif</div>
              </div>
            </div>

            {/* 2. 12 Ton+ Sampah Terkelola */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 px-2 sm:px-3 border-x border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center flex-shrink-0">
                <Recycle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-gray-900 leading-tight">12 Ton+</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">Sampah Terkelola</div>
              </div>
            </div>

            {/* 3. Lingkungan Lebih Hijau */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-2 sm:pl-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center flex-shrink-0">
                <TreePine className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-emerald-800 leading-tight">Lingkungan</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">Lebih Hijau</div>
              </div>
            </div>
          </div>

          {/* Bank Sampah Illustration with wooden signboard - Sits comfortably below without dead gap */}
          <div className="w-full max-w-[360px] xl:max-w-[400px] pt-1">
            <BankSampahIllustration className="w-full drop-shadow-sm" />
          </div>
        </div>

        {/* Mobile / Tablet Branding Header (Visible on < lg, neat and responsive) */}
        <div className="lg:hidden w-full max-w-sm sm:max-w-md text-center px-2 mb-2 sm:mb-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-[#15803d] uppercase mb-1">
            <span>KELOLA SAMPAH, RAIH MANFAAT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
            Sampah Hari Ini,{" "}
            <span className="text-[#15803d]">Masa Depan Lebih Bersih</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-600 mt-1 max-w-xs mx-auto">
            <strong className="font-semibold text-emerald-950">Kelola sampah, raih manfaat.</strong> Bersama Trashure, setiap sampah punya nilai untuk lingkungan lebih hijau.
          </p>

          {/* Mobile Quick Stats Pills */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 border border-emerald-100 text-[10px] sm:text-[11px] font-semibold text-gray-800 shadow-2xs">
              <Users className="w-3 h-3 text-[#15803d]" /> 1.250+ Pengguna
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 border border-emerald-100 text-[10px] sm:text-[11px] font-semibold text-gray-800 shadow-2xs">
              <Recycle className="w-3 h-3 text-[#15803d]" /> 12 Ton+ Sampah
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 border border-emerald-100 text-[10px] sm:text-[11px] font-semibold text-gray-800 shadow-2xs">
              <TreePine className="w-3 h-3 text-[#15803d]" /> Lingkungan Hijau
            </span>
          </div>
        </div>

        {/* Right Column: Generous, Elevated Login Card */}
        <div className="w-full lg:flex-1 flex flex-col items-center justify-center flex-shrink-0">
          <LoginForm />
        </div>

      </div>

      {/* Bottom Footer */}
      <footer className="relative z-10 text-center py-2.5 sm:py-3 px-4 text-xs text-gray-500/80 tracking-normal select-none flex-shrink-0">
        <p>© 2026 Trashure. Semua hak dilindungi.</p>
      </footer>
    </main>
  );
}
