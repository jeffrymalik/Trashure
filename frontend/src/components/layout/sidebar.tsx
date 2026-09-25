'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronDown, ChevronRight, Leaf, Menu, X, PanelLeftClose, PanelLeftOpen, User } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  children?: { label: string; icon: React.ElementType; href?: string; download?: string }[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  menuSections: MenuSection[];
  logo?: {
    label?: string;
    subtitle?: string;
  };
  profileCard?: {
    name: string;
    role: string;
    href: string;
  };
}

export default function Sidebar({ menuSections, logo, profileCard }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed } = useSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isChildActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('trashure_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      if (token) {
        await fetch(`${apiUrl}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      }
    } catch {
      // Ignore error, proceed with local cleanup
    } finally {
      localStorage.removeItem('trashure_token');
      localStorage.removeItem('trashure_user');
      document.cookie = 'trashure_token=; path=/; max-age=0';
      document.cookie = 'trashure_role=; path=/; max-age=0';
      router.push('/');
    }
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <>
      {/* Hamburger Button - Mobile Only - hanya tampil saat sidebar tertutup */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-md"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {/* Backdrop - Mobile Only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-collapsed={collapsed ? 'true' : 'false'}
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0 lg:translate-x-0 shrink-0 ${sidebarWidth}`}
      >
        {/* Logo dengan Close Button untuk Mobile */}
        <div className={`flex items-center border-b border-gray-100 transition-all duration-300 ${
          collapsed ? 'justify-center px-2 py-3' : 'gap-2.5 px-4 sm:px-5 py-3 sm:py-4'
        }`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-md shadow-green-200 flex-shrink-0">
            <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 transition-opacity duration-200">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#16a34a]">
                  {logo?.label || 'TRASHURE'}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 -mt-0.5">
                  {logo?.subtitle || 'Bank Sampah'}
                </p>
              </div>
              {/* Close Button - Mobile Only - di dalam sidebar */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-2 sm:py-3 sidebar-scrollbar transition-all duration-300 ${collapsed ? 'px-1.5 space-y-1' : 'px-2 sm:px-3 space-y-1'
          }`}>
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className={section.title ? 'mt-3 sm:mt-4 first:mt-0' : ''}>
              {section.title && !collapsed && (
                <p className="px-2 sm:px-3 mb-1 sm:mb-1.5 text-[9px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const hasChildren = !!item.children;
                const isExpanded = expandedMenus.includes(item.label);
                const active = isActive(item.href) || isChildActive(item);

                if (hasChildren) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => {
                          if (collapsed) return;
                          toggleMenu(item.label);
                        }}
                        title={collapsed ? item.label : undefined}
                        className={`group flex w-full items-center rounded-lg transition-all duration-200 ${collapsed ? 'justify-center px-2 py-2' : 'gap-2 sm:gap-2.5 px-2 sm:px-3'
                          } py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium ${active
                            ? 'text-[#16a34a] bg-green-50'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <item.icon className={`h-4 sm:h-[18px] w-4 sm:w-[18px] flex-shrink-0 ${active ? 'text-[#16a34a]' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate text-xs sm:text-sm">{item.label}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-400 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </button>
                      {isExpanded && !collapsed && (
                        <div className="ml-2 sm:ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2 sm:pl-3">
                          {item.children!.map((child) => {
                            const childActive = child.href ? isActive(child.href) : false;
                            const isDownload = !!child.download;

                            if (isDownload) {
                              return (
                                <button
                                  key={child.label}
                                  onClick={() => {
                                    const token = localStorage.getItem('trashure_token') || '';
                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                                    fetch(child.download!, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    })
                                      .then((res) => res.blob())
                                      .then((blob) => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${child.label.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      })
                                      .catch((err) => console.error('Download gagal:', err));
                                  }}
                                  className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
                                >
                                  <child.icon className="h-[15px] w-[15px] flex-shrink-0 text-gray-400" strokeWidth={1.8} />
                                  <span className="flex-1 text-left">{child.label}</span>
                                  <span className="text-[10px] font-semibold text-[#16a34a] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">PDF</span>
                                </button>
                              );
                            }

                            return (
                              <Link
                                key={child.href}
                                href={child.href!}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-[12.5px] font-medium transition-all duration-200 ${childActive
                                  ? 'text-[#16a34a] bg-green-50'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                  }`}
                              >
                                <child.icon className={`h-3.5 sm:h-[15px] w-3.5 sm:w-[15px] flex-shrink-0 ${childActive ? 'text-[#16a34a]' : 'text-gray-400'}`} strokeWidth={1.8} />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center rounded-lg transition-all duration-200 ${collapsed ? 'justify-center px-2 py-2' : 'gap-2 sm:gap-2.5 px-2 sm:px-3'
                      } py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium ${active
                        ? 'bg-[#16a34a] text-white shadow-md shadow-green-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <item.icon
                      className={`h-4 sm:h-[18px] w-4 sm:w-[18px] flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      strokeWidth={1.8}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-xs sm:text-sm">{item.label}</span>
                        {item.badge && (
                          <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-bold flex-shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                            }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        <div className={`border-t border-gray-100 transition-all duration-300 hidden lg:block ${collapsed ? 'px-1.5 py-2' : 'px-2 sm:px-3 py-2 sm:py-3'
          }`}>
          <button
            onClick={toggleCollapsed}
            className={`flex w-full items-center rounded-lg px-2 sm:px-3 py-2 text-[12px] sm:text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${collapsed ? 'justify-center' : 'gap-2 sm:gap-2.5'
              }`}
            title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 sm:h-[18px] w-4 sm:w-[18px]" strokeWidth={1.8} />
            ) : (
              <>
                <PanelLeftClose className="h-4 sm:h-[18px] w-4 sm:w-[18px]" strokeWidth={1.8} />
                <span className="text-xs sm:text-sm">Ciutkan</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card (optional) */}
        {profileCard && (
          <div className="px-3 py-3 border-t border-gray-100">
            <Link
              href={profileCard.href}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
            >
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex-shrink-0">
                <User className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-800 truncate leading-tight">
                  {profileCard.name}
                </p>
                <p className="text-[12px] font-medium text-gray-400 truncate leading-tight mt-0.5">
                  {profileCard.role}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </Link>
          </div>
        )}

        {/* Logout Button */}
        <div className={`border-t border-gray-100 transition-all duration-300 ${collapsed ? 'px-1.5 py-2' : 'px-2 sm:px-3 py-2 sm:py-3'
          }`}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : undefined}
            className={`flex w-full items-center rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors duration-200 ${collapsed ? 'justify-center' : 'gap-2 sm:gap-2.5'
              }`}
          >
            <LogOut className="h-4 sm:h-[18px] w-4 sm:w-[18px]" strokeWidth={1.8} />
            {!collapsed && <span className="text-xs sm:text-sm">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
