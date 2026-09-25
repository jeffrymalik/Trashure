'use client';

import Sidebar from '@/components/layout/sidebar';
import { pengepulMenus } from '@/config/menus/pengepul';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function PengepulLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <div className="shrink-0" style={{ '--sidebar-w': collapsed ? '72px' : '260px' } as React.CSSProperties}>
        <Sidebar menuSections={pengepulMenus} />
      </div>
      <main className="flex-1 p-4 sm:p-5 lg:p-6 mt-12 lg:mt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}

export default function PengepulLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PengepulLayoutInner>{children}</PengepulLayoutInner>
    </SidebarProvider>
  );
}
