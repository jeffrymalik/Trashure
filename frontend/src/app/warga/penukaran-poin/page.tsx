'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Gift,
  AlertCircle,
  CheckCircle,
  X,
  Ticket,
  Smartphone,
  Leaf,
  Grid2X2,
  MessageCircle,
} from 'lucide-react';

import AdminHeader from '@/components/layout/header';

import {
  fetchDaftarHadiah,
  fetchSaldoPoin,
  tukarPoin,
  fetchRiwayatPenukaran,
  HadiahItem,
  RiwayatItem,
  PaginationData,
} from '@/services/wargaPenukaranPoinService';

/*
|--------------------------------------------------------------------------
| Category
|--------------------------------------------------------------------------
|
| Karena tabel voucher tidak memiliki kolom kategori,
| kategori ditentukan berdasarkan nama + deskripsi voucher.
|
*/

type CategoryId =
  | 'semua'
  | 'voucher'
  | 'pulsa'
  | 'lingkungan'
  | 'lainnya';

const categories: {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
}[] = [
    {
      id: 'semua',
      label: 'Semua Hadiah',
      icon: Gift,
    },
    {
      id: 'voucher',
      label: 'Voucher',
      icon: Ticket,
    },
    {
      id: 'pulsa',
      label: 'Pulsa & Kuota',
      icon: Smartphone,
    },
    {
      id: 'lingkungan',
      label: 'Produk Ramah Lingkungan',
      icon: Leaf,
    },
    {
      id: 'lainnya',
      label: 'Lainnya',
      icon: Grid2X2,
    },
  ];

/*
|--------------------------------------------------------------------------
| Determine Category
|--------------------------------------------------------------------------
|
| Tidak membutuhkan kolom kategori di database.
|
*/

const getCategory = (item: HadiahItem): CategoryId => {
  const text = `
    ${item.nama_voucher || ''}
    ${item.deskripsi || ''}
  `.toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | Pulsa & Kuota
  |--------------------------------------------------------------------------
  */

  if (
    text.includes('pulsa') ||
    text.includes('kuota') ||
    text.includes('internet') ||
    text.includes('data')
  ) {
    return 'pulsa';
  }

  /*
  |--------------------------------------------------------------------------
  | Produk Ramah Lingkungan
  |--------------------------------------------------------------------------
  */

  if (
    text.includes('tumbler') ||
    text.includes('tanaman') ||
    text.includes('tas belanja') ||
    text.includes('ramah lingkungan') ||
    text.includes('reusable') ||
    text.includes('daur ulang') ||
    text.includes('eco')
  ) {
    return 'lingkungan';
  }

  /*
  |--------------------------------------------------------------------------
  | Voucher
  |--------------------------------------------------------------------------
  */

  if (
    text.includes('voucher') ||
    text.includes('belanja') ||
    text.includes('e-wallet') ||
    text.includes('ewallet') ||
    text.includes('wallet')
  ) {
    return 'voucher';
  }

  /*
  |--------------------------------------------------------------------------
  | Other
  |--------------------------------------------------------------------------
  */

  return 'lainnya';
};

