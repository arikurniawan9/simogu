'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import { AttendanceActionDropdown, AttendanceStatus } from '@/components/attendance-action-dropdown';
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowLeft,
  Calendar as CalendarIcon,
  BookOpen,
  AlertCircle,
  Layers,
  Building2,
  GraduationCap,
  Wrench,
  ChevronRight,
  XCircle,
  Users,
  User,
  Edit3,
  Send,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface PiketScheduleItem {
  id: string;
  teacherCode: string;
  teacherName: string;
  subject: string;
  className: string;
  jenjang: EducationLevel;
  periodNumber: number;
  periodTime: string;
  attendanceStatus: AttendanceStatus;
}

// Default jadwal kelas -> otomatis HADIR
const generateClassSchedule = (className: string, jenjang: EducationLevel, date: string): PiketScheduleItem[] => {
  const times = [
    '07:00 - 07:45',
    '07:45 - 08:30',
    '08:30 - 09:15',
    '09:30 - 10:15',
    '10:15 - 11:00',
    '11:00 - 11:45',
    '12:30 - 13:15',
    '13:15 - 14:00',
  ];

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Sejarah', 'Penjas', 'Seni Budaya', 'Pendidikan Agama'];
  const teachers = ['Drs. Ari Kurniawan, M.Pd.', 'Siti Rahma, S.Pd.', 'Budi Santoso, S.T.', 'Dewi Lestari, M.Sc.', 'Hendra Saputra, S.Pd.'];
  
  // Use date to slightly offset teachers for variety
  const dayNum = new Date(date).getDay();

  return times.map((time, idx) => ({
    id: `sch-${jenjang}-${className}-${date}-${idx + 1}`,
    teacherCode: `GRU-00${(idx % 5) + 1}`,
    teacherName: teachers[(idx + dayNum) % teachers.length],
    subject: subjects[(idx + dayNum) % subjects.length],
    className: className,
    jenjang: jenjang,
    periodNumber: idx + 1,
    periodTime: time,
    attendanceStatus: 'HADIR', // Default HADIR
  }));
};

const CLASSES_BY_JENJANG = {
  SMP: ['VII A', 'VII B', 'VIII A', 'VIII B', 'IX A', 'IX B'],
  SMA: ['X MIPA 1', 'X IPS 1', 'XI MIPA 1', 'XI IPS 1', 'XII MIPA 1', 'XII IPS 1'],
  SMK: ['X TKJ 1', 'X RPL 1', 'XI TKJ 1', 'XI RPL 1', 'XII TKJ 1', 'XII RPL 1'],
};

