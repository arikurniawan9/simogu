'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { CustomSelect } from '@/components/custom-select';
import { Footer } from '@/components/footer';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ArrowLeft,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { LogoutButton } from '@/components/logout-button';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface ReportRowItem {
  id: string;
  attendanceDate: string;
  teacherCode: string;
  teacherName: string;
  jenjang: EducationLevel;
  subject: string;
  className: string;
  periodNumber: number;
  periodTime: string;
  status: 'PRESENT' | 'PERMISSION' | 'DUTY' | 'ABSENT';
  statusLabel: string;
  notes: string;
}

const sampleReportData: ReportRowItem[] = [
  { id: '1', attendanceDate: '2026-08-09', teacherCode: 'GRU-001', teacherName: 'Drs. Ari Kurniawan, M.Pd.', jenjang: 'SMA', subject: 'Matematika', className: 'X IPA 1', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi Petugas Piket' },
  { id: '2', attendanceDate: '2026-08-09', teacherCode: 'GRU-002', teacherName: 'Siti Rahma, S.Pd.', jenjang: 'SMP', subject: 'Bahasa Indonesia', className: 'VII A', periodNumber: 2, periodTime: '07:45 - 08:30', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi Petugas Piket' },
  { id: '3', attendanceDate: '2026-08-09', teacherCode: 'GRU-003', teacherName: 'Budi Santoso, S.T.', jenjang: 'SMK', subject: 'Informatika', className: 'X TKJ 1', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'DUTY', statusLabel: 'Tugas Dinas', notes: 'Mendampingi Lomba LKS Kejuruan' },
  { id: '4', attendanceDate: '2026-08-08', teacherCode: 'GRU-004', teacherName: 'Dewi Lestari, M.Sc.', jenjang: 'SMA', subject: 'Biologi', className: 'XI IPS 2', periodNumber: 3, periodTime: '08:30 - 09:15', status: 'PERMISSION', statusLabel: 'Izin', notes: 'Surat Izin Resmi MGMP Biologi' },
  { id: '5', attendanceDate: '2026-08-08', teacherCode: 'GRU-005', teacherName: 'Ahmad Fauzi, S.Ag.', jenjang: 'SMP', subject: 'Pendidikan Agama', className: 'VIII B', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi Petugas Piket' },
  { id: '6', attendanceDate: '2026-08-08', teacherCode: 'GRU-006', teacherName: 'Rina Wijaya, S.Kom.', jenjang: 'SMK', subject: 'Pemrograman Web', className: 'XI RPL 2', periodNumber: 4, periodTime: '09:30 - 10:15', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi Petugas Piket' },
];

export default function AdminReportsPage() {
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-09');

  const filteredData = sampleReportData.filter((item) => {
    const jenjangMatch = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
    const statusMatch = selectedStatus === 'Semua' || item.statusLabel === selectedStatus;
    const dateMatch = item.attendanceDate >= startDate && item.attendanceDate <= endDate;
    return jenjangMatch && statusMatch && dateMatch;
  });

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data laporan yang sesuai filter untuk diekspor!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sheetData: any[][] = [
      ['PONDOK PESANTREN AL ITTIHAD'],
      ['SISTEM MONITORING KEHADIRAN GURU (SIMOGU)'],
      [`LAPORAN REKAPITULASI PRESENSI & JADWAL MENGAJAR GURU`],
      [`Periode Laporan: ${startDate} s/d ${endDate} | Jenjang: ${selectedJenjang.toUpperCase()} | Status: ${selectedStatus.toUpperCase()}`],
      [`Tanggal Cetak: ${todayStr} | Total Rekap: ${filteredData.length} Jam Pelajaran`],
      [], // Blank separator
      ['NO', 'TANGGAL', 'JENJANG', 'KODE GURU', 'NAMA GURU PENGAJAR', 'MATA PELAJARAN', 'KELAS', 'JAM KE', 'STATUS KEHADIRAN', 'CATATAN VERIFIKASI PIKET'],
    ];

    filteredData.forEach((item, idx) => {
      sheetData.push([
        idx + 1,
        item.attendanceDate,
        item.jenjang,
        item.teacherCode,
        item.teacherName,
        item.subject,
        item.className,
        `Jam ${item.periodNumber} (${item.periodTime})`,
        item.statusLabel,
        item.notes,
      ]);
    });

    // Summary Footer Row
    const presentCount = filteredData.filter((d) => d.status === 'PRESENT').length;
    const dutyCount = filteredData.filter((d) => d.status === 'DUTY').length;
    const permCount = filteredData.filter((d) => d.status === 'PERMISSION').length;
    const attendanceRate = Math.round(((presentCount + dutyCount) / filteredData.length) * 100);

    sheetData.push([]);
    sheetData.push(['', '', '', '', '', '', '', '', 'TOTAL JADWAL:', `${filteredData.length} Pelajaran`]);
    sheetData.push(['', '', '', '', '', '', '', '', 'HADIR & TUGAS:', `${presentCount + dutyCount} (${attendanceRate}%)`]);
    sheetData.push(['', '', '', '', '', '', '', '', 'IZIN / SAKIT:', `${permCount}`]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet['!cols'] = [
      { wch: 6 },  // NO
      { wch: 14 }, // TANGGAL
      { wch: 12 }, // JENJANG
      { wch: 14 }, // KODE GURU
      { wch: 32 }, // NAMA GURU
      { wch: 25 }, // MAPEL
      { wch: 14 }, // KELAS
      { wch: 22 }, // JAM KE
      { wch: 18 }, // STATUS
      { wch: 36 }, // CATATAN
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Presensi');
    XLSX.writeFile(workbook, `SIMOGU_Laporan_Presensi_${selectedJenjang}_${startDate}_sd_${endDate}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string, label: string) => {
    const badges: Record<string, string> = {
      PRESENT: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      PERMISSION: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      DUTY: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      ABSENT: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    };
    const cls = badges[status] || badges.PRESENT;
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${cls}`}>
        {label}
      </span>
    );
  };

  const getJenjangBadge = (jenjang: EducationLevel) => {
    const badges: Record<EducationLevel, string> = {
      SMP: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      SMA: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      SMK: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badges[jenjang] || badges.SMA}`}>
        {jenjang}
      </span>
    );
  };

  const columns: Column<ReportRowItem>[] = [
    {
      key: 'attendanceDate',
      header: 'Tanggal',
      render: (item) => <span className="font-mono text-xs font-semibold">{item.attendanceDate}</span>,
    },
    {
      key: 'jenjang',
      header: 'Jenjang',
      render: (item) => getJenjangBadge(item.jenjang),
    },
    {
      key: 'teacherName',
      header: 'Guru Pengajar',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{item.teacherName}</div>
          <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{item.teacherCode}</div>
        </div>
      ),
    },
    { key: 'subject', header: 'Mata Pelajaran' },
    {
      key: 'className',
      header: 'Kelas',
      render: (item) => (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          {item.className}
        </span>
      ),
    },
    {
      key: 'periodNumber',
      header: 'Jam Ke-',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">Jam {item.periodNumber}</div>
          <div className="text-[11px] font-mono text-slate-400">{item.periodTime}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Presensi',
      render: (item) => getStatusBadge(item.status, item.statusLabel),
    },
    {
      key: 'notes',
      header: 'Catatan Piket',
      render: (item) => <span className="text-xs text-slate-500 italic">{item.notes}</span>,
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      {/* Printable Official Kop Document Layout (Active during window.print()) */}
      <div className="hidden print:block text-black p-6 font-serif">
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide">PONDOK PESANTREN AL ITTIHAD</h1>
          <h2 className="text-base font-semibold">SISTEM MONITORING KEHADIRAN GURU (SIMOGU)</h2>
          <p className="text-xs">Jl. Raya Cianjur-Bandung Km 3, Karangtengah, Cianjur, Jawa Barat</p>
        </div>

        <div className="text-center my-4 space-y-1">
          <h3 className="text-sm font-bold uppercase underline">LAPORAN REKAPITULASI PRESENSI MENGAJAR GURU</h3>
          <p className="text-xs">
            Periode: {startDate} s/d {endDate} | Jenjang: {selectedJenjang.toUpperCase()} | Status: {selectedStatus.toUpperCase()}
          </p>
        </div>

        <table className="w-full border-collapse border border-black text-xs my-4">
          <thead>
            <tr className="bg-gray-200 border-b border-black">
              <th className="border border-black p-1.5 text-center">NO</th>
              <th className="border border-black p-1.5">TANGGAL</th>
              <th className="border border-black p-1.5">JENJANG</th>
              <th className="border border-black p-1.5">KODE</th>
              <th className="border border-black p-1.5">NAMA GURU</th>
              <th className="border border-black p-1.5">MAPEL</th>
              <th className="border border-black p-1.5">KELAS</th>
              <th className="border border-black p-1.5">JAM KE</th>
              <th className="border border-black p-1.5">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id} className="border-b border-black">
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5">{item.attendanceDate}</td>
                <td className="border border-black p-1.5">{item.jenjang}</td>
                <td className="border border-black p-1.5">{item.teacherCode}</td>
                <td className="border border-black p-1.5 font-bold">{item.teacherName}</td>
                <td className="border border-black p-1.5">{item.subject}</td>
                <td className="border border-black p-1.5">{item.className}</td>
                <td className="border border-black p-1.5">Jam {item.periodNumber}</td>
                <td className="border border-black p-1.5 font-bold">{item.statusLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan Validation Boxes */}
        <div className="flex justify-between items-start mt-12 pt-6 text-xs">
          <div className="text-center w-56">
            <p>Mengetahui,</p>
            <p className="font-bold">Pengasuh / Kepala Sekolah</p>
            <div className="h-16" />
            <p className="font-bold underline">( _______________________ )</p>
          </div>

          <div className="text-center w-56">
            <p>Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Petugas Piket & Absensi</p>
            <div className="h-16" />
            <p className="font-bold underline">( _______________________ )</p>
          </div>
        </div>
      </div>

      {/* Screen Interface (Hidden when Printing) */}
      <div className="print:hidden">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

          {/* Header Bar */}
          <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <Link
                href="/admin/dashboard"
                className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                  Pusat Laporan Presensi
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Ekspor Excel (.xlsx) & Cetak PDF Resmi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <LogoutButton size="sm" />
            </div>
          </header>

          {/* Ultra-Premium Glassmorphic Filter & Export Toolbar */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-3.5 border-l-4 border-l-brand-600 shadow-xl shadow-brand-500/5 relative z-30 overflow-visible">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
                  <Filter className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Filter Laporan Presensi
                </span>
              </div>

              {/* Action Buttons: Ekspor Excel & Cetak PDF */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> <span className="truncate">Ekspor Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> <span className="truncate">Cetak PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Select 1: Filter Jenjang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Jenjang Sekolah
                </label>
                <CustomSelect
                  options={[
                    { value: 'Semua', label: 'Semua Jenjang Sekolah', sublabel: 'SMP, SMA & SMK', icon: '🏫' },
                    { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)', icon: '🎒' },
                    { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)', icon: '🎓' },
                    { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)', icon: '⚙️' },
                  ]}
                  value={selectedJenjang}
                  onChange={setSelectedJenjang}
                  placeholder="-- Pilih Jenjang --"
                />
              </div>

              {/* Select 2: Filter Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status Kehadiran
                </label>
                <CustomSelect
                  options={[
                    { value: 'Semua', label: 'Semua Status Kehadiran', icon: '📋' },
                    { value: 'Hadir', label: 'Hadir Mengajar', icon: '✅' },
                    { value: 'Izin', label: 'Izin / Sakit', icon: '⏳' },
                    { value: 'Tugas Dinas', label: 'Tugas Dinas Luar', icon: '💼' },
                  ]}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="-- Pilih Status --"
                />
              </div>

              {/* Date Range Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rentang Tanggal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-400">s/d</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Table Preview Card */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pratinjau ({filteredData.length} Jam Pelajaran)</span>
              </div>
              <span className="text-xs font-mono text-brand-600 dark:text-brand-400">
                {selectedJenjang} | {selectedStatus}
              </span>
            </div>

            <DataTable
              data={filteredData}
              columns={columns}
              searchPlaceholder="Cari kode, nama guru, kelas, atau mapel dalam laporan..."
              pageSizeOptions={[5, 10, 20]}
            />
          </div>

          {/* Global Footer */}
          <Footer />

        </div>
      </div>
    </div>
  );
}