export default function PenukaranPoinPage() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [hadiah, setHadiah] = useState<HadiahItem[]>([]);

  const [saldo, setSaldo] = useState<number>(0);

  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [sort, setSort] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);

  const [activeCategory, setActiveCategory] =
    useState<CategoryId>('semua');

  const [pagination, setPagination] =
    useState<PaginationData>({
      current_page: 1,
      total: 0,
      per_page: 12,
      last_page: 1,
      from: 0,
      to: 0,
    });

  const [riwayatPage, setRiwayatPage] =
    useState(1);

  const [riwayatPagination, setRiwayatPagination] =
    useState<PaginationData>({
      current_page: 1,
      total: 0,
      per_page: 10,
      last_page: 1,
      from: 0,
      to: 0,
    });

  const [selectedHadiah, setSelectedHadiah] =
    useState<HadiahItem | null>(null);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [tukarLoading, setTukarLoading] =
    useState(false);

  const [tukarStatus, setTukarStatus] =
    useState<{
      type: 'success' | 'error';
      message: string;
    } | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Load Data
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [
        hadiahData,
        saldoData,
        riwayatData,
      ] = await Promise.all([
        fetchDaftarHadiah(
          currentPage,
          12,
          search,
          sort
        ),

        fetchSaldoPoin(),

        fetchRiwayatPenukaran(
          riwayatPage
        ),
      ]);

      setHadiah(hadiahData.data);

      setPagination(
        hadiahData.pagination
      );

      setSaldo(
        saldoData.saldo_poin
      );

      setRiwayat(
        riwayatData.data
      );

      setRiwayatPagination(
        riwayatData.pagination
      );
    } catch (error) {
      console.error(
        'Gagal memuat data penukaran poin:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Effect
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadData();
  }, [
    currentPage,
    riwayatPage,
    sort,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = () => {
    setCurrentPage(1);

    loadData();
  };

  /*
  |--------------------------------------------------------------------------
  | Category Click
  |--------------------------------------------------------------------------
  */

  const handleCategoryChange = (
    category: CategoryId
  ) => {
    setActiveCategory(category);

    /*
    |--------------------------------------------------------------------------
    | Reset pagination ketika kategori berubah
    |--------------------------------------------------------------------------
    */

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Filtered Rewards
  |--------------------------------------------------------------------------
  */

  const filteredHadiah = hadiah.filter(
    (item) => {
      if (
        activeCategory === 'semua'
      ) {
        return true;
      }

      return (
        getCategory(item) ===
        activeCategory
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | Tukar Poin
  |--------------------------------------------------------------------------
  */

  const handleTukar = async () => {
    if (!selectedHadiah) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Check saldo
    |--------------------------------------------------------------------------
    */

    if (
      saldo <
      selectedHadiah.poin_dibutuhkan
    ) {
      setTukarStatus({
        type: 'error',
        message:
          'Saldo poin tidak cukup',
      });

      return;
    }

    setTukarLoading(true);

    try {
      const result =
        await tukarPoin(
          selectedHadiah.voucher_id
        );

      if (result.success) {
        setTukarStatus({
          type: 'success',
          message:
            'Penukaran poin berhasil!',
        });

        setShowConfirm(false);

        setSelectedHadiah(null);

        setTimeout(() => {
          setTukarStatus(null);

          loadData();
        }, 1500);
      } else {
        setTukarStatus({
          type: 'error',
          message:
            result.error ||
            'Gagal melakukan penukaran',
        });
      }
    } catch (error) {
      console.error(
        'Error tukar poin:',
        error
      );

      setTukarStatus({
        type: 'error',
        message:
          'Terjadi kesalahan saat melakukan penukaran',
      });
    } finally {
      setTukarLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Confirmation
  |--------------------------------------------------------------------------
  */

  const openConfirmation = (
    item: HadiahItem
  ) => {
    setSelectedHadiah(item);

    setTukarStatus(null);

    setShowConfirm(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Confirmation
  |--------------------------------------------------------------------------
  */

  const closeConfirmation = () => {
    if (tukarLoading) {
      return;
    }

    setShowConfirm(false);

    setSelectedHadiah(null);

    setTukarStatus(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Status Color
  |--------------------------------------------------------------------------
  */

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'diajukan':
        return 'text-amber-600 bg-amber-100';

      case 'diproses':
        return 'text-blue-600 bg-blue-100';

      case 'selesai':
        return 'text-green-600 bg-green-100';

      case 'dibatalkan':
        return 'text-red-600 bg-red-100';

      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reward Icon
  |--------------------------------------------------------------------------
  */

  const getRewardIcon = (
    name: string
  ) => {
    const value =
      name.toLowerCase();

    if (
      value.includes('pulsa') ||
      value.includes('kuota') ||
      value.includes('internet')
    ) {
      return Smartphone;
    }

    if (
      value.includes('voucher') ||
      value.includes('belanja')
    ) {
      return Ticket;
    }

    if (
      value.includes('tas') ||
      value.includes('tumbler') ||
      value.includes('tanaman')
    ) {
      return Leaf;
    }

    return Gift;
  };

  /*
  |--------------------------------------------------------------------------
  | Reward Icon Style
  |--------------------------------------------------------------------------
  */

  const getRewardIconStyle = (
    name: string
  ) => {
    const value =
      name.toLowerCase();

    if (
      value.includes('pulsa') ||
      value.includes('kuota') ||
      value.includes('internet')
    ) {
      return {
        wrapper: 'bg-blue-50',
        icon: 'text-blue-500',
      };
    }

    if (
      value.includes('voucher') ||
      value.includes('belanja')
    ) {
      return {
        wrapper: 'bg-green-50',
        icon: 'text-green-600',
      };
    }

    if (
      value.includes('tas') ||
      value.includes('tumbler') ||
      value.includes('tanaman')
    ) {
      return {
        wrapper: 'bg-emerald-50',
        icon: 'text-emerald-600',
      };
    }

    return {
      wrapper: 'bg-gray-50',
      icon: 'text-gray-500',
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Reward Image
  |--------------------------------------------------------------------------
  */

  const getRewardImage = (
    item: HadiahItem
  ) => {
    const reward =
      item as HadiahItem & {
        image?: string;
        image_url?: string;
        gambar?: string;
        gambar_voucher?: string;
        foto?: string;
      };

    return (
      reward.image_url ||
      reward.image ||
      reward.gambar ||
      reward.gambar_voucher ||
      reward.foto ||
      null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto w-full max-w-[1440px]">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <AdminHeader
          title="Penukaran Poin"
          subtitle="Tukarkan poin Anda dengan berbagai hadiah menarik."
        />

        {/* =========================================================
            MAIN LAYOUT
        ========================================================= */}

        <div className="grid grid-cols-1 gap-5 px-1 pb-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          {/* =======================================================
              LEFT MAIN CONTENT
          ======================================================= */}

          <main className="min-w-0">

            {/* =====================================================
                INFORMATION BANNER
            ===================================================== */}

            <div className="mb-5 flex items-center gap-3 rounded-lg sm:rounded-xl border border-green-100 bg-green-50 px-5 py-4">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                <Gift className="h-5 w-5 text-green-600" />
              </div>

              <p className="text-sm text-gray-600">
                Semakin banyak poin yang
                Anda kumpulkan, semakin
                banyak manfaat yang bisa
                didapatkan!
              </p>

            </div>

            {/* =====================================================
                REWARD CONTAINER
            ===================================================== */}

            <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* =================================================
                  CATEGORY TABS
              ================================================= */}

              <div className="overflow-x-auto border-b border-gray-100 px-5 pt-2">

                <div className="flex min-w-max items-center gap-7">

                  {categories.map(
                    (category) => {
                      const Icon =
                        category.icon;

                      const isActive =
                        activeCategory ===
                        category.id;

                      return (
                        <button
                          key={
                            category.id
                          }
                          type="button"
                          onClick={() =>
                            handleCategoryChange(
                              category.id
                            )
                          }
                          className={`flex h-12 items-center gap-2 border-b-2 px-1 text-sm transition-colors ${isActive
                            ? 'border-green-600 font-semibold text-green-600'
                            : 'border-transparent text-gray-600 hover:text-green-600'
                            }`}
                        >

                          <Icon className="h-4 w-4" />

                          <span>
                            {
                              category.label
                            }
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  SEARCH / SORT / FILTER
              ================================================= */}

              <div className="border-b border-gray-100 px-5 py-4">

                <div className="flex flex-col gap-3">

                  {/* Search */}

                  <div className="relative w-full">

                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Cari hadiah..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter'
                        ) {
                          handleSearch();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                  </div>

                  <div className="flex flex-wrap items-center gap-3">

                  {/* Sort */}

                  <div className="relative w-full md:w-[170px]">

                    <select
                      value={sort}
                      onChange={(e) =>
                        setSort(
                          e.target.value
                        )
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-9 text-sm text-gray-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    >

                      <option value="asc">
                        Urutkan: Terbaru
                      </option>

                      <option value="desc">
                        Poin Tertinggi
                      </option>

                    </select>

                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-500" />

                  </div>

                  {/* Filter */}

                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-600"
                  >
                    <Filter className="h-4 w-4" />

                    Filter
                  </button>

                  </div>

                </div>

              </div>

              {/* =================================================
                  REWARD LIST
              ================================================= */}

              <div className="p-5">

                {isLoading ? (

                  /* =================================================
                     LOADING
                  ================================================= */

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {Array.from({
                      length: 8,
                    }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white"
                        >

                          <div className="h-[120px] animate-pulse bg-gray-100" />

                          <div className="space-y-3 p-4">

                            <div className="h-4 animate-pulse rounded bg-gray-100" />

                            <div className="h-3 animate-pulse rounded bg-gray-100" />

                            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />

                            <div className="flex justify-between pt-3">

                              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />

                              <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                ) : filteredHadiah.length === 0 ? (

                  /* =================================================
                     EMPTY STATE
                  ================================================= */

                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

                      <Gift className="h-8 w-8 text-green-500" />

                    </div>

                    <h3 className="text-base font-semibold text-gray-800">
                      Belum ada hadiah
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                      Belum ada hadiah pada
                      kategori ini.
                    </p>

                    {activeCategory !==
                      'semua' && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCategory(
                              'semua'
                            )
                          }
                          className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700"
                        >
                          Lihat Semua Hadiah
                        </button>
                      )}

                  </div>

                ) : (

                  <>
                    {/* =================================================
                        REWARD GRID
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                      {filteredHadiah.map(
                        (item) => {
                          const RewardIcon =
                            getRewardIcon(
                              item.nama_voucher
                            );

                          const iconStyle =
                            getRewardIconStyle(
                              item.nama_voucher
                            );

                          const rewardImage =
                            getRewardImage(
                              item
                            );

                          const canRedeem =
                            saldo >=
                            item.poin_dibutuhkan;

                          return (
                            <div
                              key={
                                item.voucher_id
                              }
                              className="group flex min-h-[295px] cursor-pointer flex-col overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                              onClick={() =>
                                openConfirmation(
                                  item
                                )
                              }
                            >

                              {/* IMAGE */}

                              <div className="mx-2 mt-2 flex h-[120px] items-center justify-center overflow-hidden rounded-lg bg-[#faf9f6]">

                                {rewardImage ? (

                                  <img
                                    src={
                                      rewardImage
                                    }
                                    alt={
                                      item.nama_voucher
                                    }
                                    className="h-full w-full object-contain p-2"
                                    onError={(
                                      event
                                    ) => {
                                      event.currentTarget.style.display =
                                        'none';
                                    }}
                                  />

                                ) : (

                                  <div
                                    className={`flex h-full w-full items-center justify-center ${iconStyle.wrapper}`}
                                  >

                                    <RewardIcon
                                      className={`h-12 w-12 ${iconStyle.icon}`}
                                      strokeWidth={
                                        1.5
                                      }
                                    />

                                  </div>

                                )}

                              </div>

                              {/* CONTENT */}

                              <div className="flex flex-1 flex-col p-3">

                                {/* NAME */}

                                <h4 className="line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-5 text-gray-900">
                                  {
                                    item.nama_voucher
                                  }
                                </h4>

                                {/* DESCRIPTION */}

                                <p className="mt-1 line-clamp-2 min-h-[36px] text-[11px] leading-5 text-gray-500">
                                  {
                                    item.deskripsi ||
                                    'Hadiah menarik yang dapat ditukarkan dengan poin Anda.'
                                  }
                                </p>

                                {/* BOTTOM */}

                                <div className="mt-auto flex items-center justify-between gap-2 pt-4">

                                  {/* POINT */}

                                  <div className="flex min-w-0 items-center gap-1 text-green-600">

                                    <Gift className="h-4 w-4 shrink-0" />

                                    <span className="truncate text-[12px] font-bold">
                                      {item.poin_dibutuhkan.toLocaleString(
                                        'id-ID'
                                      )}{' '}
                                      poin
                                    </span>

                                  </div>

                                  {/* BUTTON */}

                                  <button
                                    type="button"
                                    disabled={
                                      !canRedeem
                                    }
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      if (
                                        canRedeem
                                      ) {
                                        openConfirmation(
                                          item
                                        );
                                      }
                                    }}
                                    className={`shrink-0 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors ${canRedeem
                                      ? 'border-green-300 bg-white text-green-700 hover:bg-green-50'
                                      : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                      }`}
                                  >
                                    Tukar
                                  </button>

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {pagination.last_page >
                      1 && (
                        <div className="mt-8 flex items-center justify-center gap-1.5">

                          {/* Previous */}

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                Math.max(
                                  1,
                                  currentPage -
                                  1
                                )
                              )
                            }
                            disabled={
                              currentPage ===
                              1
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {/* Pages */}

                          {Array.from(
                            {
                              length:
                                pagination.last_page,
                            },
                            (_, i) =>
                              i + 1
                          ).map(
                            (page) => (
                              <button
                                type="button"
                                key={page}
                                onClick={() =>
                                  setCurrentPage(
                                    page
                                  )
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${page ===
                                  currentPage
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          )}

                          {/* Next */}

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                Math.min(
                                  pagination.last_page,
                                  currentPage +
                                  1
                                )
                              )
                            }
                            disabled={
                              currentPage ===
                              pagination.last_page
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>

                        </div>
                      )}

                  </>
                )}

              </div>

            </div>

          </main>

          {/* =========================================================
              RIGHT SIDEBAR
          ========================================================= */}

          <aside className="space-y-5">

            {/* =======================================================
                POIN SAYA
            ======================================================= */}

            <div className="rounded-lg sm:rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <h3 className="text-base font-semibold text-gray-900">
                Poin Saya
              </h3>

              <div className="mt-5 flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-50">

                  <Gift
                    className="h-7 w-7 text-green-500"
                    strokeWidth={1.7}
                  />

                </div>

                <div className="flex items-baseline gap-2">

                  <span className="text-[30px] font-bold leading-none text-green-700">
                    {isLoading
                      ? '-'
                      : saldo.toLocaleString(
                        'id-ID'
                      )}
                  </span>

                  <span className="text-sm text-gray-500">
                    poin
                  </span>

                </div>

              </div>

            </div>

            {/* =======================================================
                RIWAYAT PENUKARAN
            ======================================================= */}

            <div className="rounded-lg sm:rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between gap-3">

                <h3 className="text-base font-semibold text-gray-900">
                  Riwayat Penukaran Terakhir
                </h3>

                <Link
                  href="/warga/riwayat-penukaran"
                  type="button"
                  className="shrink-0 text-xs font-semibold text-green-600 hover:text-green-700"
                >
                  Lihat Semua
                </Link>

              </div>

              <div className="mt-4">

                {riwayat.length >
                  0 ? (
                  riwayat
                    .slice(0, 3)
                    .map(
                      (item) => {
                        const RewardIcon =
                          getRewardIcon(
                            item.nama_voucher
                          );

                        const iconStyle =
                          getRewardIconStyle(
                            item.nama_voucher
                          );

                        return (
                          <div
                            key={
                              item.penukaran_id
                            }
                            className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0"
                          >

                            {/* Icon */}

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconStyle.wrapper}`}
                            >

                              <RewardIcon
                                className={`h-5 w-5 ${iconStyle.icon}`}
                                strokeWidth={
                                  1.8
                                }
                              />

                            </div>

                            {/* Detail */}

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-[12px] font-semibold text-gray-800">
                                {
                                  item.nama_voucher
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-gray-500">

                                {new Date(
                                  item.tanggal_pengajuan
                                ).toLocaleDateString(
                                  'id-ID',
                                  {
                                    day: '2-digit',
                                    month:
                                      'short',
                                    year: 'numeric',
                                  }
                                )}

                                {' • '}

                                {new Date(
                                  item.tanggal_pengajuan
                                ).toLocaleTimeString(
                                  'id-ID',
                                  {
                                    hour: '2-digit',
                                    minute:
                                      '2-digit',
                                  }
                                )}

                              </p>

                            </div>

                            {/* Point */}

                            <div className="shrink-0 text-right">

                              <p className="text-sm font-bold text-red-500">
                                -
                                {item.poin_digunakan.toLocaleString(
                                  'id-ID'
                                )}
                              </p>

                              <p className="text-[10px] text-gray-500">
                                poin
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )
                ) : (

                  <div className="py-8 text-center">

                    <Gift className="mx-auto h-7 w-7 text-gray-300" />

                    <p className="mt-2 text-xs text-gray-500">
                      Belum ada riwayat
                      penukaran
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* =======================================================
                TIPS
            ======================================================= */}

            <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-green-100 bg-green-50 p-5">

              <h3 className="text-base font-semibold text-green-700">
                Tips Mengumpulkan Poin
              </h3>

              <div className="relative z-10 mt-4 space-y-3">

                <div className="flex items-start gap-2.5">

                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                  <span className="text-xs leading-5 text-gray-700">
                    Setor sampah secara
                    rutin
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-xs leading-5 text-gray-700">
                    Pilah sampah sesuai
                    jenisnya
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-xs leading-5 text-gray-700">
                    Validasi admin akan menentukan poin anda
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-5 h-28 w-28 rounded-full bg-green-100/60" />

            </div>

            {/* =======================================================
                HELP
            ======================================================= */}

            <div className="rounded-lg sm:rounded-xl border border-orange-100 bg-orange-50 p-5">

              <h3 className="text-base font-semibold text-gray-900">
                Butuh bantuan?
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-600">
                Hubungi kami melalui
                WhatsApp
              </p>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    'https://wa.me/6288213448685?text=Halo%20Trashure,%20saya%20ingin%20bertanya%20tentang%20penukaran%20poin.',
                    '_blank'
                  )
                }
                className="mt-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
              >

                <MessageCircle className="h-4 w-4" />

                Hubungi Kami

              </button>

            </div>

          </aside>

        </div>
      </div>

      {/* =============================================================
          CONFIRMATION MODAL
      ============================================================= */}

      {showConfirm &&
        selectedHadiah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">

                <h3 className="text-lg font-semibold text-gray-900">
                  Konfirmasi Penukaran
                </h3>

                <button
                  type="button"
                  onClick={
                    closeConfirmation
                  }
                  disabled={
                    tukarLoading
                  }
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

              {/* Body */}

              <div className="p-6">

                {/* Status */}

                {tukarStatus && (
                  <div
                    className={`mb-4 flex items-start gap-2 rounded-lg p-3 ${tukarStatus.type ===
                      'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                      }`}
                  >

                    {tukarStatus.type ===
                      'success' ? (
                      <CheckCircle className="h-5 w-5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 shrink-0" />
                    )}

                    <p className="text-sm">
                      {
                        tukarStatus.message
                      }
                    </p>

                  </div>
                )}

                {/* Selected Reward */}

                <div className="rounded-lg sm:rounded-xl bg-gray-50 p-4">

                  <p className="text-xs text-gray-500">
                    Hadiah yang dipilih
                  </p>

                  <h4 className="mt-1 text-base font-semibold text-gray-900">
                    {
                      selectedHadiah.nama_voucher
                    }
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {
                      selectedHadiah.deskripsi ||
                      'Hadiah yang Anda pilih untuk ditukarkan.'
                    }
                  </p>

                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        Poin yang digunakan
                      </span>

                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {selectedHadiah.poin_dibutuhkan.toLocaleString(
                          'id-ID'
                        )}{' '}
                        poin
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        Saldo poin saat ini
                      </span>

                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {saldo.toLocaleString(
                          'id-ID'
                        )}{' '}
                        poin
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        Saldo setelah
                      </span>

                      <span
                        className={`text-sm font-bold ${saldo -
                          selectedHadiah.poin_dibutuhkan >=
                          0
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}
                      >
                        {(
                          saldo -
                          selectedHadiah.poin_dibutuhkan
                        ).toLocaleString(
                          'id-ID'
                        )}{' '}
                        poin
                      </span>

                    </div>

                  </div>

                </div>

                {/* Actions */}

                <div className="mt-5 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      closeConfirmation
                    }
                    disabled={
                      tukarLoading
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleTukar
                    }
                    disabled={
                      tukarLoading ||
                      saldo <
                      selectedHadiah.poin_dibutuhkan
                    }
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tukarLoading
                      ? 'Proses...'
                      : 'Tukar Sekarang'}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =============================================================
          SUCCESS / ERROR TOAST
      ============================================================= */}

      {tukarStatus &&
        !showConfirm && (
          <div className="fixed bottom-5 right-5 z-[60]">

            <div
              className={`flex max-w-sm items-center gap-3 rounded-lg sm:rounded-xl border bg-white px-4 py-3 shadow-xl ${tukarStatus.type ===
                'success'
                ? 'border-green-200'
                : 'border-red-200'
                }`}
            >

              {tukarStatus.type ===
                'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              )}

              <p
                className={`text-sm font-medium ${tukarStatus.type ===
                  'success'
                  ? 'text-green-700'
                  : 'text-red-700'
                  }`}
              >
                {
                  tukarStatus.message
                }
              </p>

            </div>

          </div>
        )}

    </div>
  );
}