export default function PiketAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedJenjang, setSelectedJenjang] = useState<EducationLevel | null>(null);
  const [pendingJenjang, setPendingJenjang] = useState<EducationLevel | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  const [schedulesByClass, setSchedulesByClass] = useState<Record<string, PiketScheduleItem[]>>({});
  const [classWorkflow, setClassWorkflow] = useState<Record<string, 'DRAFT' | 'SAVED' | 'EDITING' | 'PENDING_APPROVAL'>>({});
  const [shiftFinished, setShiftFinished] = useState(false);
  
  const [confirmItem, setConfirmItem] = useState<{ id: string; status: AttendanceStatus } | null>(null);
  const [workflowActionType, setWorkflowActionType] = useState<'SIMPAN' | 'AJUKAN_EDIT' | 'KIRIM_EDIT' | 'FINISH_SHIFT' | 'CONTINUE_SHIFT' | 'START_SHIFT' | 'START_EDIT_SHIFT' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalVariant, setModalVariant] = useState<'warning' | 'danger' | 'success' | 'info'>('info');
  const [modalConfirmText, setModalConfirmText] = useState('Konfirmasi');
  
  const [piketName, setPiketName] = useState('Petugas Piket');

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem('simogu_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setPiketName(user.name);
        }
      }
    } catch(e) {}
  }, []);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('simogu_edit_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        const latestRequests = parsed.reduce((acc: any, req: any) => {
          if (!acc[req.className] || new Date(req.createdAt) > new Date(acc[req.className].createdAt)) {
            acc[req.className] = req;
          }
          return acc;
        }, {});
        
        setClassWorkflow(prev => {
          const next = { ...prev };
          Object.keys(latestRequests).forEach(className => {
            const req = latestRequests[className];
            if (req.status === 'PENDING') {
              next[className] = 'PENDING_APPROVAL';
            } else if (req.status === 'APPROVED' || req.status === 'REJECTED') {
              next[className] = 'SAVED';
            }
          });
          return next;
        });
      }
    } catch(e) {}
  }, []);

  const isSunday = new Date(selectedDate).getDay() === 0;

  React.useEffect(() => {
    setClassWorkflow({});
    setShiftFinished(false);
    setSelectedJenjang(null);
    setSelectedClass('');
  }, [selectedDate]);

  const jenjangConfig = {
    SMP: {
      label: 'SMP', fullLabel: 'Sekolah Menengah Pertama', icon: Building2,
      gradient: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800', hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    SMA: {
      label: 'SMA', fullLabel: 'Sekolah Menengah Atas', icon: GraduationCap,
      gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800', hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      color: 'text-blue-600 dark:text-blue-400',
    },
    SMK: {
      label: 'SMK', fullLabel: 'Sekolah Menengah Kejuruan', icon: Wrench,
      gradient: 'from-amber-500 to-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800', hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
      badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      color: 'text-amber-600 dark:text-amber-400',
    },
  };

  const isShiftStarted = Object.keys(classWorkflow).length > 0;
  const isAllClassesSaved = selectedJenjang
    ? CLASSES_BY_JENJANG[selectedJenjang].every((cls) => classWorkflow[cls] === 'SAVED' || classWorkflow[cls] === 'PENDING_APPROVAL')
    : false;

  const handleInterceptNavigation = (e: React.MouseEvent) => {
    if (isShiftStarted && !shiftFinished) {
      e.preventDefault();
      e.stopPropagation();
      setModalTitle('Peringatan: Shift Belum Disimpan');
      setModalDesc('Anda belum menyimpan kegiatan absensi secara keseluruhan. Harap selesaikan absensi dan klik tombol "Simpan & Akhiri Tugas" di bawah sebelum meninggalkan halaman.');
      setModalVariant('warning');
      setModalConfirmText('Lanjutkan Absen');
      setWorkflowActionType('CONTINUE_SHIFT');
      setModalOpen(true);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (isShiftStarted && !shiftFinished) {
      e.preventDefault();
      setModalTitle('Peringatan: Shift Belum Disimpan');
      setModalDesc('Anda belum menyimpan kegiatan absensi secara keseluruhan. Harap selesaikan absensi dan klik tombol "Simpan & Akhiri Tugas" di bawah sebelum berpindah tanggal.');
      setModalVariant('warning');
      setModalConfirmText('Lanjutkan Absen');
      setWorkflowActionType('CONTINUE_SHIFT');
      setModalOpen(true);
      return;
    }
    setSelectedDate(newDate);
  };

  const handleSelectJenjang = (j: EducationLevel) => {
    const isFinished = localStorage.getItem(`simogu_finished_${j}_${selectedDate}`);
    
    setPendingJenjang(j);
    
    if (isFinished) {
      setWorkflowActionType('START_EDIT_SHIFT');
      setModalTitle(`Absensi ${j} Selesai`);
      setModalDesc(`Absensi untuk jenjang ${jenjangConfig[j].fullLabel} hari ini sudah diselesaikan. Apakah Anda ingin mengajukan edit data?`);
      setModalVariant('warning');
      setModalConfirmText('Ajukan Edit Data');
      setModalOpen(true);
    } else {
      setWorkflowActionType('START_SHIFT');
      setModalTitle(`Mulai Shift ${j}`);
      setModalDesc(`Anda akan memulai sesi absensi untuk ${jenjangConfig[j].fullLabel}. Lanjutkan?`);
      setModalVariant('info');
      setModalConfirmText('Mulai Absensi');
      setModalOpen(true);
    }
  };

  const handleBackToJenjang = (e?: React.MouseEvent) => {
    if (isShiftStarted && !shiftFinished) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setModalTitle('Peringatan: Shift Belum Disimpan');
      setModalDesc('Harap selesaikan absensi semua kelas dan klik tombol "Simpan & Akhiri Tugas" di bawah sebelum memilih jenjang lain.');
      setModalVariant('warning');
      setModalConfirmText('Lanjutkan Absen');
      setWorkflowActionType('CONTINUE_SHIFT');
      setModalOpen(true);
      return;
    }
    setSelectedJenjang(null);
    setSelectedClass('');
  };

  const handleSelectClass = (className: string) => {
    setSelectedClass(className);
    
    if (className && selectedJenjang && !schedulesByClass[className]) {
      setSchedulesByClass(prev => ({
        ...prev,
        [className]: generateClassSchedule(className, selectedJenjang, selectedDate)
      }));
    }
  };

  const currentSchedules = selectedClass ? (schedulesByClass[selectedClass] || []) : [];

  const getStats = () => {
    return {
      total: currentSchedules.length,
      hadir: currentSchedules.filter((s) => s.attendanceStatus === 'HADIR').length,
      tanpaKeterangan: currentSchedules.filter((s) => s.attendanceStatus === 'TANPA_KETERANGAN').length,
      izinSakit: currentSchedules.filter((s) => s.attendanceStatus === 'IZIN' || s.attendanceStatus === 'SAKIT').length,
      lainnya: currentSchedules.filter((s) => s.attendanceStatus === 'PENDING' || s.attendanceStatus === 'TUGAS_DINAS').length,
    };
  };

  const handleSelectAction = (id: string, status: AttendanceStatus) => {
    setConfirmItem({ id, status });
    const labelMap: Record<string, string> = { HADIR: 'Hadir', PENDING: 'Pending', IZIN: 'Izin', SAKIT: 'Sakit', TUGAS_DINAS: 'Tugas Dinas', TANPA_KETERANGAN: 'Tanpa Keterangan' };
    setModalTitle(`Konfirmasi: Set ${labelMap[status]}`);
    setModalDesc(`Anda akan mengubah status kehadiran guru ini menjadi "${labelMap[status]}". Lanjutkan?`);
    setModalVariant(
      status === 'HADIR' ? 'success' : 
      status === 'TANPA_KETERANGAN' ? 'danger' :
      status === 'PENDING' ? 'warning' : 'info'
    );
    setModalConfirmText('Simpan Absensi');
    setModalOpen(true);
  };

  const handleConfirmRecord = () => {
    if (workflowActionType) {
      if (workflowActionType === 'SIMPAN' && selectedClass) {
        setClassWorkflow(prev => ({ ...prev, [selectedClass]: 'SAVED' }));
      } else if (workflowActionType === 'AJUKAN_EDIT' && selectedClass) {
        setClassWorkflow(prev => ({ ...prev, [selectedClass]: 'EDITING' }));
      } else if (workflowActionType === 'KIRIM_EDIT' && selectedClass) {
        setClassWorkflow(prev => ({ ...prev, [selectedClass]: 'PENDING_APPROVAL' }));
        const editRequests = JSON.parse(localStorage.getItem('simogu_edit_requests') || '[]');
        editRequests.push({
          id: `cr-${Date.now()}`,
          className: selectedClass,
          jenjang: selectedJenjang,
          status: 'PENDING',
          requesterName: piketName,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('simogu_edit_requests', JSON.stringify(editRequests));
      } else if (workflowActionType === 'FINISH_SHIFT') {
        if (selectedJenjang) {
          localStorage.setItem(`simogu_finished_${selectedJenjang}_${selectedDate}`, 'true');
          localStorage.setItem(`simogu_schedules_${selectedJenjang}_${selectedDate}`, JSON.stringify(schedulesByClass));
        }
        setShiftFinished(true);
        setClassWorkflow({});
        setModalTitle('Tugas Shift Selesai');
        setModalDesc('Seluruh kegiatan absensi hari ini berhasil disimpan. Terima kasih atas kerja kerasnya!');
        setModalOpen(true);
        setWorkflowActionType(null);
        setTimeout(() => {
          setModalOpen(false);
          setSelectedJenjang(null);
          setSelectedClass('');
          setShiftFinished(false);
        }, 1500);
        return;
      } else if (workflowActionType === 'CONTINUE_SHIFT') {
        if (selectedJenjang) {
          const classes = CLASSES_BY_JENJANG[selectedJenjang];
          const unsavedClass = classes.find(c => classWorkflow[c] !== 'SAVED' && classWorkflow[c] !== 'PENDING_APPROVAL');
          if (unsavedClass) {
            handleSelectClass(unsavedClass);
          }
        }
        setWorkflowActionType(null);
        setModalOpen(false);
        return;
      } else if (workflowActionType === 'START_SHIFT' && pendingJenjang) {
        setSelectedJenjang(pendingJenjang);
        setSelectedClass('');
        setPendingJenjang(null);
        setWorkflowActionType(null);
        setModalOpen(false);
        return;
      } else if (workflowActionType === 'START_EDIT_SHIFT' && pendingJenjang) {
        setSelectedJenjang(pendingJenjang);
        setSelectedClass('');
        
        // Restore all classes to SAVED state
        const classes = CLASSES_BY_JENJANG[pendingJenjang];
        const restoredWorkflow: Record<string, any> = {};
        classes.forEach(c => restoredWorkflow[c] = 'SAVED');
        setClassWorkflow(restoredWorkflow);
        
        // Restore schedules
        const savedSchedules = localStorage.getItem(`simogu_schedules_${pendingJenjang}_${selectedDate}`);
        if (savedSchedules) {
          setSchedulesByClass(JSON.parse(savedSchedules));
        }

        setPendingJenjang(null);
        setWorkflowActionType(null);
        setModalOpen(false);
        return;
      }
      setWorkflowActionType(null);
      setModalOpen(false);
      return;
    }

    if (confirmItem) {
      setSchedulesByClass((prev) => {
        const classSchedule = prev[selectedClass] || [];
        return {
          ...prev,
          [selectedClass]: classSchedule.map((s) => 
            s.id === confirmItem.id ? { ...s, attendanceStatus: confirmItem.status } : s
          )
        };
      });
      setConfirmItem(null);
      setModalOpen(false);
    }
  };

  const statusBadges: Record<string, { label: string; cls: string }> = {
    HADIR: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    IZIN: { label: 'Izin', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    SAKIT: { label: 'Sakit', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
    TANPA_KETERANGAN: { label: 'Tanpa Keterangan', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
    TUGAS_DINAS: { label: 'Tugas Dinas', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
    PENDING: { label: 'Pending', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  };

  const columns: Column<PiketScheduleItem>[] = [
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
      header: 'Guru & Mapel',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{item.teacherName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-brand-500" /> {item.subject}
          </div>
        </div>
      ),
    },
    {
      key: 'attendanceStatus',
      header: 'Status Absensi',
      render: (item) => {
        const b = statusBadges[item.attendanceStatus] || statusBadges.HADIR;
        return (
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${b.cls}`}>
            {b.label}
          </span>
        );
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item) => {
        const currentWorkflow = selectedClass ? (classWorkflow[selectedClass] || 'DRAFT') : 'DRAFT';
        const isLocked = currentWorkflow === 'SAVED' || currentWorkflow === 'PENDING_APPROVAL';
        return (
          <AttendanceActionDropdown
            currentStatus={item.attendanceStatus}
            onSelect={(status) => handleSelectAction(item.id, status)}
            disabled={isLocked}
          />
        );
      },
    },
  ];

  const cfg = selectedJenjang ? jenjangConfig[selectedJenjang] : null;
  const stats = getStats();

  return (
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto min-w-0">
            {selectedJenjang ? (
              <button
                onClick={handleBackToJenjang}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                title="Kembali ke Pilih Jenjang"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/piket/dashboard"
                className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                title="Refresh Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className={`w-9 sm:w-10 h-9 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br ${cfg ? cfg.gradient : 'from-brand-400 via-brand-500 to-brand-700'} flex items-center justify-center text-white shadow-md shadow-brand-500/25 transition-all duration-300`}>
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2 truncate">
                {selectedJenjang ? `Presensi ${selectedJenjang}` : 'Pencatatan Presensi Guru'}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg ? cfg.badge : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-800'}`}>
                  {selectedJenjang ? jenjangConfig[selectedJenjang].label : 'Piket'}
                </span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                <label className="flex items-center gap-1 cursor-pointer">
                  <CalendarIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                    className="bg-transparent border-none p-0 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                  />
                </label>
                <span>•</span>
                <span className="truncate">{piketName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0" onClickCapture={handleInterceptNavigation}>
            <Link
              href="/settings/profile"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil Pengguna"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* STEP 1: Pilih Jenjang */}
        {!selectedJenjang && (
          <div className="glass-card p-4 sm:p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            {isSunday ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Hari Minggu / Libur</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tidak ada kegiatan KBM atau jadwal mengajar terjadwal pada hari ini.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50">
                    Pilih Jenjang Presensi
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {(Object.keys(jenjangConfig) as EducationLevel[]).map((j) => {
                    const c = jenjangConfig[j];
                    const IconComp = c.icon;
                    return (
                      <button
                        key={j}
                        onClick={() => handleSelectJenjang(j)}
                        className={`group relative p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 hover:shadow-lg ${c.bg} ${c.border} ${c.hoverBorder}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-md`}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <ChevronRight className={`w-5 h-5 ${c.color} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                        </div>
                        <div className={`text-2xl font-black ${c.color} mb-0.5`}>{j}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{c.fullLabel}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Pilih Kelas & Tampilkan Data */}
        {selectedJenjang && cfg && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Pemilihan Kelas (Grid/Chips) */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden space-y-3">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500 rounded-l-2xl"></div>
              
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
                <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm sm:text-base">Pilih Rombel Kelas {selectedJenjang}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {CLASSES_BY_JENJANG[selectedJenjang].map((cls) => {
                  const isSelected = selectedClass === cls;
                  const workflowState = classWorkflow[cls];
                  const isSaved = workflowState === 'SAVED';
                  const isPending = workflowState === 'PENDING_APPROVAL';

                  let buttonStyle = '';
                  if (isSelected) {
                    if (isSaved) buttonStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30 scale-[1.02]';
                    else if (isPending) buttonStyle = 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/30 scale-[1.02]';
                    else buttonStyle = 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 scale-[1.02]';
                  } else {
                    if (isSaved) buttonStyle = 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400';
                    else if (isPending) buttonStyle = 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:border-purple-400';
                    else buttonStyle = 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-600 dark:hover:text-brand-400';
                  }

                  return (
                    <button
                      key={cls}
                      onClick={() => handleSelectClass(cls)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border-2 flex items-center justify-center gap-1.5 active:scale-95 ${buttonStyle}`}
                    >
                      {isSaved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {cls}
                    </button>
                  );
                })}
              </div>

              {isAllClassesSaved && !shiftFinished && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95 duration-500">
                  <div className="text-emerald-800 dark:text-emerald-300 text-center sm:text-left">
                    <h4 className="font-bold text-xs sm:text-sm">Semua Kelas Selesai Diabsen!</h4>
                    <p className="text-[11px] opacity-90">Simpan dan akhiri tugas piket jenjang {selectedJenjang}.</p>
                  </div>
                  <button
                    onClick={() => { setWorkflowActionType('FINISH_SHIFT'); setModalTitle('Akhiri Tugas Absensi'); setModalDesc(`Apakah Anda yakin semua absensi untuk jenjang ${selectedJenjang} sudah benar dan ingin menyimpan seluruh kegiatannya?`); setModalVariant('success'); setModalConfirmText('Akhiri Tugas'); setModalOpen(true); }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan & Akhiri Tugas
                  </button>
                </div>
              )}
            </div>

            {selectedClass && (
              <>
                {/* Data Table */}
                <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      {(() => { const IC = cfg.icon; return <IC className={`w-5 h-5 ${cfg.color}`} />; })()}
                      <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                        Presensi Kelas {selectedClass}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border self-start sm:self-auto ${cfg.badge}`}>
                      {stats.total} Jam Pelajaran
                    </span>
                  </div>
                  
                  <DataTable
                    data={currentSchedules}
                    columns={columns}
                    searchPlaceholder={`Cari mapel atau guru...`}
                    pageSizeOptions={[8, 16]}
                    rowClassName={(item) => item.attendanceStatus === 'TANPA_KETERANGAN' ? '!bg-rose-50/70 dark:!bg-rose-950/30 border-l-4 !border-rose-500' : ''}
                  />

                  {currentSchedules.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      {(!classWorkflow[selectedClass] || classWorkflow[selectedClass] === 'DRAFT') && (
                        <button
                          onClick={() => { setWorkflowActionType('SIMPAN'); setModalTitle('Simpan Absensi'); setModalDesc(`Apakah Anda yakin ingin menyimpan data absensi untuk kelas ${selectedClass}? Data tidak dapat diedit langsung setelah disimpan.`); setModalVariant('info'); setModalConfirmText('Simpan'); setModalOpen(true); }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Simpan Absensi
                        </button>
                      )}
                      {classWorkflow[selectedClass] === 'SAVED' && (
                        <button
                          onClick={() => { setWorkflowActionType('AJUKAN_EDIT'); setModalTitle('Ajukan Edit Absensi'); setModalDesc(`Anda akan membuka kunci data absensi kelas ${selectedClass} untuk diedit. Setelah diedit, perubahan harus disetujui Admin. Lanjutkan?`); setModalVariant('warning'); setModalConfirmText('Buka Kunci'); setModalOpen(true); }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> Ajukan Edit
                        </button>
                      )}
                      {classWorkflow[selectedClass] === 'EDITING' && (
                        <button
                          onClick={() => { setWorkflowActionType('KIRIM_EDIT'); setModalTitle('Kirim Pengajuan Edit'); setModalDesc(`Kirim perubahan absensi kelas ${selectedClass} ke Admin untuk disetujui? Data akan dikunci hingga disetujui.`); setModalVariant('info'); setModalConfirmText('Kirim Pengajuan'); setModalOpen(true); }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Kirim Pengajuan Edit
                        </button>
                      )}
                      {classWorkflow[selectedClass] === 'PENDING_APPROVAL' && (
                        <button
                          disabled
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Clock className="w-4 h-4" /> Menunggu Persetujuan Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <Footer />

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingJenjang(null);
        }}
        onConfirm={handleConfirmRecord}
        title={modalTitle}
        description={modalDesc}
        variant={modalVariant}
        confirmText={modalConfirmText}
      />
    </div>
  );
}
