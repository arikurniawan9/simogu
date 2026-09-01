'use client';

import React, { useState, useRef } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { School, Plus, Edit, Trash2, ArrowLeft, Download, Upload, FileSpreadsheet, GraduationCap, Building2, Wrench, Layers } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import { apiClient } from '@/lib/api-client';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  jenjang: EducationLevel;
  major?: string;
  homeroomTeacherName?: string;
  isActive: boolean;
}

const sampleClasses: ClassItem[] = [
  // SMP (Tingkat 7, 8, 9)
  { id: 'smp-1', name: 'VII A', grade: '7', jenjang: 'SMP', major: 'Umum', homeroomTeacherName: 'Drs. Ari Kurniawan, M.Pd.', isActive: true },
  { id: 'smp-2', name: 'VIII B', grade: '8', jenjang: 'SMP', major: 'Umum', homeroomTeacherName: 'Siti Rahma, S.Pd.', isActive: true },
  { id: 'smp-3', name: 'IX C', grade: '9', jenjang: 'SMP', major: 'Umum', homeroomTeacherName: 'Budi Santoso, S.T.', isActive: true },

  // SMA (Tingkat 10, 11, 12)
  { id: 'sma-1', name: 'X IPA 1', grade: '10', jenjang: 'SMA', major: 'IPA', homeroomTeacherName: 'Dewi Lestari, M.Sc.', isActive: true },
  { id: 'sma-2', name: 'XI IPS 2', grade: '11', jenjang: 'SMA', major: 'IPS', homeroomTeacherName: 'Ahmad Fauzi, S.Ag.', isActive: true },
  { id: 'sma-3', name: 'XII IPA 1', grade: '12', jenjang: 'SMA', major: 'IPA', homeroomTeacherName: 'Rina Wijaya, S.Kom.', isActive: true },

  // SMK (Tingkat 10, 11, 12 Kejuruan)
  { id: 'smk-1', name: 'X TKJ 1', grade: '10', jenjang: 'SMK', major: 'Teknik Komputer Jaringan', homeroomTeacherName: 'Hendra Saputra, S.Pd.', isActive: true },
  { id: 'smk-2', name: 'XI RPL 2', grade: '11', jenjang: 'SMK', major: 'Rekayasa Perangkat Lunak', homeroomTeacherName: 'Bambang Utomo, S.E.', isActive: true },
  { id: 'smk-3', name: 'XII AKL 1', grade: '12', jenjang: 'SMK', major: 'Akuntansi Keuangan', homeroomTeacherName: 'Novi Fitriani, S.Pd.', isActive: true },
];

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>(sampleClasses);
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');

  const fetchLiveClasses = async () => {
    const res = await apiClient.get<any>('/api/v1/classes?limit=100');
    if (res.success && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
      const mapped: ClassItem[] = res.data.items.map((c: any) => {
        let jenjang: EducationLevel = 'SMA';
        if (c.grade && ['7', '8', '9'].includes(String(c.grade))) jenjang = 'SMP';
        else if (c.major && (c.major.includes('TKJ') || c.major.includes('RPL') || c.major.includes('Kejuruan'))) jenjang = 'SMK';

        return {
          id: c.id,
          name: c.name,
          grade: String(c.grade || '10'),
          jenjang: jenjang,
          major: c.major || '',
          homeroomTeacherName: c.homeroomTeacher?.fullName || 'Belum Ditentukan',
          isActive: c.isActive,
        };
      });
      setClasses(mapped);
    }
  };

  React.useEffect(() => {
    fetchLiveClasses();
  }, []);

  // Real Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<'SKIP' | 'OVERWRITE'>('SKIP');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState('10');
  const [formJenjang, setFormJenjang] = useState<EducationLevel>('SMA');
  const [formMajor, setFormMajor] = useState('IPA');
  const [formHomeroom, setFormHomeroom] = useState('');

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState<ClassItem | null>(null);

  const handleExportExcel = async () => {
    if (filteredClasses.length === 0) {
      alert('Tidak ada data kelas yang sesuai filter untuk diekspor!');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sheetData: any[][] = [
      ['SIMOGU - SISTEM MONITORING KEHADIRAN & JADWAL MENGAJAR GURU'],
      [`MASTER DATA KELAS & ROMBEL (JENJANG: ${selectedJenjang.toUpperCase()})`],
      [`Tanggal Unduh: ${todayStr} | Total: ${filteredClasses.length} Kelas`],
      [],
      ['NO', 'JENJANG', 'NAMA KELAS', 'TINGKAT', 'JURUSAN / PEMINATAN', 'WALI KELAS PENANGGUNG JAWAB', 'STATUS'],
    ];

    filteredClasses.forEach((c, idx) => {
      sheetData.push([
        idx + 1,
        c.jenjang,
        c.name,
        `Tingkat ${c.grade}`,
        c.major || '-',
        c.homeroomTeacherName || '-',
        c.isActive ? 'Aktif' : 'Nonaktif',
      ]);
    });

    sheetData.push([]);
    sheetData.push(['', '', '', '', '', 'TOTAL ROMBEL KELAS:', `${filteredClasses.length} Kelas`]);

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet['!cols'] = [
      { wch: 6 },  // NO
      { wch: 12 }, // JENJANG
      { wch: 16 }, // NAMA KELAS
      { wch: 14 }, // TINGKAT
      { wch: 25 }, // JURUSAN
      { wch: 32 }, // WALI KELAS
      { wch: 12 }, // STATUS
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Data Kelas');
    XLSX.writeFile(workbook, `SIMOGU_Master_Kelas_${selectedJenjang}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = async () => {
    const templateRows = [
      {
        'Nama Kelas': 'VII A',
        'Tingkat': '7',
        'Jenjang': 'SMP',
      },
      {
        'Nama Kelas': 'VIII B',
        'Tingkat': '8',
        'Jenjang': 'SMP',
      },
      {
        'Nama Kelas': 'X IPA 1',
        'Tingkat': '10',
        'Jenjang': 'SMA',
      },
      {
        'Nama Kelas': 'XI IPS 2',
        'Tingkat': '11',
        'Jenjang': 'SMA',
      },
      {
        'Nama Kelas': 'X TKJ 1',
        'Tingkat': '10',
        'Jenjang': 'SMK',
      },
      {
        'Nama Kelas': 'XI RPL 2',
        'Tingkat': '11',
        'Jenjang': 'SMK',
      },
    ];

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(templateRows);

    // Set Column Widths for Optimal Readability
    worksheet['!cols'] = [
      { wch: 18 }, // Nama Kelas
      { wch: 12 }, // Tingkat
      { wch: 15 }, // Jenjang
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Kelas');
    XLSX.writeFile(workbook, 'Template_Import_Kelas_SIMOGU.xlsx');
  };

  const inferJenjang = (className: string, gradeStr: string): EducationLevel => {
    const nameUpper = className.toUpperCase();
    if (nameUpper.includes('TKJ') || nameUpper.includes('RPL') || nameUpper.includes('AKL') || nameUpper.includes('SMK')) {
      return 'SMK';
    }
    if (['7', '8', '9', 'VII', 'VIII', 'IX'].some((g) => nameUpper.includes(g) || gradeStr === g)) {
      return 'SMP';
    }
    return 'SMA';
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
        const XLSX = await import('xlsx');
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
          const name = String(r['Nama Kelas'] || r['name'] || '').trim();
          const grade = String(r['Tingkat'] || r['grade'] || '10').trim();
          const jenjangRaw = String(r['Jenjang'] || r['jenjang'] || '').trim().toUpperCase();
          const jenjang: EducationLevel = (['SMP', 'SMA', 'SMK'].includes(jenjangRaw) ? jenjangRaw : inferJenjang(name, grade)) as EducationLevel;

          return { name, grade, jenjang };
        });

        setParsedRows(formattedRows);

        try {
          const res = await fetch('/api/v1/classes/import/preview', {
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
      const isDuplicate = classes.some((c) => c.name === r.name);
      return {
        rowNum: i + 1,
        name: r.name,
        grade: r.grade,
        jenjang: r.jenjang,
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
      const res = await fetch('/api/v1/classes/import/excel', {
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
          `Berhasil mengimpor ${stats.successCount} kelas baru! (Diperbarui/Ditimpa: ${stats.updatedCount || 0}, Dilewati: ${stats.skippedCount || 0})`,
        );

        const newItems: ClassItem[] = parsedRows.map((r, idx) => ({
          id: `cls-imp-${Date.now()}-${idx}`,
          name: r.name,
          grade: r.grade,
          jenjang: r.jenjang || inferJenjang(r.name, r.grade),
          major: r.jenjang === 'SMK' ? 'Kejuruan' : r.jenjang === 'SMP' ? 'Umum' : 'IPA/IPS',
          isActive: true,
        }));

        setClasses((prev) => [...newItems, ...prev]);

        setTimeout(() => {
          setImportNotice(null);
          setImportModalOpen(false);
          setParsedRows([]);
          setPreviewData(null);
        }, 1500);
      } else {
        setImportError(data.error?.message || 'Gagal menyimpan data impor kelas ke server.');
      }
    } catch (err: any) {
      setImportError(`Kesalahan jaringan: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormName('');
    setFormGrade('10');
    setFormJenjang('SMA');
    setFormMajor('IPA');
    setFormHomeroom('');
    setFormOpen(true);
  };

  const handleOpenEdit = (item: ClassItem) => {
    setEditingClass(item);
    setFormName(item.name);
    setFormGrade(item.grade);
    setFormJenjang(item.jenjang);
    setFormMajor(item.major || '');
    setFormHomeroom(item.homeroomTeacherName || '');
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formGrade) {
      alert('Harap lengkapi nama kelas dan tingkat!');
      return;
    }

    if (editingClass) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                name: formName,
                grade: formGrade,
                jenjang: formJenjang,
                major: formMajor,
                homeroomTeacherName: formHomeroom,
              }
            : c,
        ),
      );
    } else {
      const newClass: ClassItem = {
        id: String(Date.now()),
        name: formName,
        grade: formGrade,
        jenjang: formJenjang,
        major: formMajor,
        homeroomTeacherName: formHomeroom,
        isActive: true,
      };
      setClasses((prev) => [newClass, ...prev]);
    }

    setFormOpen(false);
  };

  const handleOpenDelete = (item: ClassItem) => {
    setTargetClass(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (targetClass) {
      setClasses((prev) => prev.filter((c) => c.id !== targetClass.id));
    }
    setDeleteModalOpen(false);
  };

  const filteredClasses = selectedJenjang === 'Semua'
    ? classes
    : classes.filter((c) => c.jenjang === selectedJenjang);

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

  const columns: Column<ClassItem>[] = [
    {
      key: 'jenjang',
      header: 'Jenjang',
      render: (item) => getJenjangBadge(item.jenjang),
    },
    {
      key: 'name',
      header: 'Nama Kelas',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <School className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          {item.name}
        </span>
      ),
    },
    {
      key: 'grade',
      header: 'Tingkat',
      render: (item) => (
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Kelas {item.grade}
        </span>
      ),
    },
    {
      key: 'major',
      header: 'Jurusan / Peminatan',
      render: (item) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {item.major || '-'}
        </span>
      ),
    },
    {
      key: 'homeroomTeacherName',
      header: 'Wali Kelas',
      render: (item) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {item.homeroomTeacherName || 'Belum Ditentukan'}
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
            title="Edit Kelas"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(item)}
            className="p-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors"
            title="Hapus Kelas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
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
              <School className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                Master Data Kelas
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Rombel Kelas SMP / SMA / SMK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Multi-Jenjang Selection Bar (SMP, SMA, SMK) */}
        <div className="glass-card p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 sm:gap-3 overflow-x-auto border-l-4 border-l-brand-600">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 ml-1 mr-1 shrink-0">
            <Layers className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">Jenjang:</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedJenjang('Semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedJenjang === 'Semua'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50'
              }`}
            >
              Semua ({classes.length})
            </button>

            <button
              onClick={() => setSelectedJenjang('SMP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                selectedJenjang === 'SMP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> SMP ({classes.filter((c) => c.jenjang === 'SMP').length})
            </button>

            <button
              onClick={() => setSelectedJenjang('SMA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                selectedJenjang === 'SMA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> SMA ({classes.filter((c) => c.jenjang === 'SMA').length})
            </button>

            <button
              onClick={() => setSelectedJenjang('SMK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                selectedJenjang === 'SMK'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> SMK ({classes.filter((c) => c.jenjang === 'SMK').length})
            </button>
          </div>
        </div>

        {/* Main Data Table Card */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-3">
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                Daftar Kelas Jenjang <span className="text-brand-600">{selectedJenjang}</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {filteredClasses.length} Kelas Rombel Terdaftar
              </div>
            </div>

            {/* ACTION BUTTONS: Tambah, Ekspor, Impor */}
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
            data={filteredClasses}
            columns={columns}
            searchPlaceholder={`Cari nama kelas di jenjang ${selectedJenjang}...`}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

      </div>

      {/* Form Modal (Create / Edit) */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-3">
              {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenjang Pendidikan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formJenjang}
                  onChange={(e) => setFormJenjang(e.target.value as EducationLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="SMP">🎒 SMP (Tingkat 7, 8, 9)</option>
                  <option value="SMA">🎓 SMA (Tingkat 10, 11, 12 IPA/IPS)</option>
                  <option value="SMK">⚙️ SMK (Tingkat 10, 11, 12 Kejuruan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder={formJenjang === 'SMP' ? 'VII A' : formJenjang === 'SMK' ? 'X TKJ 1' : 'X IPA 1'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {formJenjang === 'SMP' ? (
                    <>
                      <option value="7">Kelas 7 (VII)</option>
                      <option value="8">Kelas 8 (VIII)</option>
                      <option value="9">Kelas 9 (IX)</option>
                    </>
                  ) : (
                    <>
                      <option value="10">Kelas 10 (X)</option>
                      <option value="11">Kelas 11 (XI)</option>
                      <option value="12">Kelas 12 (XII)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jurusan / Peminatan
                </label>
                <input
                  type="text"
                  value={formMajor}
                  onChange={(e) => setFormMajor(e.target.value)}
                  placeholder={formJenjang === 'SMK' ? 'TKJ / RPL / AKL' : formJenjang === 'SMP' ? 'Umum' : 'IPA / IPS'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Wali Kelas
                </label>
                <input
                  type="text"
                  value={formHomeroom}
                  onChange={(e) => setFormHomeroom(e.target.value)}
                  placeholder="Nama Guru Wali Kelas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        title="Hapus / Nonaktifkan Kelas"
        description={`Apakah Anda yakin ingin menonaktifkan kelas ${targetClass?.name} (${targetClass?.jenjang})?`}
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
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Impor & Pratinjau Data Kelas (SMP/SMA/SMK)</h3>
                <p className="text-[11px] text-slate-500">Pemeriksaan duplikasi & penanganan kelas per jenjang</p>
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
                <div className="text-[11px] text-slate-500">Format: Nama Kelas, Tingkat, Jenjang (SMP/SMA/SMK)</div>
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
                          <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span> ({p.jenjang} - Tingkat {p.grade})
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
                    Aksi Jika Ada Kelas Sudah Ada:
                  </label>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="classDupActionReal"
                        checked={duplicateAction === 'SKIP'}
                        onChange={() => setDuplicateAction('SKIP')}
                        className="accent-brand-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lewati Kelas Yang Sudah Ada (Rekomendasi)</div>
                        <div className="text-[10px] text-slate-500">Hanya menambah rombel kelas baru</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="classDupActionReal"
                        checked={duplicateAction === 'OVERWRITE'}
                        onChange={() => setDuplicateAction('OVERWRITE')}
                        className="accent-amber-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Timpa Data Kelas Lama</div>
                        <div className="text-[10px] text-slate-500">Memperbarui data tingkat dan wali kelas lama</div>
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

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
