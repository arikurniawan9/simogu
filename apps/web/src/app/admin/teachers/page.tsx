'use client';

import React, { useState, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { CustomSelect } from '@/components/custom-select';
import { Footer } from '@/components/footer';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Phone,
  BookOpen,
  Download,
  Upload,
  FileSpreadsheet,
  Filter,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Building2,
  GraduationCap,
  Wrench,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { LogoutButton } from '@/components/logout-button';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface TeacherItem {
  id: string;
  teacherCode: string;
  nip?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  whatsappNumber: string;
  subjects: string[]; // Support multiple subjects per teacher
  jenjangList: EducationLevel[]; // Multi-Jenjang support
  isActive: boolean;
}

const sampleTeachers: TeacherItem[] = [
  {
    id: '1',
    teacherCode: 'GRU-001',
    nip: '198001012005011001',
    fullName: 'Drs. Ari Kurniawan, M.Pd.',
    gender: 'MALE',
    whatsappNumber: '6281234567801',
    subjects: ['Matematika', 'Fisika'],
    jenjangList: ['SMP', 'SMA'],
    isActive: true,
  },
  {
    id: '2',
    teacherCode: 'GRU-002',
    nip: '198502022010012002',
    fullName: 'Siti Rahma, S.Pd.',
    gender: 'FEMALE',
    whatsappNumber: '6281234567802',
    subjects: ['Bahasa Indonesia', 'Bahasa Daerah'],
    jenjangList: ['SMP'],
    isActive: true,
  },
  {
    id: '3',
    teacherCode: 'GRU-003',
    nip: '198803032012011003',
    fullName: 'Budi Santoso, S.T.',
    gender: 'MALE',
    whatsappNumber: '6281234567803',
    subjects: ['Fisika', 'Informatika', 'Jaringan Komputer'],
    jenjangList: ['SMA', 'SMK'],
    isActive: true,
  },
  {
    id: '4',
    teacherCode: 'GRU-004',
    nip: '199004042015012004',
    fullName: 'Dewi Lestari, M.Sc.',
    gender: 'FEMALE',
    whatsappNumber: '6281234567804',
    subjects: ['Biologi', 'Kimia'],
    jenjangList: ['SMA'],
    isActive: true,
  },
  {
    id: '5',
    teacherCode: 'GRU-005',
    nip: '198205052008011005',
    fullName: 'Ahmad Fauzi, S.Ag.',
    gender: 'MALE',
    whatsappNumber: '6281234567805',
    subjects: ['Pendidikan Agama', 'Budi Pekerti'],
    jenjangList: ['SMP', 'SMA', 'SMK'],
    isActive: true,
  },
  {
    id: '6',
    teacherCode: 'GRU-006',
    nip: '199206062018012006',
    fullName: 'Rina Wijaya, S.Kom.',
    gender: 'FEMALE',
    whatsappNumber: '6281234567806',
    subjects: ['Pemrograman Web', 'Basis Data', 'Informatika'],
    jenjangList: ['SMK'],
    isActive: true,
  },
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>(sampleTeachers);

  // Filter States
  const [selectedJenjang, setSelectedJenjang] = useState<string>('');
  const [showAllTeachers, setShowAllTeachers] = useState<boolean>(false);

  // Real Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<'SKIP' | 'OVERWRITE'>('SKIP');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Modal State (Create / Edit Teacher)
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [formPhone, setFormPhone] = useState('');
  const [formSubjectsText, setFormSubjectsText] = useState(''); // Comma separated multiple subjects
  const [formJenjangList, setFormJenjangList] = useState<EducationLevel[]>(['SMA']);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetTeacher, setTargetTeacher] = useState<TeacherItem | null>(null);

  const handleShowAll = () => {
    setShowAllTeachers(true);
    setSelectedJenjang('Semua');
  };

  const handleResetFilter = () => {
    setSelectedJenjang('');
    setShowAllTeachers(false);
  };

  const isFilterActive = showAllTeachers || selectedJenjang !== '';

  const filteredTeachers = teachers.filter((t) => {
    if (showAllTeachers || selectedJenjang === 'Semua' || !selectedJenjang) {
      return true;
    }
    return t.jenjangList.includes(selectedJenjang as EducationLevel);
  });

  const handleExportExcel = () => {
    if (filteredTeachers.length === 0) {
      alert('Tidak ada data guru yang sesuai filter untuk diekspor!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const filterLabel = showAllTeachers || selectedJenjang === 'Semua'
      ? 'SEMUA JENJANG'
      : `JENJANG: ${selectedJenjang.toUpperCase()}`;

    const sheetData: any[][] = [
      ['SIMOGU - SISTEM MONITORING KEHADIRAN & JADWAL MENGAJAR GURU'],
      [`MASTER DATA GURU & PENGAJAR TERDAFTAR (${filterLabel})`],
      [`Tanggal Unduh: ${todayStr} | Total: ${filteredTeachers.length} Guru`],
      [],
      ['NO', 'KODE GURU', 'NIP', 'NAMA LENGKAP PENGAJAR', 'JENJANG MENGAJAR', 'GENDER', 'NO. WHATSAPP', 'MATA PELAJARAN (DAPAT >1)', 'STATUS'],
    ];

    filteredTeachers.forEach((t, idx) => {
      sheetData.push([
        idx + 1,
        t.teacherCode,
        t.nip || 'Non-NIP',
        t.fullName,
        t.jenjangList.join(', '),
        t.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan',
        t.whatsappNumber,
        t.subjects.join(', '),
        t.isActive ? 'Aktif' : 'Non-Aktif',
      ]);
    });

    sheetData.push([]);
    sheetData.push(['', '', '', '', '', '', '', 'TOTAL GURU AKTIF:', `${filteredTeachers.filter((t) => t.isActive).length} Pengajar`]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet['!cols'] = [
      { wch: 6 },  // NO
      { wch: 14 }, // KODE GURU
      { wch: 22 }, // NIP
      { wch: 32 }, // NAMA LENGKAP
      { wch: 20 }, // JENJANG MENGAJAR
      { wch: 14 }, // GENDER
      { wch: 18 }, // NO WA
      { wch: 32 }, // MAPEL (MULTIPLES)
      { wch: 12 }, // STATUS
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Data Guru');
    XLSX.writeFile(workbook, `SIMOGU_Master_Guru_${selectedJenjang || 'Semua'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Kode Guru': 'GRU-001',
        'Nama Lengkap': 'Drs. Ari Kurniawan, M.Pd.',
        'Mata Pelajaran (Pisahkan Koma jika >1)': 'Matematika, Fisika',
        'No. WhatsApp': '081234567890',
        'Jenjang (SMP,SMA,SMK)': 'SMP, SMA',
      },
      {
        'Kode Guru': 'GRU-002',
        'Nama Lengkap': 'Siti Rahma, S.Pd.',
        'Mata Pelajaran (Pisahkan Koma jika >1)': 'Bahasa Indonesia, Bahasa Daerah',
        'No. WhatsApp': '081234567891',
        'Jenjang (SMP,SMA,SMK)': 'SMP',
      },
      {
        'Kode Guru': 'GRU-003',
        'Nama Lengkap': 'Budi Santoso, S.T.',
        'Mata Pelajaran (Pisahkan Koma jika >1)': 'Fisika, Informatika, Pemrograman Web',
        'No. WhatsApp': '081234567892',
        'Jenjang (SMP,SMA,SMK)': 'SMA, SMK',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);

    worksheet['!cols'] = [
      { wch: 15 }, // Kode Guru
      { wch: 30 }, // Nama Lengkap
      { wch: 38 }, // Mata Pelajaran
      { wch: 18 }, // No. WhatsApp
      { wch: 24 }, // Jenjang
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Guru');
    XLSX.writeFile(workbook, 'Template_Import_Guru_SIMOGU.xlsx');
  };

  // Real File Upload & Sheet Parser
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

        const formattedRows = jsonRows.map((r) => {
          const rawJenjang = String(r['Jenjang (SMP,SMA,SMK)'] || r['Jenjang'] || 'SMA').trim();
          const jenjangList: EducationLevel[] = rawJenjang
            .split(',')
            .map((j) => j.trim().toUpperCase() as EducationLevel)
            .filter((j) => ['SMP', 'SMA', 'SMK'].includes(j));

          const rawSubject = String(r['Mata Pelajaran (Pisahkan Koma jika >1)'] || r['Mata Pelajaran'] || r['subject'] || '').trim();
          const subjects = rawSubject.split(',').map((s) => s.trim()).filter(Boolean);

          return {
            teacherCode: String(r['Kode Guru'] || r['teacherCode'] || '').trim(),
            fullName: String(r['Nama Lengkap'] || r['fullName'] || '').trim(),
            subjects: subjects.length > 0 ? subjects : ['Umum'],
            whatsappNumber: String(r['No. WhatsApp'] || r['whatsappNumber'] || '').trim(),
            jenjangList: jenjangList.length > 0 ? jenjangList : ['SMA'],
          };
        });

        setParsedRows(formattedRows);

        try {
          const res = await fetch('/api/v1/teachers/import/preview', {
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
    const previewItems = rows.map((r, i) => {
      const isDuplicate = teachers.some((t) => t.teacherCode === r.teacherCode);
      return {
        rowNum: i + 1,
        teacherCode: r.teacherCode,
        fullName: r.fullName,
        subjects: r.subjects,
        whatsappNumber: r.whatsappNumber,
        jenjangList: r.jenjangList,
        isDuplicate,
      };
    });

    const duplicateCount = previewItems.filter((p) => p.isDuplicate).length;
    setPreviewData({
      totalRows: rows.length,
      duplicateCount,
      newCount: rows.length - duplicateCount,
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
      const res = await fetch('/api/v1/teachers/import/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rows: parsedRows,
          duplicateAction,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const stats = data.data;
        setImportNotice(
          `Berhasil mengimpor ${stats.successCount} guru baru! (Diperbarui/Ditimpa: ${stats.updatedCount || 0}, Dilewati: ${stats.skippedCount || 0})`,
        );

        const newItems: TeacherItem[] = parsedRows.map((r, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          teacherCode: r.teacherCode,
          fullName: r.fullName,
          gender: 'MALE',
          whatsappNumber: r.whatsappNumber,
          subjects: r.subjects || ['Umum'],
          jenjangList: r.jenjangList || ['SMA'],
          isActive: true,
        }));

        setTeachers((prev) => [...newItems, ...prev]);

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

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormCode(`GRU-0${teachers.length + 1}`);
    setFormName('');
    setFormNip('');
    setFormGender('MALE');
    setFormPhone('');
    setFormSubjectsText('');
    setFormJenjangList(selectedJenjang && selectedJenjang !== 'Semua' ? [selectedJenjang as EducationLevel] : ['SMA']);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: TeacherItem) => {
    setEditingTeacher(item);
    setFormCode(item.teacherCode);
    setFormName(item.fullName);
    setFormNip(item.nip || '');
    setFormGender(item.gender);
    setFormPhone(item.whatsappNumber);
    setFormSubjectsText(item.subjects ? item.subjects.join(', ') : '');
    setFormJenjangList(item.jenjangList || ['SMA']);
    setFormOpen(true);
  };

  const toggleFormJenjang = (lvl: EducationLevel) => {
    setFormJenjangList((prev) => {
      if (prev.includes(lvl)) {
        if (prev.length === 1) return prev;
        return prev.filter((j) => j !== lvl);
      }
      return [...prev, lvl];
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formPhone || !formSubjectsText) {
      alert('Harap lengkapi kode guru, nama, WhatsApp, dan mata pelajaran!');
      return;
    }

    const parsedSubjects = formSubjectsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                teacherCode: formCode,
                fullName: formName,
                nip: formNip,
                gender: formGender,
                whatsappNumber: formPhone.replace(/^0/, '62'),
                subjects: parsedSubjects,
                jenjangList: formJenjangList,
              }
            : t,
        ),
      );
    } else {
      const newTeacher: TeacherItem = {
        id: String(Date.now()),
        teacherCode: formCode,
        nip: formNip,
        fullName: formName,
        gender: formGender,
        whatsappNumber: formPhone.replace(/^0/, '62'),
        subjects: parsedSubjects,
        jenjangList: formJenjangList,
        isActive: true,
      };
      setTeachers((prev) => [newTeacher, ...prev]);
    }

    if (selectedJenjang) {
      setShowAllTeachers(false);
    }
    setFormOpen(false);
  };

  const handleOpenDelete = (item: TeacherItem) => {
    setTargetTeacher(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (targetTeacher) {
      setTeachers((prev) => prev.filter((t) => t.id !== targetTeacher.id));
    }
    setDeleteModalOpen(false);
  };

  const renderJenjangBadges = (jenjangList: EducationLevel[]) => {
    const badges: Record<EducationLevel, { label: string; cls: string }> = {
      SMP: { label: 'SMP', cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
      SMA: { label: 'SMA', cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
      SMK: { label: 'SMK', cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    };

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {jenjangList.map((j) => {
          const b = badges[j] || badges.SMA;
          return (
            <span key={j} className={`px-2 py-0.5 rounded text-[11px] font-bold border ${b.cls}`}>
              {b.label}
            </span>
          );
        })}
      </div>
    );
  };

  const renderSubjectPills = (subjects: string[]) => {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {subjects.map((sub, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            <BookOpen className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            {sub}
          </span>
        ))}
      </div>
    );
  };

  const columns: Column<TeacherItem>[] = [
    {
      key: 'teacherCode',
      header: 'Kode Guru',
      render: (item) => (
        <span className="font-mono font-semibold text-brand-700 dark:text-brand-300">
          {item.teacherCode}
        </span>
      ),
    },
    {
      key: 'jenjangList',
      header: 'Jenjang Mengajar',
      render: (item) => renderJenjangBadges(item.jenjangList),
    },
    {
      key: 'fullName',
      header: 'Nama Guru',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</div>
          <div className="text-[11px] text-slate-400 font-mono">{item.nip ? `NIP: ${item.nip}` : 'Non-NIP'}</div>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Mata Pelajaran (Dapat > 1)',
      render: (item) => renderSubjectPills(item.subjects || []),
    },
    {
      key: 'whatsappNumber',
      header: 'No. WhatsApp',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          {item.whatsappNumber}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-800 transition-colors"
            title="Edit Guru"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(item)}
            className="p-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors"
            title="Nonaktifkan Guru"
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
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                Master Data Guru
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Multi-Jenjang (SMP/SMA/SMK) & Multi-Mapel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Ultra-Premium Glassmorphic Select Option Filter Container */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-3.5 border-l-4 border-l-brand-600 shadow-xl shadow-brand-500/5 transition-all relative z-30 overflow-visible">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Filter Jenjang Guru
              </span>
            </div>

            <button
              onClick={handleShowAll}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Tampilkan Semua Guru
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Pilih Jenjang Sekolah</span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">SMP / SMA / SMK</span>
            </label>

            <CustomSelect
              options={[
                { value: 'Semua', label: 'Semua Jenjang Sekolah', sublabel: 'Tampilkan pengajar SMP, SMA & SMK', icon: '🏫' },
                { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)', sublabel: 'Tampilkan hanya pengajar jenjang SMP', icon: '🎒' },
                { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)', sublabel: 'Tampilkan hanya pengajar jenjang SMA', icon: '🎓' },
                { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)', sublabel: 'Tampilkan hanya pengajar jenjang SMK', icon: '⚙️' },
              ]}
              value={selectedJenjang}
              onChange={(val) => {
                setSelectedJenjang(val);
                setShowAllTeachers(false);
              }}
              placeholder="-- Pilih Jenjang (SMP / SMA / SMK) --"
            />
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {!isFilterActive ? (
          /* Empty State */
          <div className="glass-card p-6 sm:p-12 rounded-2xl text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800 shadow-lg">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-slate-900 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-inner shadow-brand-500/10">
              <Search className="w-7 sm:w-8 h-7 sm:h-8 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Pilih Jenjang Mengajar Terlebih Dahulu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pilih jenjang sekolah pada pilihan di atas atau klik tombol <span className="font-bold text-brand-600">&apos;Tampilkan Semua Guru&apos;</span>.
              </p>
            </div>
          </div>
        ) : (
          /* Active Data Table Card with Integrated Actions inside Header */
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-3">
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Menampilkan Guru:</span>
                  <span className="text-brand-600 font-black">
                    {selectedJenjang === 'Semua' || showAllTeachers ? 'Semua Jenjang' : `Jenjang ${selectedJenjang}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {filteredTeachers.length} Guru
                  </span>
                  <button
                    onClick={handleResetFilter}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS INSIDE CARD HEADER: Tambah Guru, Ekspor, Impor */}
              <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenCreate}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> <span className="truncate">Tambah</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> <span className="truncate">Ekspor</span>
                </button>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> <span className="truncate">Impor</span>
                </button>
              </div>
            </div>

            <DataTable
              data={filteredTeachers}
              columns={columns}
              searchPlaceholder="Cari kode, nama, NIP, atau mata pelajaran guru..."
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        )}

        {/* Global Footer */}
        <Footer />

      </div>

      {/* Form Modal (Create / Edit Teacher with Multi-Jenjang & Multi-Subject support) */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">Lengkapi profil, multi-jenjang & multi-mapel</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenjang Mengajar (Pilih &gt; 1) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SMP', 'SMA', 'SMK'] as EducationLevel[]).map((lvl) => {
                    const isChecked = formJenjangList.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => toggleFormJenjang(lvl)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          isChecked
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {lvl === 'SMP' ? '🎒 SMP' : lvl === 'SMA' ? '🎓 SMA' : '⚙️ SMK'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="GRU-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Drs. Ari Kurniawan, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran (Pisahkan Koma jika &gt; 1) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSubjectsText}
                  onChange={(e) => setFormSubjectsText(e.target.value)}
                  required
                  placeholder="Contoh: Matematika, Fisika, Informatika"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Nonaktifkan / Soft Delete Guru"
        description={`Apakah Anda yakin ingin menonaktifkan guru ${targetTeacher?.fullName}? Data historis absensi akan tetap tersimpan aman di database.`}
        variant="danger"
        confirmText="Ya, Nonaktifkan"
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
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Impor & Pratinjau Data Guru via Excel</h3>
                <p className="text-[11px] text-slate-500">Pemeriksaan duplikasi & penanganan data ganda</p>
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
                <div className="text-[11px] text-slate-500">Format: Kode Guru, Nama Lengkap, Mapel, No. WA, Jenjang (SMP,SMA,SMK)</div>
              </div>

              {previewData && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Pratinjau File: {previewData.totalRows} Baris</span>
                    <span className={previewData.duplicateCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {previewData.newCount} Baru | {previewData.duplicateCount} Duplikat
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                    {previewData.previewItems.map((p: any) => (
                      <div
                        key={p.rowNum}
                        className={`p-2 bg-white dark:bg-slate-900 border rounded text-[11px] flex items-center justify-between ${
                          p.isDuplicate ? 'border-rose-200 dark:border-rose-900' : 'border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{p.teacherCode}</span> - {p.fullName} ({Array.isArray(p.subjects) ? p.subjects.join(', ') : p.subject})
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isDuplicate
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {p.isDuplicate ? 'Sudah Ada' : 'Baru'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewData && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Aksi Jika Ada Data Sudah Ada / Duplikat:
                  </label>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="teacherDupActionReal"
                        checked={duplicateAction === 'SKIP'}
                        onChange={() => setDuplicateAction('SKIP')}
                        className="accent-brand-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lewati Data Yang Sudah Ada (Rekomendasi)</div>
                        <div className="text-[10px] text-slate-500">Hanya mengimpor data pengajar baru, tidak mengubah data lama</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="teacherDupActionReal"
                        checked={duplicateAction === 'OVERWRITE'}
                        onChange={() => setDuplicateAction('OVERWRITE')}
                        className="accent-amber-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Timpa Data Lama Dengan Data Baru</div>
                        <div className="text-[10px] text-slate-500">Memperbarui nama, mapel, dan No. WA guru yang sudah terdaftar</div>
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
                {isProcessing ? 'Memproses...' : duplicateAction === 'SKIP' ? 'Mulai Impor & Lewati Duplikat' : 'Mulai Impor & Timpa Data Lama'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
