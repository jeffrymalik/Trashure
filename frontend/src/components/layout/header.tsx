'use client';

import React from 'react';
import { ChevronDown, CalendarDays } from 'lucide-react';
import NotificationBell from './NotificationBell';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  showNotif?: boolean;
  showDate?: boolean;
}

export default function AppHeader({ title, subtitle, breadcrumbs, showNotif = true, showDate = true }: AppHeaderProps) {
  const today = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const dateStr = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="mb-4 sm:mb-5 lg:mb-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left: Title */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">{subtitle}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Notification Bell */}
          {showNotif && <NotificationBell />}

          {/* Date - Hidden on mobile */}
          {showDate && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg sm:rounded-xl bg-white border border-gray-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 shadow-sm flex-shrink-0">
              <CalendarDays className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400 flex-shrink-0" strokeWidth={1.8} />
              <span className="font-medium whitespace-nowrap text-xs sm:text-sm">{dateStr}</span>
              <ChevronDown className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-400 flex-shrink-0" />
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumbs Row if provided */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3 overflow-x-auto pb-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="text-gray-300 flex-shrink-0">&gt;</span>}
                {isLast ? (
                  <span className="font-semibold text-[#16a34a] whitespace-nowrap">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-500 whitespace-nowrap">{crumb.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}
    </div>
  );
}
