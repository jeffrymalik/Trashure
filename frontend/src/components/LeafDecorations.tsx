import React from "react";

export default function LeafDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top right leaf 1 */}
      <div className="absolute -top-12 right-12 w-64 h-64 opacity-25 animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 10 C20 10 10 40 15 75 C45 80 85 70 85 40 C85 10 50 10 50 10 Z"
            fill="#80b996"
          />
          <path
            d="M50 10 C35 45 15 75 15 75"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Top right floating small leaf */}
      <div className="absolute top-28 right-[18%] w-24 h-24 opacity-20 animate-float-reverse">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 15 C30 15 20 35 25 65 C50 70 75 60 75 35 C75 15 50 15 50 15 Z"
            fill="#a1d1b3"
          />
        </svg>
      </div>

      {/* Far Right giant decorative leaf */}
      <div className="absolute top-1/3 -right-24 w-96 h-96 opacity-20 animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M60 5 C25 5 10 40 20 85 C60 90 95 70 95 35 C95 5 60 5 60 5 Z"
            fill="#9ecaa9"
          />
          <path
            d="M60 5 C40 45 20 85 20 85"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Bottom right floating leaf */}
      <div className="absolute bottom-16 right-[12%] w-32 h-32 opacity-15 animate-float-reverse">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M45 10 C25 10 15 30 20 60 C45 65 70 55 70 30 C70 10 45 10 45 10 Z"
            fill="#75b08c"
          />
        </svg>
      </div>

      {/* Center ambient small leaf */}
      <div className="absolute top-[35%] left-[22%] w-16 h-16 opacity-20 animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 20 C35 20 25 35 30 55 C45 60 65 55 65 35 C65 20 50 20 50 20 Z"
            fill="#90c8a3"
          />
        </svg>
      </div>
    </div>
  );
}
