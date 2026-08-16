'use client';

import React, { useState, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { CustomSelect } from '@/components/custom-select';
import { Footer } from '@/components/footer';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  AlertTriangle,
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  Building2,
  GraduationCap,
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { LogoutButton } from '@/components/logout-button';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface ScheduleItem {
  id: string;
  teacherName: string;
  className: string;
  jenjang: EducationLevel;
  periodNumber: number;
  periodTime: string;
  dayOfWeek: string;
  subject: string;
  isActive: boolean;
}

interface PreviewItem {
  rowNum: number;
  dayOfWeek: string;
  teacherCode: string;
  teacherName?: string | null;
  className: string;
  periodNumber: number;
  subject: string;
  isConflict: boolean;
  conflictReason?: string | null;
}

const sampleSchedules: ScheduleItem[] = [
  // SMP
  { id: 'smp-sch-1', teacherName: 'Drs. Ari Kurniawan, M.Pd.', className: 'VII A', jenjang: 'SMP', periodNumber: 1, periodTime: '07:00 - 07:45', dayOfWeek: 'Senin', subject: 'Matematika SMP', isActive: true },
  { id: 'smp-sch-2', teacherName: 'Siti Rahma, S.Pd.', className: 'VIII B', jenjang: 'SMP', periodNumber: 2, periodTime: '07:45 - 08:30', dayOfWeek: 'Senin', subject: 'Bahasa Indonesia SMP', isActive: true },
  { id: 'smp-sch-3', teacherName: 'Budi Santoso, S.T.', className: 'IX C', jenjang: 'SMP', periodNumber: 1, periodTime: '07:00 - 07:45', dayOfWeek: 'Selasa', subject: 'IPA SMP', isActive: true },

  // SMA
  { id: 'sma-sch-1', teacherName: 'Budi Santoso, S.T.', className: 'X IPA 1', jenjang: 'SMA', periodNumber: 1, periodTime: '07:00 - 07:45', dayOfWeek: 'Senin', subject: 'Fisika SMA', isActive: true },
  { id: 'sma-sch-2', teacherName: 'Dewi Lestari, M.Sc.', className: 'XI IPS 2', jenjang: 'SMA', periodNumber: 3, periodTime: '08:30 - 09:15', dayOfWeek: 'Selasa', subject: 'Biologi SMA', isActive: true },

  // SMK
  { id: 'smk-sch-1', teacherName: 'Hendra Saputra, S.Pd.', className: 'X TKJ 1', jenjang: 'SMK', periodNumber: 4, periodTime: '09:30 - 10:15', dayOfWeek: 'Rabu', subject: 'Jaringan Komputer SMK', isActive: true },
  { id: 'smk-sch-2', teacherName: 'Rina Wijaya, S.Kom.', className: 'XI RPL 2', jenjang: 'SMK', periodNumber: 5, periodTime: '10:15 - 11:00', dayOfWeek: 'Kamis', subject: 'Pemrograman Web SMK', isActive: true },
];

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(sampleSchedules);

  // Filter States
  const [selectedJenjang, setSelectedJenjang] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [showToday, setShowToday] = useState<boolean>(false);

  // Create / Edit Schedule Form Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formJenjang, setFormJenjang] = useState<EducationLevel>('SMA');
  const [formDay, setFormDay] = useState<string>('Senin');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formClassName, setFormClassName] = useState('');
  const [formPeriodNumber, setFormPeriodNumber] = useState<number>(1);
  const [formPeriodTime, setFormPeriodTime] = useState('07:00 - 07:45');
  const [formSubject, setFormSubject] = useState('');

  // Real Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [conflictAction, setConflictAction] = useState<'SKIP' | 'OVERWRITE'>('SKIP');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<{
    totalRows: number;
    conflictCount: number;
    newCount: number;
    previewItems: PreviewItem[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetSchedule, setTargetSchedule] = useState<ScheduleItem | null>(null);

  const handleExportExcel = () => {
    if (filteredSchedules.length === 0) {
      alert('Tidak ada data jadwal yang sesuai filter untuk diekspor!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const filterLabel = showToday
      ? 'SEMUA HARI INI'
      : `JENJANG: ${selectedJenjang || 'SEMUA'} | HARI: ${selectedDay || 'SEMUA'}`;

    // Premium Spreadsheet Banner & Data Rows
    const sheetData: any[][] = [
      ['SIMOGU - SISTEM MONITORING KEHADIRAN & JADWAL MENGAJAR GURU'],
      [`LAPORAN REKAPITULASI JADWAL MENGAJAR (${filterLabel.toUpperCase()})`],
      [`Tanggal Unduh: ${todayStr} | Total: ${filteredSchedules.length} Jam Pelajaran`],
      [], // Blank separator
      ['NO', 'JENJANG', 'HARI', 'JAM KE', 'WAKTU PELAJARAN', 'NAMA KELAS', 'NAMA GURU PENGAJAR', 'MATA PELAJARAN'],
    ];

    filteredSchedules.forEach((s, idx) => {
      sheetData.push([
        idx + 1,
        s.jenjang,
        s.dayOfWeek,
        `Jam ${s.periodNumber}`,
        s.periodTime,
        s.className,
        s.teacherName,
        s.subject,
      ]);
    });

    // Footer Summary Row
    sheetData.push([]);
    sheetData.push(['', '', '', '', '', '', 'TOTAL JADWAL:', `${filteredSchedules.length} Pelajaran`]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set Column Widths for Optimal Readability & Professional Layout
    worksheet['!cols'] = [
      { wch: 6 },  // NO
      { wch: 12 }, // JENJANG
      { wch: 12 }, // HARI
      { wch: 10 }, // JAM KE
      { wch: 18 }, // WAKTU
      { wch: 15 }, // NAMA KELAS
      { wch: 32 }, // NAMA GURU
      { wch: 28 }, // MATA PELAJARAN
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Mengajar');

    const fileLabel = showToday
      ? 'Hari_Ini'
      : `${selectedJenjang || 'Semua'}_${selectedDay || 'Semua'}`;

    const fileName = `SIMOGU_Jadwal_Mengajar_${fileLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Hari': 'Senin',
        'Kode Guru': 'GRU-001',
        'Nama Kelas': 'VII A',
        'Jam Ke': 1,
        'Mata Pelajaran': 'Matematika SMP',
      },
      {
        'Hari': 'Senin',
        'Kode Guru': 'GRU-002',
        'Nama Kelas': 'VIII B',
        'Jam Ke': 2,
        'Mata Pelajaran': 'Bahasa Indonesia SMP',
      },
      {
        'Hari': 'Senin',
        'Kode Guru': 'GRU-003',
        'Nama Kelas': 'X IPA 1',
        'Jam Ke': 1,
        'Mata Pelajaran': 'Fisika SMA',
      },
      {
        'Hari': 'Selasa',
        'Kode Guru': 'GRU-004',
        'Nama Kelas': 'XI IPS 2',
        'Jam Ke': 3,
        'Mata Pelajaran': 'Biologi SMA',
      },
      {
        'Hari': 'Rabu',
        'Kode Guru': 'GRU-005',
        'Nama Kelas': 'X TKJ 1',
        'Jam Ke': 4,
        'Mata Pelajaran': 'Jaringan Komputer SMK',
      },
      {
        'Hari': 'Kamis',
        'Kode Guru': 'GRU-006',
        'Nama Kelas': 'XI RPL 2',
        'Jam Ke': 5,
        'Mata Pelajaran': 'Pemrograman Web SMK',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);

    // Set Column Widths for Optimal Readability
    worksheet['!cols'] = [
      { wch: 12 }, // Hari
      { wch: 15 }, // Kode Guru
      { wch: 15 }, // Nama Kelas
      { wch: 10 }, // Jam Ke
      { wch: 28 }, // Mata Pelajaran
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Jadwal');
    XLSX.writeFile(workbook, 'Template_Import_Jadwal_SIMOGU.xlsx');
  };

  const inferJenjang = (className: string): EducationLevel => {
    const nameUpper = className.toUpperCase();
    if (nameUpper.includes('TKJ') || nameUpper.includes('RPL') || nameUpper.includes('AKL') || nameUpper.includes('SMK')) {
      return 'SMK';
    }
    if (nameUpper.includes('VII') || nameUpper.includes('VIII') || nameUpper.includes('IX')) {
      return 'SMP';
    }
    return 'SMA';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonRows.length === 0) {
          setImportError('File Excel kosong atau tidak berformat valid.');
          setIsProcessing(false);
          return;
        }

        const formattedRows = jsonRows.map((r) => ({
          dayOfWeek: r['Hari'] || r['dayOfWeek'] || 'Senin',
          teacherCode: String(r['Kode Guru'] || r['teacherCode'] || '').trim(),
          className: String(r['Nama Kelas'] || r['className'] || '').trim(),
          periodNumber: Number(r['Jam Ke'] || r['periodNumber'] || 1),
          subject: String(r['Mata Pelajaran'] || r['subject'] || '').trim(),
        }));

        setParsedRows(formattedRows);

        try {
          const res = await fetch('/api/v1/schedules/import/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: formattedRows }),
          });

          if (res.ok) {
            const apiRes = await res.json();
            if (apiRes.success && apiRes.data) {
              setPreviewData(apiRes.data);
            } else {
              fallbackClientPreview(formattedRows);
            }
          } else {
            fallbackClientPreview(formattedRows);
          }
        } catch {
          fallbackClientPreview(formattedRows);
        }
      } catch (err: any) {
        setImportError(`Gagal membaca file Excel: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const fallbackClientPreview = (rows: any[]) => {
    const previewItems: PreviewItem[] = rows.map((r, i) => {
      const isConflict = schedules.some(
        (s) => s.dayOfWeek === r.dayOfWeek && s.periodNumber === r.periodNumber && s.className === r.className,
      );
      return {
        rowNum: i + 1,
        dayOfWeek: r.dayOfWeek,
        teacherCode: r.teacherCode,
        className: r.className,
        periodNumber: r.periodNumber,
        subject: r.subject,
        isConflict,
        conflictReason: isConflict ? 'Bentrok dengan jadwal mengajar kelas yang ada' : null,
      };
    });

    const conflictCount = previewItems.filter((p) => p.isConflict).length;
    setPreviewData({
      totalRows: rows.length,
      conflictCount,
      newCount: rows.length - conflictCount,
      previewItems,
    });
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      alert('Pilih file spreadsheet Excel terlebih dahulu!');
      return;
    }

    setIsProcessing(true);
    setImportError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
      const res = await fetch('/api/v1/schedules/import/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rows: parsedRows,
          conflictAction,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const stats = data.data;
        setImportNotice(
          `Berhasil mengimpor ${stats.successCount} jadwal baru! (Diperbarui/Ditimpa: ${stats.updatedCount || 0}, Dilewati: ${stats.skippedCount || 0})`,
        );

        const newItems: ScheduleItem[] = parsedRows
          .filter((_, idx) => !previewData?.previewItems[idx]?.isConflict || conflictAction === 'OVERWRITE')
          .map((r, idx) => ({
            id: `sch-imp-${Date.now()}-${idx}`,
            teacherName: r.teacherCode,
            className: r.className,
            jenjang: inferJenjang(r.className),
            periodNumber: r.periodNumber,
            periodTime: `Jam ${r.periodNumber}`,
            dayOfWeek: r.dayOfWeek,
            subject: r.subject,
            isActive: true,
          }));

        setSchedules((prev) => [...newItems, ...prev]);

        setTimeout(() => {
          setImportNotice(null);
          setImportModalOpen(false);
          setParsedRows([]);
          setPreviewData(null);
        }, 1500);
      } else {
        setImportError(data.error?.message || 'Gagal menyimpan data impor ke server.');
      }
    } catch (err: any) {
      setImportError(`Kesalahan jaringan: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create / Edit Modal Handlers
  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormJenjang((selectedJenjang && selectedJenjang !== 'Semua' ? selectedJenjang : 'SMA') as EducationLevel);
    setFormDay(selectedDay && selectedDay !== 'Semua' ? selectedDay : 'Senin');
    setFormTeacherName('');
    setFormClassName('');
    setFormPeriodNumber(1);
    setFormPeriodTime('07:00 - 07:45');
    setFormSubject('');
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setFormJenjang(item.jenjang);
    setFormDay(item.dayOfWeek);
    setFormTeacherName(item.teacherName);
    setFormClassName(item.className);
    setFormPeriodNumber(item.periodNumber);
    setFormPeriodTime(item.periodTime);
    setFormSubject(item.subject);
    setFormOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName || !formClassName || !formSubject) {
      alert('Harap lengkapi nama guru, kelas, dan mata pelajaran!');
      return;
    }

    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                jenjang: formJenjang,
                dayOfWeek: formDay,
                teacherName: formTeacherName,
                className: formClassName,
                periodNumber: formPeriodNumber,
                periodTime: formPeriodTime,
                subject: formSubject,
              }
            : s,
        ),
      );
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        jenjang: formJenjang,
        dayOfWeek: formDay,
        teacherName: formTeacherName,
        className: formClassName,
        periodNumber: formPeriodNumber,
        periodTime: formPeriodTime,
        subject: formSubject,
        isActive: true,
      };
      setSchedules((prev) => [newItem, ...prev]);
    }

    // Auto-set filter so new schedule is visible
    setSelectedJenjang(formJenjang);
    setSelectedDay(formDay);
    setShowToday(false);
    setFormOpen(false);
  };

  const handleShowToday = () => {
    setShowToday(true);
    setSelectedJenjang('Semua');
    setSelectedDay('Senin');
  };

  const handleResetFilter = () => {
    setSelectedJenjang('');
    setSelectedDay('');
    setShowToday(false);
  };

  const isFilterActive = showToday || (selectedJenjang !== '' && selectedDay !== '');

  const filteredSchedules = schedules.filter((s) => {
    if (showToday) return true;
    const jenjangMatch = selectedJenjang === 'Semua' || s.jenjang === selectedJenjang;
    const dayMatch = selectedDay === 'Semua' || s.dayOfWeek === selectedDay;
    return jenjangMatch && dayMatch;
  });

  const getJenjangBadge = (jenjang: EducationLevel) => {
    const badges: Record<EducationLevel, { label: string; cls: string }> = {
      SMP: { label: 'SMP', cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
      SMA: { label: 'SMA', cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
      SMK: { label: 'SMK', cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    };
    const b = badges[jenjang] || badges.SMA;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${b.cls}`}>
        {b.label}
      </span>
    );
  };

  const handleOpenDelete = (item: ScheduleItem) => {
    setTargetSchedule(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (targetSchedule) {
      setSchedules((prev) => prev.filter((s) => s.id !== targetSchedule.id));
    }
    setDeleteModalOpen(false);
  };

  const columns: Column<ScheduleItem>[] = [
    {
      key: 'jenjang',
      header: 'Jenjang',
      render: (item) => getJenjangBadge(item.jenjang),
    },
    {
      key: 'dayOfWeek',
      header: 'Hari',
      render: (item) => (
        <span className="font-bold text-brand-700 dark:text-brand-300">
          {item.dayOfWeek}
        </span>
      ),
    },
    {
      key: 'periodNumber',
      header: 'Jam Ke-',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">Jam {item.periodNumber}</div>
          <div className="text-[11px] font-mono text-slate-400">{item.periodTime}</div>
        </div>
      ),
    },
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
      key: 'teacherName',
      header: 'Guru & Mata Pelajaran',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{item.teacherName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.subject}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-800 transition-colors"
            title="Edit Jadwal"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(item)}
            className="p-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors"
            title="Hapus Jadwal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="p-4 glass-card rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Jadwal Mengajar (SMP / SMA / SMK)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih opsi jenjang dan hari untuk menampilkan data jadwal mengajar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
              <LogoutButton size="sm" />
          </div>
        </header>

        {/* Ultra-Premium Glassmorphic Select Option Filter Container */}
        <div className="glass-card p-4 sm:p-6 rounded-lg space-y-4 border-l-4 border-l-brand-600 shadow-xl shadow-brand-500/5 transition-all relative z-30 overflow-visible">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Filter Interaktif Jadwal Mengajar
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleShowToday}
                className="w-full sm:w-auto px-4 py-2 rounded-md text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Tampilkan Semua Jadwal Hari Ini
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Step 1: Premium Select Jenjang */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>1. Pilih Jenjang Sekolah</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">Langkah 1 dari 2</span>
              </label>
              <CustomSelect
                options={[
                  { value: 'Semua', label: 'Semua Jenjang Sekolah', sublabel: 'Tampilkan jadwal SMP, SMA & SMK', icon: '🏫' },
                  { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)', sublabel: 'Tampilkan jadwal jenjang SMP', icon: '🎒' },
                  { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)', sublabel: 'Tampilkan jadwal jenjang SMA', icon: '🎓' },
                  { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)', sublabel: 'Tampilkan jadwal jenjang SMK', icon: '⚙️' },
                ]}
                value={selectedJenjang}
                onChange={(val) => {
                  setSelectedJenjang(val);
                  setShowToday(false);
                }}
                placeholder="-- Pilih Jenjang (SMP / SMA / SMK) --"
              />
            </div>

            {/* Step 2: Premium Select Hari */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>2. Pilih Hari Pelajaran</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">Langkah 2 dari 2</span>
              </label>
              <CustomSelect
                disabled={!selectedJenjang && !showToday}
                options={[
                  { value: 'Semua', label: 'Semua Hari Pelajaran', sublabel: 'Tampilkan seluruh hari Senin - Sabtu', icon: '📅' },
                  { value: 'Senin', label: 'Hari Senin', icon: '📌' },
                  { value: 'Selasa', label: 'Hari Selasa', icon: '📌' },
                  { value: 'Rabu', label: 'Hari Rabu', icon: '📌' },
                  { value: 'Kamis', label: 'Hari Kamis', icon: '📌' },
                  { value: 'Jumat', label: 'Hari Jumat', icon: '📌' },
                  { value: 'Sabtu', label: 'Hari Sabtu', icon: '📌' },
                ]}
                value={selectedDay}
                onChange={(val) => {
                  setSelectedDay(val);
                  setShowToday(false);
                }}
                placeholder="-- Pilih Hari Pelajaran --"
              />
            </div>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {!isFilterActive ? (
          /* Empty State: Animated prompt card */
          <div className="glass-card p-8 sm:p-12 rounded-lg text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-slate-900 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-inner shadow-brand-500/10">
              <Search className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Silakan Pilih Opsi Filter Terlebih Dahulu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pilih <span className="font-bold text-slate-700 dark:text-slate-300">Jenjang Sekolah</span> dan <span className="font-bold text-slate-700 dark:text-slate-300">Hari Pelajaran</span> pada Select Option di atas untuk memuat data jadwal mengajar, atau klik tombol <span className="font-bold text-brand-600">&apos;Tampilkan Semua Jadwal Hari Ini&apos;</span>.
              </p>
            </div>
          </div>
        ) : (
          /* Active Data Table Card with Integrated Action Toolbar Inside */
          <div className="glass-card p-4 sm:p-6 rounded-lg space-y-4 transition-all duration-300">
            {/* Toolbar Inside Table Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Menampilkan Jadwal:</span>
                  <span className="text-brand-600 font-black">
                    {showToday ? 'Semua Jadwal Hari Ini' : `Jenjang ${selectedJenjang} - Hari ${selectedDay}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {filteredSchedules.length} Jam Pelajaran
                  </span>
                  <button
                    onClick={handleResetFilter}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS INSIDE CARD HEADER: Tambah Jadwal, Ekspor, Impor */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  onClick={handleOpenCreate}
                  className="px-3.5 py-2 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                >
                  <Plus className="w-4 h-4" /> Tambah Jadwal
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-2 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                >
                  <Download className="w-3.5 h-3.5" /> Ekspor
                </button>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-3 py-2 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                >
                  <Upload className="w-3.5 h-3.5" /> Impor
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                data={filteredSchedules}
                columns={columns}
                searchPlaceholder={`Cari guru, kelas, atau mapel (${selectedJenjang} - ${selectedDay})...`}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          </div>
        )}

        {/* Global Footer */}
        <Footer />

      </div>

      {/* Create / Edit Schedule Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {editingSchedule ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">Lengkapi rincian jadwal jam pelajaran guru</p>
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenjang Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={formJenjang}
                    onChange={(val) => setFormJenjang(val as EducationLevel)}
                    options={[
                      { value: 'SMP', label: 'SMP', icon: '🎒', sublabel: 'Sekolah Menengah Pertama' },
                      { value: 'SMA', label: 'SMA', icon: '🎓', sublabel: 'Sekolah Menengah Atas' },
                      { value: 'SMK', label: 'SMK', icon: '⚙️', sublabel: 'Sekolah Menengah Kejuruan' }
                    ]}
                    placeholder="Pilih Jenjang"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hari Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={formDay}
                    onChange={(val) => setFormDay(val)}
                    options={[
                      { value: 'Senin', label: 'Senin', icon: '🗓️' },
                      { value: 'Selasa', label: 'Selasa', icon: '🗓️' },
                      { value: 'Rabu', label: 'Rabu', icon: '🗓️' },
                      { value: 'Kamis', label: 'Kamis', icon: '🗓️' },
                      { value: 'Jumat', label: 'Jumat', icon: '🗓️' },
                      { value: 'Sabtu', label: 'Sabtu', icon: '🗓️' },
                    ]}
                    placeholder="Pilih Hari"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Guru Pengajar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  required
                  placeholder="Drs. Ari Kurniawan, M.Pd."
                  className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kelas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    required
                    placeholder="X IPA 1"
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Ke- <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formPeriodNumber}
                    onChange={(e) => setFormPeriodNumber(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Jam Pelajaran
                </label>
                <input
                  type="text"
                  value={formPeriodTime}
                  onChange={(e) => setFormPeriodTime(e.target.value)}
                  placeholder="07:00 - 07:45"
                  className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  placeholder="Matematika / Fisika..."
                  className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition-colors"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Jadwal Mengajar"
        description={`Apakah Anda yakin ingin menghapus jadwal ${targetSchedule?.teacherName} (${targetSchedule?.subject}) di kelas ${targetSchedule?.className}?`}
        variant="danger"
        confirmText="Ya, Hapus"
      />

      {/* Real Import Excel Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Impor Data Jadwal Mengajar via Excel</h3>
                <p className="text-[11px] text-slate-500">Unggah file spreadsheet `.xlsx` jadwal pelajaran</p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {importNotice && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {importNotice}
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-md text-xs font-semibold text-rose-700 dark:text-rose-300">
                {importError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleDownloadTemplate}
                className="w-full py-2 px-3 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-brand-600" /> Unduh Format Template Excel (.xlsx)
              </button>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-lg p-6 text-center space-y-2 hover:border-amber-500 transition-colors cursor-pointer bg-amber-50/40 dark:bg-amber-950/20"
              >
                <Upload className="w-8 h-8 text-amber-600 mx-auto" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {parsedRows.length > 0
                    ? `File Terpilih: ${parsedRows.length} Baris Data`
                    : 'Klik Di Sini Untuk Memilih File Excel (.xlsx)'}
                </div>
                <div className="text-[11px] text-slate-500">Kolom wajib: Hari, Kode Guru, Nama Kelas, Jam Ke, Mapel</div>
              </div>

              {previewData && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Pratinjau File: {previewData.totalRows} Baris</span>
                    <span className={previewData.conflictCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {previewData.newCount} Valid | {previewData.conflictCount} Bentrok Detected
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                    {previewData.previewItems.map((p) => (
                      <div
                        key={p.rowNum}
                        className={`p-2 bg-white dark:bg-slate-900 border rounded text-[11px] flex items-center justify-between ${
                          p.isConflict ? 'border-rose-200 dark:border-rose-900' : 'border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {p.dayOfWeek}, Jam ke-{p.periodNumber}
                          </span>{' '}
                          - {p.teacherCode} ({p.className} - {p.subject})
                          {p.conflictReason && (
                            <div className="text-[10px] text-rose-500 italic mt-0.5">{p.conflictReason}</div>
                          )}
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isConflict
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {p.isConflict ? 'Bentrok' : 'Valid'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewData && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Aksi Jika Ada Jadwal Bentrok:
                  </label>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleConflictActionReal"
                        checked={conflictAction === 'SKIP'}
                        onChange={() => setConflictAction('SKIP')}
                        className="accent-brand-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lewati Jadwal Yang Bentrok (Rekomendasi)</div>
                        <div className="text-[10px] text-slate-500">Hanya mengimpor jadwal yang valid dan tidak bentrok</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleConflictActionReal"
                        checked={conflictAction === 'OVERWRITE'}
                        onChange={() => setConflictAction('OVERWRITE')}
                        className="accent-amber-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Timpa Jadwal Lama Dengan Jadwal Baru</div>
                        <div className="text-[10px] text-slate-500">Menghapus jadwal lama yang bentrok dan menggantinya dengan jadwal baru</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="px-4 py-2 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow-md shadow-amber-600/20"
              >
                {isProcessing ? 'Memproses...' : conflictAction === 'SKIP' ? 'Mulai Impor & Lewati Bentrok' : 'Mulai Impor & Timpa Bentrok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
