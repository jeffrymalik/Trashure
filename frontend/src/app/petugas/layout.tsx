'use client';

import Sidebar from '@/components/layout/sidebar';
import { petugasMenus } from '@/config/menus/petugas';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function PetugasLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <div className="shrink-0" style={{ '--sidebar-w': collapsed ? '72px' : '260px' } as React.CSSProperties}>
        <Sidebar menuSections={petugasMenus} />
      </div>
      <main className="flex-1 p-3 sm:p-4 lg:p-5 xl:p-6 mt-12 lg:mt-0 min-w-0 overflow-x-hidden">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PetugasLayoutInner>{children}</PetugasLayoutInner>
    </SidebarProvider>
  );
}
