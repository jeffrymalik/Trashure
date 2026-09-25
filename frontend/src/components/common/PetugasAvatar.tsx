import React from 'react';

interface PetugasAvatarProps {
  size?: number;
  className?: string;
}

export default function PetugasAvatar({ size = 40, className = '' }: PetugasAvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-[#e8f5e9] border-2 border-[#81c784] shadow-sm flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="50" fill="#E8F5E9" />

        {/* Uniform / Shoulders */}
        <path
          d="M20 96 C20 74 35 68 50 68 C65 68 80 74 80 96 Z"
          fill="#16A34A"
        />
        {/* Shirt collar / neck inner */}
        <polygon points="42,68 58,68 50,78" fill="#FFFFFF" />
        <polygon points="46,75 54,75 50,84" fill="#E2E8F0" />

        {/* Neck */}
        <rect x="44" y="58" width="12" height="12" fill="#F5CBA7" rx="2" />

        {/* Ears */}
        <circle cx="32" cy="48" r="5" fill="#F5CBA7" />
        <circle cx="68" cy="48" r="5" fill="#F5CBA7" />

        {/* Head / Face */}
        <ellipse cx="50" cy="48" rx="18" ry="20" fill="#FADBD8" />
        <ellipse cx="50" cy="48" rx="17" ry="19" fill="#F5CBA7" />

        {/* Hair sideburns */}
        <path d="M33 42 C33 46 34 50 36 50 C36 44 35 40 33 42 Z" fill="#4A3728" />
        <path d="M67 42 C67 46 66 50 64 50 C64 44 65 40 67 42 Z" fill="#4A3728" />

        {/* Eyes */}
        <ellipse cx="43" cy="47" rx="2" ry="2.5" fill="#2C3E50" />
        <ellipse cx="57" cy="47" rx="2" ry="2.5" fill="#2C3E50" />

        {/* Eyebrows */}
        <path d="M40 42 Q43 40 46 42" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54 42 Q57 40 60 42" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />

        {/* Nose */}
        <path d="M50 47 L49 51 L51 51" stroke="#D5A582" strokeWidth="1.2" strokeLinecap="round" />

        {/* Smile */}
        <path d="M46 55 Q50 58 54 55" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />

        {/* Petugas Cap / Hat */}
        {/* Cap Crown */}
        <path
          d="M31 38 C31 23 40 18 50 18 C60 18 69 23 69 38 Z"
          fill="#15803D"
        />
        {/* Cap Visor / Brim */}
        <path
          d="M26 38 C28 32 40 33 50 33 C60 33 72 32 74 38 C70 42 58 43 50 43 C42 43 30 42 26 38 Z"
          fill="#166534"
        />
        {/* Cap Badge / Detail */}
        <circle cx="50" cy="27" r="3.5" fill="#FACC15" />
        <circle cx="50" cy="27" r="1.8" fill="#15803D" />
      </svg>
    </div>
  );
}
