import React from "react";

export default function BankSampahIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 120 520 290"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
            .sign-font {
              font-family: 'Caveat', 'Dancing Script', 'Segoe Print', 'Brush Script MT', cursive, sans-serif;
            }
          `}</style>

          {/* Gradients */}
          <linearGradient id="skyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eaf5ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dcefe2" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dbe8df" />
            <stop offset="100%" stopColor="#c5d8cb" />
          </linearGradient>

          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#417b57" />
            <stop offset="100%" stopColor="#2c5c3e" />
          </linearGradient>

          <linearGradient id="sackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3ca265" />
            <stop offset="50%" stopColor="#2c7d4d" />
            <stop offset="100%" stopColor="#1e5f38" />
          </linearGradient>

          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f7ecd7" />
            <stop offset="100%" stopColor="#dec097" />
          </linearGradient>

          <linearGradient id="woodPost" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9c6d40" />
            <stop offset="50%" stopColor="#875a2f" />
            <stop offset="100%" stopColor="#6e4620" />
          </linearGradient>

          <linearGradient id="greenBin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#279659" />
            <stop offset="100%" stopColor="#1c7544" />
          </linearGradient>

          <linearGradient id="yellowBin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="blueBin" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2e86de" />
            <stop offset="100%" stopColor="#1e6ab5" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.1" />
          </filter>

          <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= 1. SUN, CLOUDS & SKYLINE ================= */}
        <g opacity="0.9">
          {/* Warm Glowing Sun */}
          <circle cx="355" cy="172" r="42" fill="#fef08a" opacity="0.7" filter="url(#sunGlow)" />
          <circle cx="355" cy="172" r="38" fill="#fde047" opacity="0.45" />

          {/* Soft White Cloud */}
          <g opacity="0.85">
            <ellipse cx="385" cy="186" rx="34" ry="12" fill="#ffffff" />
            <circle cx="374" cy="181" r="14" fill="#ffffff" />
            <circle cx="395" cy="183" r="11" fill="#ffffff" />
          </g>

          {/* Flying Birds */}
          <path d="M410 138 Q415 133 420 138 Q425 133 430 138" stroke="#487857" strokeWidth="1.6" fill="none" opacity="0.65" strokeLinecap="round" />
          <path d="M432 146 Q436 142 440 146 Q444 142 448 146" stroke="#487857" strokeWidth="1.3" fill="none" opacity="0.55" strokeLinecap="round" />

          {/* Distant City Skyline Silhouettes */}
          <path
            d="M265 270 L265 210 L280 210 L280 230 L290 230 L290 195 L295 186 L300 195 L300 270 Z"
            fill="#a6cfb3"
            opacity="0.4"
          />
          <path
            d="M300 270 L300 205 L314 205 L314 190 L319 180 L324 190 L324 270 Z"
            fill="#9ecab0"
            opacity="0.4"
          />
          <path
            d="M324 270 L324 218 L338 218 L338 200 L343 194 L348 200 L348 270 Z"
            fill="#abd3b9"
            opacity="0.35"
          />
        </g>

        {/* ================= 2. BACKGROUND FOLIAGE & HILLS ================= */}
        <g opacity="0.9">
          {/* Rolling back hills */}
          <path
            d="M-20 280 C20 220 80 230 120 250 C160 210 230 220 270 260 C300 240 370 245 420 285 C460 260 510 270 540 295 L540 420 L-20 420 Z"
            fill="#bddbc5"
          />
          {/* Soft tree canopies */}
          <circle cx="20" cy="240" r="48" fill="#a4cdae" />
          <circle cx="65" cy="235" r="50" fill="#95c2a0" />
          <circle cx="125" cy="225" r="55" fill="#8cb996" />
          <circle cx="195" cy="235" r="52" fill="#9ecaa9" />
          <circle cx="265" cy="250" r="46" fill="#88b894" />
          <circle cx="330" cy="265" r="45" fill="#9dc8a6" />
        </g>

        {/* Mid-ground trees (wrapping around the building naturally) */}
        <g>
          <ellipse cx="20" cy="275" rx="42" ry="46" fill="#6ba077" />
          <ellipse cx="50" cy="285" rx="42" ry="46" fill="#75a881" />
          <ellipse cx="95" cy="295" rx="38" ry="38" fill="#679b73" />
          <ellipse cx="230" cy="295" rx="48" ry="52" fill="#6ba077" />
          <ellipse cx="280" cy="315" rx="44" ry="44" fill="#7ba884" />
          <ellipse cx="485" cy="320" rx="46" ry="44" fill="#82b38d" />
        </g>

        {/* ================= 3. BANK SAMPAH BUILDING ================= */}
        <g filter="url(#softShadow)">
          {/* Base Wall */}
          <path
            d="M25 220 L195 235 L195 330 L25 330 Z"
            fill="url(#wallGrad)"
          />

          {/* Roof Overhang */}
          <polygon
            points="15,215 205,230 200,245 10,230"
            fill="url(#roofGrad)"
          />
          {/* Roof Top Trim */}
          <polygon
            points="15,215 205,230 205,233 15,218"
            fill="#75b38d"
          />

          {/* Door Entrance */}
          <rect
            x="85"
            y="245"
            width="50"
            height="85"
            rx="2"
            fill="#6d947b"
          />
          {/* Door Glass Panes */}
          <rect x="90" y="252" width="18" height="70" rx="1" fill="#a8d3b8" opacity="0.8" />
          <rect x="112" y="252" width="18" height="70" rx="1" fill="#a8d3b8" opacity="0.8" />
          {/* Door Handles */}
          <rect x="106" y="285" width="2" height="12" rx="1" fill="#ffffff" />
          <rect x="112" y="285" width="2" height="12" rx="1" fill="#ffffff" />

          {/* Window Left */}
          <rect
            x="38"
            y="252"
            width="34"
            height="40"
            rx="2"
            fill="#ffffff"
          />
          <rect
            x="41"
            y="255"
            width="28"
            height="34"
            rx="1"
            fill="#8ebdc0"
          />
          {/* Window Divider */}
          <line x1="55" y1="255" x2="55" y2="289" stroke="#ffffff" strokeWidth="2" />
          <line x1="41" y1="272" x2="69" y2="272" stroke="#ffffff" strokeWidth="2" />

          {/* Sign Board "BANK SAMPAH" */}
          <rect
            x="60"
            y="233"
            width="100"
            height="20"
            rx="3"
            fill="#36744f"
            stroke="#4e996c"
            strokeWidth="1.5"
          />
          <text
            x="110"
            y="247"
            fill="#ffffff"
            fontSize="10.5"
            fontWeight="bold"
            letterSpacing="0.8"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            BANK SAMPAH
          </text>

          {/* Building Porch / Steps */}
          <path
            d="M75 330 L145 330 L155 340 L65 340 Z"
            fill="#c4d8cc"
          />
          <path
            d="M60 340 L160 340 L170 350 L50 350 Z"
            fill="#b5cdbe"
          />
        </g>

        {/* ================= 4. GROUND HILLS & FOREGROUND BUSHES ================= */}
        <g>
          {/* Back ground hill */}
          <path
            d="M-20 355 Q140 335 290 350 T540 355 L540 420 L-20 420 Z"
            fill="#d2e7d7"
            opacity="0.8"
          />
          {/* Foreground lush lawn hill spanning full width */}
          <path
            d="M-20 370 Q160 350 350 365 T540 372 L540 420 L-20 420 Z"
            fill="#c1deca"
            opacity="0.9"
          />

          {/* Foreground Bushes */}
          <ellipse cx="25" cy="342" rx="30" ry="24" fill="#588d66" />
          <ellipse cx="195" cy="348" rx="32" ry="26" fill="#538861" />
          <ellipse cx="232" cy="360" rx="26" ry="20" fill="#649971" />
          <ellipse cx="490" cy="365" rx="32" ry="24" fill="#699e76" />
        </g>

        {/* Cute White Daisy Flowers on Left Lawn (matching mockup) */}
        <g>
          {/* Flower 1 */}
          <g transform="translate(28, 350)">
            <circle cx="0" cy="-4" r="2.8" fill="#ffffff" />
            <circle cx="4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.2" fill="#f59e0b" />
          </g>
          {/* Flower 2 */}
          <g transform="translate(48, 366) scale(0.85)">
            <circle cx="0" cy="-4" r="2.8" fill="#ffffff" />
            <circle cx="4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.2" fill="#f59e0b" />
          </g>
          {/* Flower 3 */}
          <g transform="translate(16, 362) scale(0.75)">
            <circle cx="0" cy="-4" r="2.8" fill="#ffffff" />
            <circle cx="4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-2.5" cy="3.5" r="2.8" fill="#ffffff" />
            <circle cx="-4" cy="-1.5" r="2.8" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.2" fill="#f59e0b" />
          </g>
        </g>

        {/* ================= 5. GREEN RECYCLE SACK (BAG) ================= */}
        {/* Positioned between the bins and signboard, with recycle symbol clearly visible above bins */}
        <g filter="url(#softShadow)">
          {/* Sack Top Ruffle / Tie Knot */}
          <path
            d="M222 232 C217 222 227 215 232 219 C237 215 247 222 242 232 Z"
            fill="#236e40"
          />
          <ellipse cx="232" cy="232" rx="10" ry="4" fill="#1b5a33" />

          {/* Sack Body - Plump, rounded eco bag */}
          <path
            d="M222 232 C200 242 176 270 176 312 C176 358 206 372 232 372 C258 372 288 358 288 312 C288 270 264 242 242 232 Z"
            fill="url(#sackGrad)"
          />

          {/* White Badge with Green Recycle ♻️ - Raised so it's beautifully visible! */}
          <circle cx="232" cy="284" r="21" fill="#ffffff" />
          {/* 3-Arrow Recycle Symbol */}
          <g transform="translate(219, 271) scale(0.9)">
            <path
              d="M15 3 L19 8 L16 8 C16 11 14 14 11 16 L9.5 14 C12 12.5 13.5 10 13.5 8 L11 8 Z"
              fill="#1b8744"
            />
            <path
              d="M26 19 L21 21 L22.5 18.5 C20.5 16.5 17.5 15.5 14.5 16.5 L14 14 C18 12.5 22 13.5 24.5 16.5 L26 14.5 Z"
              fill="#1b8744"
            />
            <path
              d="M5 21 L7 16 L8.5 18.5 C11 17.5 14 18 16 20.5 L14.5 22.5 C13 20.5 10.5 20 8.5 21 L10 23.5 Z"
              fill="#1b8744"
            />
          </g>
        </g>

        {/* ================= 6. 3 TRASH BINS (ORGANIK, ANORGANIK, KERTAS) ================= */}

        {/* 1. GREEN BIN (ORGANIK) */}
        <g transform="translate(56, 305)" filter="url(#softShadow)">
          {/* Wheel Shadows */}
          <ellipse cx="8" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          <ellipse cx="48" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          {/* Wheels */}
          <circle cx="8" cy="88" r="7" fill="#374151" />
          <circle cx="8" cy="88" r="3" fill="#9ca3af" />
          <circle cx="48" cy="88" r="7" fill="#374151" />
          <circle cx="48" cy="88" r="3" fill="#9ca3af" />

          {/* Body */}
          <polygon points="4,20 52,20 46,85 10,85" fill="url(#greenBin)" />
          {/* Lid */}
          <rect x="0" y="10" width="56" height="12" rx="3" fill="#2eb86c" />
          <rect x="18" y="5" width="20" height="6" rx="2" fill="#239656" />

          {/* Badge: Leaf */}
          <circle cx="28" cy="45" r="12" fill="#ffffff" opacity="0.95" />
          <path
            d="M28 39 C24 39 21 43 23 48 C28 48 31 45 31 39 Z"
            fill="#1b8744"
          />
          <path
            d="M28 39 C29 44 26 48 23 48"
            stroke="#ffffff"
            strokeWidth="0.8"
          />

          {/* Text: ORGANIK */}
          <text
            x="28"
            y="70"
            fill="#ffffff"
            fontSize="6.8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.4"
          >
            ORGANIK
          </text>
        </g>

        {/* 2. YELLOW BIN (ANORGANIK) */}
        <g transform="translate(126, 305)" filter="url(#softShadow)">
          {/* Wheel Shadows */}
          <ellipse cx="8" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          <ellipse cx="48" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          {/* Wheels */}
          <circle cx="8" cy="88" r="7" fill="#374151" />
          <circle cx="8" cy="88" r="3" fill="#9ca3af" />
          <circle cx="48" cy="88" r="7" fill="#374151" />
          <circle cx="48" cy="88" r="3" fill="#9ca3af" />

          {/* Body */}
          <polygon points="4,20 52,20 46,85 10,85" fill="url(#yellowBin)" />
          {/* Lid */}
          <rect x="0" y="10" width="56" height="12" rx="3" fill="#fbbf24" />
          <rect x="18" y="5" width="20" height="6" rx="2" fill="#d97706" />

          {/* Badge: Bottle */}
          <circle cx="28" cy="45" r="12" fill="#ffffff" opacity="0.95" />
          <rect x="25" y="38" width="6" height="3" rx="1" fill="#d97706" />
          <path
            d="M24 41 L32 41 L33 44 L33 51 C33 52 32 53 31 53 L25 53 C24 53 23 52 23 51 L23 44 Z"
            fill="#d97706"
          />

          {/* Text: ANORGANIK (Comfortably spaced above bottom edge) */}
          <text
            x="28"
            y="69"
            fill="#ffffff"
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.2"
          >
            ANORGANIK
          </text>
        </g>

        {/* 3. BLUE BIN (KERTAS) */}
        <g transform="translate(196, 305)" filter="url(#softShadow)">
          {/* Wheel Shadows */}
          <ellipse cx="8" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          <ellipse cx="48" cy="94" rx="7" ry="2.5" fill="#1f2937" opacity="0.25" />
          {/* Wheels */}
          <circle cx="8" cy="88" r="7" fill="#374151" />
          <circle cx="8" cy="88" r="3" fill="#9ca3af" />
          <circle cx="48" cy="88" r="7" fill="#374151" />
          <circle cx="48" cy="88" r="3" fill="#9ca3af" />

          {/* Body */}
          <polygon points="4,20 52,20 46,85 10,85" fill="url(#blueBin)" />
          {/* Lid */}
          <rect x="0" y="10" width="56" height="12" rx="3" fill="#60a5fa" />
          <rect x="18" y="5" width="20" height="6" rx="2" fill="#2563eb" />

          {/* Badge: Paper */}
          <circle cx="28" cy="45" r="12" fill="#ffffff" opacity="0.95" />
          <path
            d="M23 39 L30 39 L33 42 L33 51 C33 52 32 53 31 53 L25 53 C24 53 23 52 23 51 Z"
            fill="#1d629b"
          />
          <polygon points="30,39 30,42 33,42" fill="#ffffff" />
          <line x1="25" y1="45" x2="31" y2="45" stroke="#ffffff" strokeWidth="1" />
          <line x1="25" y1="48" x2="29" y2="48" stroke="#ffffff" strokeWidth="1" />

          {/* Text: KERTAS */}
          <text
            x="28"
            y="70"
            fill="#ffffff"
            fontSize="6.8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.4"
          >
            KERTAS
          </text>
        </g>

        {/* ================= 7. WOODEN SIGNBOARD "SAMPAH KECIL PERUBAHAN BESAR" ================= */}
        <g filter="url(#softShadow)">
          {/* Post Shadows */}
          <ellipse cx="320" cy="385" rx="9" ry="3.5" fill="#1f2937" opacity="0.2" />
          <ellipse cx="425" cy="385" rx="9" ry="3.5" fill="#1f2937" opacity="0.2" />

          {/* Wooden Posts (firmly planted on lawn) */}
          <rect x="315" y="325" width="11" height="58" rx="2.5" fill="url(#woodPost)" stroke="#5e3917" strokeWidth="1" />
          <rect x="420" y="325" width="11" height="58" rx="2.5" fill="url(#woodPost)" stroke="#5e3917" strokeWidth="1" />

          {/* Grass Tuft at post bases */}
          <path d="M312 383 Q314 376 311 372 Q316 376 317 383" stroke="#487e58" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M428 383 Q430 376 433 372 Q427 376 425 383" stroke="#487e58" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Wooden Board Body - Warm honey wood tone with rounded bevel */}
          <rect
            x="282"
            y="256"
            width="174"
            height="86"
            rx="10"
            fill="url(#woodGrad)"
            stroke="#a47842"
            strokeWidth="3"
          />
          {/* Inner subtle wood frame */}
          <rect
            x="287"
            y="261"
            width="164"
            height="76"
            rx="7"
            fill="none"
            stroke="#caa26d"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* 4 Corner Screws / Nails */}
          <circle cx="294" cy="268" r="2.5" fill="#6f4820" />
          <circle cx="293.5" cy="267.5" r="1" fill="#dfbe98" />
          <circle cx="444" cy="268" r="2.5" fill="#6f4820" />
          <circle cx="443.5" cy="267.5" r="1" fill="#dfbe98" />
          <circle cx="294" cy="330" r="2.5" fill="#6f4820" />
          <circle cx="293.5" cy="329.5" r="1" fill="#dfbe98" />
          <circle cx="444" cy="330" r="2.5" fill="#6f4820" />
          <circle cx="443.5" cy="329.5" r="1" fill="#dfbe98" />

          {/* Charming Leaf Accent Left Top */}
          <g transform="translate(295, 276) rotate(-25) scale(0.65)">
            <path
              d="M0 12 C4 4 14 0 20 0 C20 8 16 18 8 20 C2 21 0 16 0 12 Z"
              fill="#26633b"
            />
            <path
              d="M0 12 Q8 10 18 2"
              stroke="#8bc34a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Signboard Text: Line 1 - Sampah Kecil */}
          <text
            x="372"
            y="293"
            fill="#1e4d2b"
            fontSize="21"
            fontWeight="bold"
            fontStyle="italic"
            className="sign-font"
            textAnchor="middle"
            letterSpacing="0.2"
          >
            Sampah Kecil
          </text>

          {/* Signboard Text: Line 2 - Perubahan Besar */}
          <text
            x="372"
            y="323"
            fill="#1e4d2b"
            fontSize="21"
            fontWeight="bold"
            fontStyle="italic"
            className="sign-font"
            textAnchor="middle"
            letterSpacing="0.2"
          >
            Perubahan Besar
          </text>

          {/* Charming Leaf Accent Right Bottom */}
          <g transform="translate(432, 318) rotate(35) scale(0.65)">
            <path
              d="M0 12 C4 4 14 0 20 0 C20 8 16 18 8 20 C2 21 0 16 0 12 Z"
              fill="#26633b"
            />
            <path
              d="M0 12 Q8 10 18 2"
              stroke="#8bc34a"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
