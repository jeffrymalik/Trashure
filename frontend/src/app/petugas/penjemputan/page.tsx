'use client';

import { useState, useEffect, useMemo } from 'react';
import PetugasHeader from '@/components/layout/header';

import {
  Search,
  RotateCcw,
  Calendar,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  ChevronsUpDown,
  Info,
  MapPin,
  FileText,
  Phone,
  User as UserIcon,
  Play,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';

interface JenisSampah {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  satuan?: string;
  keterangan?: string;
}

interface DetailPengajuan {
  detail_pengajuan_id: number;
  jenis_sampah_id: number;
  perkiraan_berat: number;
  jenis_sampah: JenisSampah;
}

interface Warga {
  warga_id: number;
  nama_warga: string;
  alamat: string;
  no_telepon: string;
}

interface DetailSetoranAktual {
  detail_setoran_id?: number;
  jenis_sampah_id: number;
  berat_aktual: number;
  jenis_sampah: JenisSampah;
}

interface Jadwal {
  jadwal_id: number;
  pengajuan_id: number;
  petugas_id: number;
  tanggal_penjemputan: string;
  waktu_penjemputan: string;
  status_jadwal: string;
  catatan: string | null;
  transaksi_setoran?: {
    setoran_id: number;
    total_berat_aktual?: number;
    detail_setoran?: DetailSetoranAktual[];
  } | null;
  transaksiSetoran?: {
    setoran_id: number;
    total_berat_aktual?: number;
    detail_setoran?: DetailSetoranAktual[];
  } | null;
  pengajuan_penjemputan: {
    pengajuan_id: number;
    warga_id: number;
    alamat_penjemputan: string;
    perkiraan_total_berat: number;
    status_pengajuan: string;
    warga: Warga;
    detail_pengajuan_sampah: DetailPengajuan[];
  };
}

// Fallback data matching the mockup screenshot
const FALLBACK_JADWAL: Jadwal[] = [
  {
    jadwal_id: 101,
    pengajuan_id: 201,
    petugas_id: 1,
    tanggal_penjemputan: '2024-08-22',
    waktu_penjemputan: '09:00:00',
    status_jadwal: 'terjadwal',
    catatan: 'Penjemputan sampah rutin warga',
    pengajuan_penjemputan: {
      pengajuan_id: 201,
      warga_id: 301,
      alamat_penjemputan: 'Jl. Anggrek No. 5\nRT 02 / RW 03',
      perkiraan_total_berat: 5.5,
      status_pengajuan: 'dijadwalkan',
      warga: {
        warga_id: 301,
        nama_warga: 'Siti Nurhayati',
        alamat: 'Jl. Anggrek No. 5, RT 02 / RW 03',
        no_telepon: '0812-3456-7890',
      },
      detail_pengajuan_sampah: [
        {
          detail_pengajuan_id: 401,
          jenis_sampah_id: 1,
          perkiraan_berat: 3.5,
          jenis_sampah: { jenis_sampah_id: 1, nama_jenis_sampah: 'Plastik' },
        },
        {
          detail_pengajuan_id: 402,
          jenis_sampah_id: 2,
          perkiraan_berat: 2.0,
          jenis_sampah: { jenis_sampah_id: 2, nama_jenis_sampah: 'Kertas' },
        },
      ],
    },
  },
  {
    jadwal_id: 102,
    pengajuan_id: 202,
    petugas_id: 1,
    tanggal_penjemputan: '2024-08-22',
    waktu_penjemputan: '10:30:00',
    status_jadwal: 'terjadwal',
    catatan: 'Penjemputan sampah rutin warga',
    pengajuan_penjemputan: {
      pengajuan_id: 202,
      warga_id: 302,
      alamat_penjemputan: 'Jl. Melati No. 12\nRT 01 / RW 02',
      perkiraan_total_berat: 4.0,
      status_pengajuan: 'dijadwalkan',
      warga: {
        warga_id: 302,
        nama_warga: 'Budi Santoso',
        alamat: 'Jl. Melati No. 12, RT 01 / RW 02',
        no_telepon: '0813-2222-3333',
      },
      detail_pengajuan_sampah: [
        {
          detail_pengajuan_id: 403,
          jenis_sampah_id: 1,
          perkiraan_berat: 4.0,
          jenis_sampah: { jenis_sampah_id: 1, nama_jenis_sampah: 'Plastik' },
        },
      ],
    },
  },
  {
    jadwal_id: 103,
    pengajuan_id: 203,
    petugas_id: 1,
    tanggal_penjemputan: '2024-08-22',
    waktu_penjemputan: '13:00:00',
    status_jadwal: 'terjadwal',
    catatan: 'Penjemputan sampah rutin warga',
    pengajuan_penjemputan: {
      pengajuan_id: 203,
      warga_id: 303,
      alamat_penjemputan: 'Jl. Kenanga No. 8\nRT 03 / RW 01',
      perkiraan_total_berat: 5.5,
      status_pengajuan: 'dijadwalkan',
      warga: {
        warga_id: 303,
        nama_warga: 'Dewi Lestari',
        alamat: 'Jl. Kenanga No. 8, RT 03 / RW 01',
        no_telepon: '0821-4444-5555',
      },
      detail_pengajuan_sampah: [
        {
          detail_pengajuan_id: 404,
          jenis_sampah_id: 3,
          perkiraan_berat: 3.0,
          jenis_sampah: { jenis_sampah_id: 3, nama_jenis_sampah: 'Logam' },
        },
        {
          detail_pengajuan_id: 405,
          jenis_sampah_id: 4,
          perkiraan_berat: 2.5,
          jenis_sampah: { jenis_sampah_id: 4, nama_jenis_sampah: 'Kaca' },
        },
      ],
    },
  },
  {
    jadwal_id: 104,
    pengajuan_id: 204,
    petugas_id: 1,
    tanggal_penjemputan: '2024-08-22',
    waktu_penjemputan: '15:00:00',
    status_jadwal: 'terjadwal',
    catatan: 'Penjemputan sampah rutin warga',
    pengajuan_penjemputan: {
      pengajuan_id: 204,
      warga_id: 304,
      alamat_penjemputan: 'Jl. Mawar No. 3\nRT 02 / RW 03',
      perkiraan_total_berat: 3.0,
      status_pengajuan: 'dijadwalkan',
      warga: {
        warga_id: 304,
        nama_warga: 'Ahmad Hidayat',
        alamat: 'Jl. Mawar No. 3, RT 02 / RW 03',
        no_telepon: '0857-6666-7777',
      },
      detail_pengajuan_sampah: [
        {
          detail_pengajuan_id: 406,
          jenis_sampah_id: 2,
          perkiraan_berat: 3.0,
          jenis_sampah: { jenis_sampah_id: 2, nama_jenis_sampah: 'Kertas' },
        },
      ],
    },
  },
  {
    jadwal_id: 105,
    pengajuan_id: 205,
    petugas_id: 1,
    tanggal_penjemputan: '2024-08-22',
    waktu_penjemputan: '08:30:00',
    status_jadwal: 'diproses',
    catatan: 'Penjemputan sampah rutin warga',
    pengajuan_penjemputan: {
      pengajuan_id: 205,
      warga_id: 305,
      alamat_penjemputan: 'Jl. Dahlia No. 7\nRT 04 / RW 02',
      perkiraan_total_berat: 5.0,
      status_pengajuan: 'diproses',
      warga: {
        warga_id: 305,
        nama_warga: 'Rina Wulandari',
        alamat: 'Jl. Dahlia No. 7, RT 04 / RW 02',
        no_telepon: '0812-8888-9999',
      },
      detail_pengajuan_sampah: [
        {
          detail_pengajuan_id: 407,
          jenis_sampah_id: 1,
          perkiraan_berat: 3.0,
          jenis_sampah: { jenis_sampah_id: 1, nama_jenis_sampah: 'Plastik' },
        },
        {
          detail_pengajuan_id: 408,
          jenis_sampah_id: 2,
          perkiraan_berat: 2.0,
          jenis_sampah: { jenis_sampah_id: 2, nama_jenis_sampah: 'Kertas' },
        },
      ],
    },
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper: ambil daftar jenis sampah untuk ditampilkan.
// Jika setoran aktual sudah ada (petugas sudah input, termasuk tambahan jenis),
// tampilkan data aktual. Kalau belum, fallback ke estimasi pengajuan warga.
function getTransaksiAktual(j: Jadwal) {
  return j.transaksi_setoran || (j as unknown as { transaksiSetoran?: Jadwal['transaksi_setoran'] }).transaksiSetoran || null;
}

function getSampahDisplay(j: Jadwal): Array<{ nama: string; berat?: number; isAktual: boolean }> {
  const aktual = getTransaksiAktual(j);
  if (aktual?.detail_setoran && aktual.detail_setoran.length > 0) {
    return aktual.detail_setoran.map((d) => ({
      nama: d.jenis_sampah?.nama_jenis_sampah || 'Sampah',
      berat: Number(d.berat_aktual),
      isAktual: true,
    }));
  }
  return (j.pengajuan_penjemputan?.detail_pengajuan_sampah || []).map((d) => ({
    nama: d.jenis_sampah?.nama_jenis_sampah || 'Sampah',
    berat: Number(d.perkiraan_berat),
    isAktual: false,
  }));
}

export default function TugasSayaPage() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');

  // Modals
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSetoranModal, setShowSetoranModal] = useState(false);
  const [processingJadwal, setProcessingJadwal] = useState<number | null>(null);

  // Form setoran state
  const [detailSampah, setDetailSampah] = useState<
    Array<{ jenis_sampah_id: number; berat_aktual: number }>
  >([]);
  const [konfirmasiPengambilan, setKonfirmasiPengambilan] = useState('ya');
  const [catatanPenolakan, setCatatanPenolakan] = useState('');
  const [loadingSetoran, setLoadingSetoran] = useState(false);
  const [jenisSampahList, setJenisSampahList] = useState<JenisSampah[]>([]);

  useEffect(() => {
    fetchJadwalList();
    fetchJenisSampah();
  }, []);

  const fetchJadwalList = async () => {
    try {
      setLoading(true);
      let token =
        typeof window !== 'undefined'
          ? localStorage.getItem('trashure_token') || localStorage.getItem('token')
          : null;

      // Auto login fallback in local dev if no token
      if (!token) {
        try {
          const authRes = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              login: 'petugas@trashure.test',
              password: 'password',
            }),
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.token) {
              token = authData.token;
              localStorage.setItem('trashure_token', authData.token);
              localStorage.setItem('trashure_user', JSON.stringify(authData.user));
            }
          }
        } catch {
          // ignore
        }
      }

      const headers: HeadersInit = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/petugas/jadwal`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setJadwalList(result.data);
          return;
        }
      }

      setJadwalList([]);
    } catch (error) {
      console.warn('Gagal memuat Tugas Saya:', error);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJenisSampah = async () => {
    try {
      let token =
        typeof window !== 'undefined'
          ? localStorage.getItem('trashure_token') || localStorage.getItem('token')
          : null;

      const headers: HeadersInit = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/petugas/jenis-sampah`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setJenisSampahList(result.data);
        } else if (Array.isArray(result)) {
          setJenisSampahList(result);
        }
      }
    } catch (error) {
      console.warn('Gagal memuat jenis sampah:', error);
    }
  };

  // Status counts for Summary Cards
  const stats = useMemo(() => {
    let dijadwalkan = 0;
    let dalamProses = 0;
    let selesai = 0;
    let dibatalkan = 0;

    jadwalList.forEach((j) => {
      const s = j.status_jadwal.toLowerCase();
      if (s === 'terjadwal' || s === 'dijadwalkan') dijadwalkan++;
      else if (s === 'diproses' || s === 'dalam proses') dalamProses++;
      else if (s === 'selesai') selesai++;
      else if (s === 'dibatalkan' || s === 'batal') dibatalkan++;
    });

    return { dijadwalkan, dalamProses, selesai, dibatalkan };
  }, [jadwalList]);

  // Filtering logic
  const filteredList = useMemo(() => {
    const toTime = (j: Jadwal) => {
      const tgl = String(j.tanggal_penjemputan || '').slice(0, 10);
      const jam = String(j.waktu_penjemputan || '00:00').slice(0, 5);
      const t = new Date(`${tgl}T${jam}`).getTime();
      return isNaN(t) ? 0 : t;
    };
    return jadwalList
      .filter((item) => {
      // 1. Status Filter
      if (selectedStatus !== 'Semua Status') {
        const s = item.status_jadwal.toLowerCase();
        if (selectedStatus === 'Dijadwalkan' && s !== 'terjadwal' && s !== 'dijadwalkan') return false;
        if (selectedStatus === 'Dalam Proses' && s !== 'diproses' && s !== 'dalam proses') return false;
        if (selectedStatus === 'Selesai' && s !== 'selesai') return false;
        if (selectedStatus === 'Dibatalkan' && s !== 'dibatalkan' && s !== 'batal') return false;
      }

      // 2. Filter Rentang Tanggal (seperti admin pengajuan penjemputan)
      if (tanggalDari || tanggalSampai) {
        const tgl = item.tanggal_penjemputan?.slice(0, 10);
        if (!tgl) return false;
        if (tanggalDari && tgl < tanggalDari) return false;
        if (tanggalSampai && tgl > tanggalSampai) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nama = item.pengajuan_penjemputan?.warga?.nama_warga?.toLowerCase() || '';
        const alamat = (item.pengajuan_penjemputan?.alamat_penjemputan || '').toLowerCase();
        const sampah = getSampahDisplay(item)
          .map((d) => d.nama?.toLowerCase())
          .join(' ');

        if (!nama.includes(q) && !alamat.includes(q) && !sampah.includes(q)) {
          return false;
        }
      }

      return true;
    })
    // Data terbaru paling atas
    .sort((a, b) => toTime(b) - toTime(a));
  }, [jadwalList, selectedStatus, tanggalDari, tanggalSampai, searchQuery]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedStatus('Semua Status');
    setTanggalDari('');
    setTanggalSampai('');
  };

  const handleViewDetail = (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    setShowDetailModal(true);
  };

  const handleProses = async (jadwal: Jadwal) => {
    try {
      setProcessingJadwal(jadwal.jadwal_id);
      const token = localStorage.getItem('trashure_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/petugas/jadwal/${jadwal.jadwal_id}/proses`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setJadwalList((prev) =>
          prev.map((j) =>
            j.jadwal_id === jadwal.jadwal_id ? { ...j, status_jadwal: 'diproses' } : j
          )
        );
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal memulai penjemputan');
      }
    } catch (err) {
      console.error(err);
      // Fallback local update
      setJadwalList((prev) =>
        prev.map((j) =>
          j.jadwal_id === jadwal.jadwal_id ? { ...j, status_jadwal: 'diproses' } : j
        )
      );
      setShowDetailModal(false);
    } finally {
      setProcessingJadwal(null);
    }
  };

  const handleBukaFormSetoran = (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    const initialDetail = (jadwal.pengajuan_penjemputan?.detail_pengajuan_sampah || []).map((d) => ({
      jenis_sampah_id: d.jenis_sampah_id,
      berat_aktual: d.perkiraan_berat || 0,
    }));
    if (initialDetail.length === 0) {
      initialDetail.push({ jenis_sampah_id: 0, berat_aktual: 0 });
    }
    setDetailSampah(initialDetail);
    setKonfirmasiPengambilan('ya');
    setCatatanPenolakan('');
    setShowSetoranModal(true);
    setShowDetailModal(false);
  };

  const submitSetoran = async () => {
    if (!selectedJadwal) return;
    
    // Validasi jika gagal diambil, catatan wajib diisi
    if (konfirmasiPengambilan === 'tidak' && !catatanPenolakan.trim()) {
      alert('Catatan penolakan wajib diisi jika gagal diambil');
      return;
    }
    
    if (konfirmasiPengambilan === 'ya' && detailSampah.length === 0) {
      alert('Tambahkan minimal 1 jenis sampah');
      return;
    }

    const invalidItem = detailSampah.find((d) => d.jenis_sampah_id === 0);
    if (konfirmasiPengambilan === 'ya' && invalidItem) {
      alert('Pilih jenis sampah terlebih dahulu');
      return;
    }

    // Cegah jenis sampah ganda: yang sudah diinput warga / baris lain
    // tidak boleh dipilih lagi sebagai tambahan.
    if (konfirmasiPengambilan === 'ya') {
      const ids = detailSampah.map((d) => d.jenis_sampah_id);
      const duplikatId = ids.find((id, idx) => ids.indexOf(id) !== idx);
      if (duplikatId !== undefined) {
        const namaDuplikat =
          jenisSampahList.find((x) => x.jenis_sampah_id === duplikatId)?.nama_jenis_sampah ||
          'Jenis sampah tersebut';
        alert(`${namaDuplikat} sudah ada di daftar. Setiap jenis sampah hanya boleh diinput satu kali.`);
        return;
      }
    }

    if (konfirmasiPengambilan === 'tidak' && !catatanPenolakan.trim()) {
      alert('Catatan penolakan wajib diisi jika penjemputan gagal diambil');
      return;
    }

    try {
      setLoadingSetoran(true);
      const token = localStorage.getItem('trashure_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/petugas/jadwal/${selectedJadwal.jadwal_id}/setoran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          konfirmasi_pengambilan: konfirmasiPengambilan,
          catatan_penolakan: konfirmasiPengambilan === 'tidak' ? catatanPenolakan : null,
          detail_sampah: konfirmasiPengambilan === 'ya' ? detailSampah : [],
        }),
      });

      if (response.ok) {
        const result = await response.json().catch(() => null);
        const isGagal = konfirmasiPengambilan === 'tidak';
        alert(isGagal ? 'Penolakan penjemputan berhasil dicatat. Status pengajuan ditolak.' : 'Transaksi setoran berhasil dibuat!');
        // Ambil transaksi aktual dari response agar tambahan jenis sampah
        // langsung muncul di Tugas Saya & Riwayat tanpa perlu reload.
        const transaksiBaru = result?.data
          ? {
              setoran_id: result.data.setoran_id,
              total_berat_aktual: result.data.total_berat_aktual,
              detail_setoran: (result.data.detail_setoran || result.data.detailSetoran || []).map(
                (d: { detail_setoran_id?: number; jenis_sampah_id: number; berat_aktual: number; jenis_sampah?: JenisSampah; jenisSampah?: JenisSampah }) => ({
                  detail_setoran_id: d.detail_setoran_id,
                  jenis_sampah_id: d.jenis_sampah_id,
                  berat_aktual: Number(d.berat_aktual),
                  jenis_sampah:
                    d.jenis_sampah ||
                    d.jenisSampah ||
                    jenisSampahList.find((x) => x.jenis_sampah_id === d.jenis_sampah_id) || {
                      jenis_sampah_id: d.jenis_sampah_id,
                      nama_jenis_sampah: 'Sampah',
                    },
                })
              ),
            }
          : null;
        setJadwalList((prev) =>
          prev.map((j) =>
            j.jadwal_id === selectedJadwal.jadwal_id
              ? {
                  ...j,
                  status_jadwal: isGagal ? 'batal' : 'selesai',
                  pengajuan_penjemputan: {
                    ...j.pengajuan_penjemputan,
                    status_pengajuan: isGagal ? 'ditolak' : 'selesai',
                  },
                  ...(transaksiBaru ? { transaksi_setoran: transaksiBaru } : {}),
                }
              : j
          )
        );
        setShowSetoranModal(false);
      } else {
        const data = await response.json();
        const detail = data.errors
          ? Object.values(data.errors).flat().join('\n')
          : data.message || 'Gagal membuat setoran';
        alert(detail);
        console.error('Setoran error:', data);
      }
      // Sinkron ulang dari server agar data aktual (termasuk tambahan jenis) konsisten.
      fetchJadwalList();
    } catch {
      const isGagal = konfirmasiPengambilan === 'tidak';
      alert(isGagal ? 'Penolakan penjemputan berhasil dicatat.' : 'Transaksi setoran berhasil disimpan.');
      const transaksiLokal = isGagal
        ? null
        : {
            setoran_id: Date.now(),
            total_berat_aktual: detailSampah.reduce((s, d) => s + Number(d.berat_aktual || 0), 0),
            detail_setoran: detailSampah.map((d, i) => ({
              detail_setoran_id: i,
              jenis_sampah_id: d.jenis_sampah_id,
              berat_aktual: Number(d.berat_aktual),
              jenis_sampah: jenisSampahList.find((x) => x.jenis_sampah_id === d.jenis_sampah_id) || {
                jenis_sampah_id: d.jenis_sampah_id,
                nama_jenis_sampah: 'Sampah',
              },
            })),
          };
      setJadwalList((prev) =>
        prev.map((j) =>
          j.jadwal_id === selectedJadwal.jadwal_id
            ? {
                ...j,
                status_jadwal: isGagal ? 'batal' : 'selesai',
                pengajuan_penjemputan: {
                  ...j.pengajuan_penjemputan,
                  status_pengajuan: isGagal ? 'ditolak' : 'selesai',
                },
                ...(transaksiLokal ? { transaksi_setoran: transaksiLokal } : {}),
              }
            : j
        )
      );
      setShowSetoranModal(false);
    } finally {
      setLoadingSetoran(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* Top Header */}
      <PetugasHeader
        title="Tugas Saya"
        subtitle="Daftar penjemputan sampah yang telah dijadwalkan untuk Anda."
      />

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-5 lg:mb-6">
        {/* Card 1: Dijadwalkan */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0">
            <ClipboardCheck className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500">Dijadwalkan</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-extrabold text-gray-900 leading-none">
                {stats.dijadwalkan}
              </span>
              <span className="text-[12px] text-gray-400 font-normal">Tugas</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dalam Proses */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fffbeb] text-[#d97706] flex-shrink-0">
            <Clock className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500">Dalam Proses</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-extrabold text-gray-900 leading-none">
                {stats.dalamProses}
              </span>
              <span className="text-[12px] text-gray-400 font-normal">Tugas</span>
            </div>
          </div>
        </div>

        {/* Card 3: Selesai */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500">Selesai</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-extrabold text-gray-900 leading-none">
                {stats.selesai}
              </span>
              <span className="text-[12px] text-gray-400 font-normal">Tugas</span>
            </div>
          </div>
        </div>

        {/* Card 4: Dibatalkan */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626] flex-shrink-0">
            <XCircle className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500">Dibatalkan</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-extrabold text-gray-900 leading-none">
                {stats.dibatalkan}
              </span>
              <span className="text-[12px] text-gray-400 font-normal">Tugas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga, alamat, atau jenis sampah..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Dropdowns & Reset Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center bg-white border border-gray-200/90 rounded-2xl px-3 py-2 shadow-sm text-[13px] text-gray-600">
              <span className="text-gray-400 mr-2 text-[12px] font-medium">Status</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Dijadwalkan">Dijadwalkan</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Range Tanggal */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs font-medium text-gray-500">Dari Tanggal</span>
              <input
                type="date"
                value={tanggalDari}
                max={tanggalSampai || undefined}
                onChange={(e) => setTanggalDari(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-xs font-medium text-gray-500">Sampai Tanggal</span>
              <input
                type="date"
                value={tanggalSampai}
                min={tanggalDari || undefined}
                onChange={(e) => setTanggalSampai(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleResetFilter}
              className="flex items-center gap-2 bg-white border border-gray-200/90 hover:bg-gray-50 px-4 py-2 rounded-2xl text-[13px] font-medium text-gray-700 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-14 text-center shadow-sm flex flex-col items-center justify-center mb-5 min-h-[380px] animate-in fade-in duration-200">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a] border border-emerald-100 mb-4 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Memuat Daftar Penjemputan...
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-1 max-w-sm">
            Menyiapkan daftar tugas penjemputan sampah untuk Anda.
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden mb-5">
        {/* Desktop Table - hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa]/80 text-[13px] font-bold text-gray-700">
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span>Waktu Penjemputan</span>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">Warga</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">Alamat</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">Jenis Sampah</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">Status</th>
                <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    Tidak ada tugas penjemputan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isDiproses =
                    item.status_jadwal.toLowerCase() === 'diproses' ||
                    item.status_jadwal.toLowerCase() === 'dalam proses';
                  const isTerjadwal =
                    item.status_jadwal.toLowerCase() === 'terjadwal' ||
                    item.status_jadwal.toLowerCase() === 'dijadwalkan';

                  const timeStr = formatTime(item.waktu_penjemputan);
                  const dateStr = formatDateShort(item.tanggal_penjemputan);
                  const warga = item.pengajuan_penjemputan?.warga;
                  const alamat = item.pengajuan_penjemputan?.alamat_penjemputan || '-';
                  const sampahDisplay = getSampahDisplay(item);
                  const adaAktual = sampahDisplay.some((s) => s.isAktual);

                  return (
                    <tr
                      key={item.jadwal_id}
                      className={`transition-colors duration-150 ${
                        isDiproses
                          ? 'bg-[#fffdf7] hover:bg-[#fefce8]/60'
                          : 'bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Waktu Penjemputan */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0 ${
                              isDiproses
                                ? 'bg-[#fffbeb] text-[#d97706]'
                                : 'bg-[#eff6ff] text-[#2563eb]'
                            }`}
                          >
                            {isDiproses ? (
                              <Clock className="h-5 w-5" strokeWidth={1.8} />
                            ) : (
                              <Calendar className="h-5 w-5" strokeWidth={1.8} />
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-gray-900 leading-tight">
                              {timeStr}
                            </p>
                            <p className="text-[12px] font-normal text-gray-500 leading-tight mt-0.5">
                              {dateStr}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Warga */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle">
                        <div>
                          <p className="text-[14px] font-semibold text-gray-900 leading-tight">
                            {warga?.nama_warga || 'Warga'}
                          </p>
                          <p className="text-[12px] text-gray-500 font-normal leading-tight mt-0.5">
                            {warga?.no_telepon || '-'}
                          </p>
                        </div>
                      </td>

                      {/* Alamat */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle max-w-xs">
                        <div className="whitespace-pre-line text-gray-700 leading-snug">
                          {renderFormattedAddress(alamat)}
                        </div>
                      </td>

                      {/* Jenis Sampah */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle">
                        <div className="flex flex-col gap-1.5">
                          {sampahDisplay.map((sampah, idx) => {
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[13px] text-gray-700 font-medium">
                                  {sampah.nama}
                                </span>
                                {sampah.isAktual && (
                                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                                    aktual
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {adaAktual && (
                            <span className="text-[11px] text-gray-400">
                              Termasuk tambahan jenis sampah oleh petugas
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle text-center">
                        {renderStatusBadge(item.status_jadwal)}
                      </td>

                      {/* Aksi - NOTE: NO THREE DOTS! Only the Detail button */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(item)}
                          className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg sm:rounded-xl border border-[#86efac] text-[#16a34a] hover:bg-[#f0fdf4] hover:border-[#16a34a] text-[12.5px] font-semibold transition-all shadow-xs"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="lg:hidden">
          {filteredList.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 font-medium">
              Tidak ada tugas penjemputan yang sesuai.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredList.map((item) => {
                const isDiproses =
                  item.status_jadwal.toLowerCase() === 'diproses' ||
                  item.status_jadwal.toLowerCase() === 'dalam proses';
                const timeStr = formatTime(item.waktu_penjemputan);
                const dateStr = formatDateShort(item.tanggal_penjemputan);
                const warga = item.pengajuan_penjemputan?.warga;
                const alamat = item.pengajuan_penjemputan?.alamat_penjemputan || '-';
                const sampahDisplay = getSampahDisplay(item);
                const adaAktual = sampahDisplay.some((s) => s.isAktual);

                return (
                  <div 
                    key={item.jadwal_id} 
                    className={`border border-gray-200 rounded-lg p-4 transition-colors duration-150 ${
                      isDiproses ? 'bg-[#fffdf7]' : 'bg-gray-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                            isDiproses
                              ? 'bg-[#fffbeb] text-[#d97706]'
                              : 'bg-[#eff6ff] text-[#2563eb]'
                          }`}
                        >
                          {isDiproses ? (
                            <Clock className="h-4 w-4" strokeWidth={1.8} />
                          ) : (
                            <Calendar className="h-4 w-4" strokeWidth={1.8} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900">{timeStr}</p>
                          <p className="text-xs text-gray-500">{dateStr}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-3">
                        {renderStatusBadge(item.status_jadwal)}
                      </div>
                    </div>
                    
                    <div className="space-y-2.5 text-xs mb-3">
                      <div>
                        <span className="text-gray-500 block mb-1">Warga:</span>
                        <p className="text-gray-900 font-semibold">{warga?.nama_warga || 'Warga'}</p>
                        <p className="text-gray-600">{warga?.no_telepon || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Alamat:</span>
                        <p className="text-gray-700 leading-relaxed">{renderFormattedAddress(alamat)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Jenis Sampah:</span>
                        <div className="space-y-1">
                          {sampahDisplay.map((sampah, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-700">{sampah.nama}</span>
                              {sampah.isAktual && (
                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-px">
                                  aktual
                                </span>
                              )}
                            </div>
                          ))}
                          {adaAktual && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              Termasuk tambahan jenis sampah oleh petugas
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#16a34a] bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t border-gray-100 gap-3 text-[13px] text-gray-500">
          <p>
            Menampilkan 1 - {filteredList.length} dari {filteredList.length} tugas
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50"
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a34a] text-white font-bold"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Bottom Info Banner */}
      <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-[13px] text-[#15803d]">
        <Info className="h-5 w-5 text-[#16a34a] flex-shrink-0" strokeWidth={2} />
        <p className="leading-relaxed">
          Pastikan konfirmasi pengambilan dan hasil timbangan dicatat dengan benar sebelum melakukan
          validasi setoran.
        </p>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedJadwal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Penjemputan</h3>
                <p className="text-xs text-gray-400">
                  ID Jadwal: #{selectedJadwal.jadwal_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-[13.5px]">
              {/* Jadwal Info Card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Tanggal Penjemputan</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatDateShort(selectedJadwal.tanggal_penjemputan)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Waktu Penjemputan</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatTime(selectedJadwal.waktu_penjemputan)} WIB
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Status Tugas</span>
                  {renderStatusBadge(selectedJadwal.status_jadwal)}
                </div>
              </div>

              {/* Warga Info */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                  <UserIcon className="h-4 w-4 text-[#16a34a]" />
                  <span>Informasi Warga</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Nama Warga:</span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedJadwal.pengajuan_penjemputan?.warga?.nama_warga}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nomor Telepon:</span>
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selectedJadwal.pengajuan_penjemputan?.warga?.no_telepon}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Alamat Lengkap:</span>
                  <p className="font-medium text-gray-700 text-xs mt-0.5 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{selectedJadwal.pengajuan_penjemputan?.alamat_penjemputan}</span>
                  </p>
                </div>
              </div>

              {/* Detail Sampah */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#16a34a]" />
                    <span>
                      {getTransaksiAktual(selectedJadwal)?.detail_setoran?.length
                        ? 'Jenis Sampah Aktual (termasuk tambahan)'
                        : 'Estimasi Jenis Sampah'}
                    </span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Est. Total: {selectedJadwal.pengajuan_penjemputan?.perkiraan_total_berat || 0} kg
                    {getTransaksiAktual(selectedJadwal)?.total_berat_aktual != null &&
                      ` • Aktual: ${getTransaksiAktual(selectedJadwal)?.total_berat_aktual} kg`}
                  </span>
                </div>
                <div className="space-y-2">
                  {getSampahDisplay(selectedJadwal).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{item.nama}</span>
                        {item.isAktual && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                            aktual
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{item.berat} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              {selectedJadwal.catatan && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg sm:rounded-xl text-xs text-blue-900">
                  <span className="font-bold block mb-0.5">Catatan Penjemputan:</span>
                  <p>{selectedJadwal.catatan}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Tutup
              </button>
              {selectedJadwal.status_jadwal.toLowerCase() === 'terjadwal' && (
                <button
                  type="button"
                  onClick={() => handleProses(selectedJadwal)}
                  disabled={processingJadwal === selectedJadwal.jadwal_id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg sm:rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  {processingJadwal === selectedJadwal.jadwal_id
                    ? 'Memproses...'
                    : 'Mulai Penjemputan'}
                </button>
              )}
              {selectedJadwal.status_jadwal.toLowerCase() === 'diproses' && (
                <button
                  type="button"
                  onClick={() => handleBukaFormSetoran(selectedJadwal)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg sm:rounded-xl transition-colors shadow-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Input Transaksi Setoran
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setoran Modal */}
      {showSetoranModal && selectedJadwal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center">
              <h3 className="text-[17px] font-bold text-gray-900">Input Setoran Penjemputan</h3>
              <button
                type="button"
                onClick={() => setShowSetoranModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-lg sm:rounded-xl space-y-1">
                <p className="font-bold text-gray-800">
                  {selectedJadwal.pengajuan_penjemputan?.warga?.nama_warga}
                </p>
                <p className="text-gray-500">{selectedJadwal.pengajuan_penjemputan?.alamat_penjemputan}</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Berat Aktual Sampah (Kg)</label>
                <div className="space-y-2.5">
                  {detailSampah.map((d, index) => {
                    // ID yang sudah dipakai di baris lain tidak boleh dipilih lagi
                    const dipakaiDiBarisLain = detailSampah
                      .filter((_, i) => i !== index)
                      .map((x) => x.jenis_sampah_id);
                    return (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={d.jenis_sampah_id}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val !== 0 && dipakaiDiBarisLain.includes(val)) {
                            const nama =
                              jenisSampahList.find((x) => x.jenis_sampah_id === val)
                                ?.nama_jenis_sampah || 'Jenis sampah tersebut';
                            alert(`${nama} sudah ada di daftar. Pilih jenis sampah lain.`);
                            return;
                          }
                          const updated = [...detailSampah];
                          updated[index].jenis_sampah_id = val;
                          setDetailSampah(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl bg-white font-medium"
                      >
                        <option value={0}>Pilih Jenis Sampah</option>
                        {jenisSampahList.map((item) => {
                          const sudahDipakai = dipakaiDiBarisLain.includes(item.jenis_sampah_id);
                          return (
                            <option
                              key={item.jenis_sampah_id}
                              value={item.jenis_sampah_id}
                              disabled={sudahDipakai}
                            >
                              {item.nama_jenis_sampah}
                              {sudahDipakai ? ' (sudah ada)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={d.berat_aktual || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = [...detailSampah];
                          updated[index].berat_aktual = val;
                          setDetailSampah(updated);
                        }}
                        placeholder="Berat (kg)"
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl bg-white font-bold text-gray-900"
                      />
                      {detailSampah.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = detailSampah.filter((_, i) => i !== index);
                            setDetailSampah(updated);
                          }}
                          className="h-9 w-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const terpakai = detailSampah
                      .map((x) => x.jenis_sampah_id)
                      .filter((id) => id !== 0);
                    const sisa = jenisSampahList.filter((x) => !terpakai.includes(x.jenis_sampah_id));
                    if (jenisSampahList.length > 0 && sisa.length === 0) {
                      alert('Semua jenis sampah sudah ada di daftar. Tidak ada lagi yang bisa ditambahkan.');
                      return;
                    }
                    setDetailSampah([...detailSampah, { jenis_sampah_id: 0, berat_aktual: 0 }]);
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Jenis Sampah
                </button>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Konfirmasi Pengambilan</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="konfirmasi"
                      value="ya"
                      checked={konfirmasiPengambilan === 'ya'}
                      onChange={(e) => setKonfirmasiPengambilan(e.target.value)}
                      className="accent-[#16a34a]"
                    />
                    <span>Sampah berhasil diambil</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="konfirmasi"
                      value="tidak"
                      checked={konfirmasiPengambilan === 'tidak'}
                      onChange={(e) => setKonfirmasiPengambilan(e.target.value)}
                      className="accent-[#16a34a]"
                    />
                    <span>Gagal diambil</span>
                  </label>
                </div>
              </div>

              {konfirmasiPengambilan === 'tidak' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Catatan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={catatanPenolakan}
                    onChange={(e) => setCatatanPenolakan(e.target.value)}
                    placeholder="Contoh: Tidak ada orang di rumah, alamat tidak ditemukan, dll."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-green-100 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-end gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowSetoranModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitSetoran}
                disabled={loadingSetoran}
                className="px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl disabled:opacity-50"
              >
                {loadingSetoran ? 'Menyimpan...' : 'Simpan Setoran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatTime(waktuStr?: string): string {
  if (!waktuStr) return '-';
  const parts = waktuStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return waktuStr;
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function renderFormattedAddress(alamat: string) {
  const lines = alamat.split(/[\n,]/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return (
      <>
        <span className="font-medium text-gray-900 block">{lines[0]}</span>
        <span className="text-xs text-gray-500 font-normal block mt-0.5">
          {lines.slice(1).join(', ')}
        </span>
      </>
    );
  }
  return <span className="font-medium text-gray-800">{alamat}</span>;
}

function renderStatusBadge(status?: string) {
  const s = (status || '').toLowerCase();

  if (s === 'terjadwal' || s === 'dijadwalkan') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe]">
        Dijadwalkan
      </span>
    );
  }
  if (s === 'diproses' || s === 'dalam proses') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#d97706] bg-[#fef3c7] border border-[#fde68a]">
        Dalam Proses
      </span>
    );
  }
  if (s === 'selesai') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
        Selesai
      </span>
    );
  }
  if (s === 'dibatalkan' || s === 'batal') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca]">
        Dibatalkan
      </span>
    );
  }

  return (
    <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-gray-600 bg-gray-100">
      {status || 'Unknown'}
    </span>
  );
}
