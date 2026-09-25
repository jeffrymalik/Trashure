'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  NotificationItem,
} from '@/services/notificationService';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr.replace(' ', 'T'));
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu}`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      setUnreadCount(res.unread_count);
    } catch {
      // silent
    }
  }, []);

  const loadNotifications = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await fetchNotifications(currentPage, 10);
      if (reset) {
        setNotifications(res.data);
        setPage(2);
      } else {
        setNotifications((prev) => [...prev, ...res.data]);
        setPage(currentPage + 1);
      }
      setHasMore(currentPage < res.pagination.last_page);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications(true);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    if (type.includes('disetujui') || type.includes('selesai')) return '✅';
    if (type.includes('ditolak')) return '❌';
    if (type.includes('dibatalkan')) return '🚫';
    if (type.includes('dijadwalkan') || type.includes('ditugaskan')) return '📅';
    if (type.includes('diproses')) return '🚚';
    if (type.includes('menunggu') || type.includes('baru')) return '⏳';
    return '🔔';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm flex-shrink-0"
      >
        <Bell className="h-4 sm:h-[18px] w-4 sm:w-[18px]" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 sm:h-5 min-w-4 sm:min-w-5 items-center justify-center rounded-full bg-[#16a34a] px-0.5 sm:px-1 text-[8px] sm:text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#16a34a] hover:text-[#15803d] transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Baca semua</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <div className="py-8 text-center">
                <Bell className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Belum ada notifikasi</p>
              </div>
            ) : (
              <>
                {notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-50 last:border-b-0 transition ${
                        isUnread ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5 flex-shrink-0">{getNotifIcon(notif.type)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </p>
                            {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400">{timeAgo(notif.created_at)}</span>
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="flex items-center gap-0.5 text-[10px] text-[#16a34a] hover:text-[#15803d] font-medium transition"
                              >
                                <Check className="h-2.5 w-2.5" />
                                Tandai dibaca
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => loadNotifications(false)}
                    disabled={loading}
                    className="w-full py-2.5 text-xs font-medium text-[#16a34a] hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {loading ? 'Memuat...' : 'Muat lainnya'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
