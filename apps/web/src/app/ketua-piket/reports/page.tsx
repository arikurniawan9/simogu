'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import {
  FileSpreadsheet,
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Users,
  Search,
  BookOpen,
  Award,
  ChevronDown,
  User,
  Percent,
} from 'lucide-react';
import Link from 'next/link';

export type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type EducationLevel = 'Semua' | 'SMP' | 'SMA' | 'SMK';

interface DailyReportItem {
  id: string;
  date: string;
  teacherCode: string;
  teacherName: string;
  jenjang: 'SMP' | 'SMA' | 'SMK';
  subject: string;
  className: string;
  periodNumber: number;
  periodTime: string;
  status: 'PRESENT' | 'PERMISSION' | 'DUTY' | 'SICK' | 'ABSENT';
  statusLabel: string;
  notes: string;
}

interface SummaryReportItem {
  teacherCode: string;
  teacherName: string;
  jenjang: 'SMP' | 'SMA' | 'SMK';
  subject: string;
  totalScheduleHours: number;
  presentHours: number;
  permissionHours: number;
  dutyHours: number;
  sickHours: number;
  absentHours: number;
  attendanceRate: number; // in percentage, e.g. 87.5%
  absenceRate: number;    // in percentage, e.g. 12.5%
}

const mockDailyData: DailyReportItem[] = [
  { id: '1', date: '2026-09-01', teacherCode: 'GRU-001', teacherName: 'Drs. Ari Kurniawan, M.Pd.', jenjang: 'SMA', subject: 'Matematika Peminatan', className: 'X IPA 1', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi hadir tepat waktu' },
  { id: '2', date: '2026-09-01', teacherCode: 'GRU-001', teacherName: 'Drs. Ari Kurniawan, M.Pd.', jenjang: 'SMA', subject: 'Matematika Peminatan', className: 'X IPA 1', periodNumber: 2, periodTime: '07:45 - 08:30', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi hadir tepat waktu' },
  { id: '3', date: '2026-09-01', teacherCode: 'GRU-002', teacherName: 'Siti Rahma, S.Pd.', jenjang: 'SMA', subject: 'Bahasa Indonesia', className: 'X IPA 1', periodNumber: 3, periodTime: '08:30 - 09:15', status: 'PERMISSION', statusLabel: 'Izin Resmi', notes: 'Izin MGMP - Di-ACC Ketua Piket' },
  { id: '4', date: '2026-09-01', teacherCode: 'GRU-003', teacherName: 'Budi Santoso, S.T.', jenjang: 'SMK', subject: 'Informatika & Jaringan', className: 'X TKJ 1', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'DUTY', statusLabel: 'Tugas Dinas', notes: 'Lomba Robotik - Di-ACC Ketua Piket' },
  { id: '5', date: '2026-09-01', teacherCode: 'GRU-004', teacherName: 'Dewi Lestari, M.Sc.', jenjang: 'SMP', subject: 'IPA Terpadu', className: 'VII A', periodNumber: 4, periodTime: '09:30 - 10:15', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi hadir tepat waktu' },
  { id: '6', date: '2026-09-01', teacherCode: 'GRU-005', teacherName: 'Ahmad Fauzi, S.Ag.', jenjang: 'SMP', subject: 'Pendidikan Agama Islam', className: 'VIII B', periodNumber: 1, periodTime: '07:00 - 07:45', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi hadir tepat waktu' },
  { id: '7', date: '2026-09-01', teacherCode: 'GRU-006', teacherName: 'Rina Wijaya, S.Kom.', jenjang: 'SMK', subject: 'Pemrograman Web', className: 'XI RPL 2', periodNumber: 2, periodTime: '07:45 - 08:30', status: 'PRESENT', statusLabel: 'Hadir', notes: 'Terverifikasi hadir tepat waktu' },
];

const mockWeeklyData: SummaryReportItem[] = [
  { teacherCode: 'GRU-001', teacherName: 'Drs. Ari Kurniawan, M.Pd.', jenjang: 'SMA', subject: 'Matematika Peminatan', totalScheduleHours: 18, presentHours: 18, permissionHours: 0, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
  { teacherCode: 'GRU-002', teacherName: 'Siti Rahma, S.Pd.', jenjang: 'SMA', subject: 'Bahasa Indonesia', totalScheduleHours: 16, presentHours: 14, permissionHours: 2, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 87.5, absenceRate: 12.5 },
  { teacherCode: 'GRU-003', teacherName: 'Budi Santoso, S.T.', jenjang: 'SMK', subject: 'Informatika & Jaringan', totalScheduleHours: 20, presentHours: 16, permissionHours: 0, dutyHours: 4, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
  { teacherCode: 'GRU-004', teacherName: 'Dewi Lestari, M.Sc.', jenjang: 'SMP', subject: 'IPA Terpadu', totalScheduleHours: 16, presentHours: 16, permissionHours: 0, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
  { teacherCode: 'GRU-005', teacherName: 'Ahmad Fauzi, S.Ag.', jenjang: 'SMP', subject: 'Pendidikan Agama Islam', totalScheduleHours: 14, presentHours: 12, permissionHours: 0, dutyHours: 0, sickHours: 2, absentHours: 0, attendanceRate: 85.7, absenceRate: 14.3 },
  { teacherCode: 'GRU-006', teacherName: 'Rina Wijaya, S.Kom.', jenjang: 'SMK', subject: 'Pemrograman Web', totalScheduleHours: 18, presentHours: 18, permissionHours: 0, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
];

const mockMonthlyData: SummaryReportItem[] = [
  { teacherCode: 'GRU-001', teacherName: 'Drs. Ari Kurniawan, M.Pd.', jenjang: 'SMA', subject: 'Matematika Peminatan', totalScheduleHours: 72, presentHours: 70, permissionHours: 2, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 97.2, absenceRate: 2.8 },
  { teacherCode: 'GRU-002', teacherName: 'Siti Rahma, S.Pd.', jenjang: 'SMA', subject: 'Bahasa Indonesia', totalScheduleHours: 64, presentHours: 58, permissionHours: 4, dutyHours: 2, sickHours: 0, absentHours: 0, attendanceRate: 93.8, absenceRate: 6.2 },
  { teacherCode: 'GRU-003', teacherName: 'Budi Santoso, S.T.', jenjang: 'SMK', subject: 'Informatika & Jaringan', totalScheduleHours: 80, presentHours: 72, permissionHours: 0, dutyHours: 8, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
  { teacherCode: 'GRU-004', teacherName: 'Dewi Lestari, M.Sc.', jenjang: 'SMP', subject: 'IPA Terpadu', totalScheduleHours: 64, presentHours: 62, permissionHours: 0, dutyHours: 0, sickHours: 2, absentHours: 0, attendanceRate: 96.9, absenceRate: 3.1 },
  { teacherCode: 'GRU-005', teacherName: 'Ahmad Fauzi, S.Ag.', jenjang: 'SMP', subject: 'Pendidikan Agama Islam', totalScheduleHours: 56, presentHours: 52, permissionHours: 0, dutyHours: 0, sickHours: 4, absentHours: 0, attendanceRate: 92.9, absenceRate: 7.1 },
  { teacherCode: 'GRU-006', teacherName: 'Rina Wijaya, S.Kom.', jenjang: 'SMK', subject: 'Pemrograman Web', totalScheduleHours: 72, presentHours: 72, permissionHours: 0, dutyHours: 0, sickHours: 0, absentHours: 0, attendanceRate: 100, absenceRate: 0 },
];

export default function KetuaPiketReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('DAILY');
  const [selectedJenjang, setSelectedJenjang] = useState<EducationLevel>('Semua');
  const [selectedDate, setSelectedDate] = useState('2026-09-01');
  const [selectedWeek, setSelectedWeek] = useState('2026-W36');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Daily Data
  const filteredDaily = mockDailyData.filter((item) => {
    const matchJenjang = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
    const matchSearch =
      !searchQuery ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenjang && matchSearch;
  });

  // Filter Summary Data (Weekly / Monthly)
  const currentSummaryData = period === 'WEEKLY' ? mockWeeklyData : mockMonthlyData;
  const filteredSummary = currentSummaryData.filter((item) => {
    const matchJenjang = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
    const matchSearch =
      !searchQuery ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenjang && matchSearch;
  });

  // Aggregated Calculations for Summary
  const totalSummaryHours = filteredSummary.reduce((acc, curr) => acc + curr.totalScheduleHours, 0);
  const totalPresentHours = filteredSummary.reduce((acc, curr) => acc + curr.presentHours, 0);
  const totalAbsentHours = filteredSummary.reduce(
    (acc, curr) => acc + (curr.permissionHours + curr.dutyHours + curr.sickHours + curr.absentHours),
    0
  );
  const avgAttendanceRate = totalSummaryHours > 0 ? Number(((totalPresentHours / totalSummaryHours) * 100).toFixed(1)) : 0;
  const avgAbsenceRate = totalSummaryHours > 0 ? Number(((totalAbsentHours / totalSummaryHours) * 100).toFixed(1)) : 0;

  // Aggregated Calculations for Daily
  const dailyTotal = filteredDaily.length;
  const dailyPresent = filteredDaily.filter((d) => d.status === 'PRESENT').length;
  const dailyPermission = filteredDaily.filter((d) => d.status === 'PERMISSION').length;
  const dailyDuty = filteredDaily.filter((d) => d.status === 'DUTY').length;
  const dailySick = filteredDaily.filter((d) => d.status === 'SICK').length;
  const dailyAbsent = filteredDaily.filter((d) => d.status === 'ABSENT').length;
  const dailyNotPresent = dailyTotal - dailyPresent;
  const dailyPresentPct = dailyTotal > 0 ? Number(((dailyPresent / dailyTotal) * 100).toFixed(1)) : 0;
  const dailyAbsentPct = dailyTotal > 0 ? Number(((dailyNotPresent / dailyTotal) * 100).toFixed(1)) : 0;

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  // 1. Ekspor Excel Berwarna (Full Color, Rapi & Dipersimpel)
  const handleExportColoredExcel = () => {
    const periodLabel = period === 'DAILY' ? 'Harian' : period === 'WEEKLY' ? 'Mingguan' : 'Bulanan';
    const filename = `SIMOGU_Rekap_${periodLabel}_${selectedJenjang}_${Date.now()}.xls`;

    const now = new Date();
    const printDateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const periodDescription =
      period === 'DAILY'
        ? `Tanggal: ${selectedDate}`
        : period === 'WEEKLY'
        ? `Pekan: ${selectedWeek}`
        : `Bulan: ${selectedMonth}`;

    const totalHours = period === 'DAILY' ? dailyTotal : totalSummaryHours;
    const pctHadir = period === 'DAILY' ? dailyPresentPct : avgAttendanceRate;
    const pctTidakHadir = period === 'DAILY' ? dailyAbsentPct : avgAbsenceRate;

    let tableHtml = '';

    if (period === 'DAILY') {
      tableHtml = `
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; width: 100%;">
          <thead>
            <tr style="background-color: #3730A3; color: #FFFFFF; font-weight: bold; text-align: center;">
              <th style="padding: 8px; width: 40px;">No</th>
              <th style="padding: 8px; width: 90px;">Jam Ke</th>
              <th style="padding: 8px; width: 80px;">Kode</th>
              <th style="padding: 8px; width: 220px; text-align: left;">Nama Guru Pengajar</th>
              <th style="padding: 8px; width: 70px;">Jenjang</th>
              <th style="padding: 8px; width: 180px; text-align: left;">Mata Pelajaran</th>
              <th style="padding: 8px; width: 90px;">Kelas</th>
              <th style="padding: 8px; width: 110px;">Status</th>
              <th style="padding: 8px; width: 90px; background-color: #065F46; color: #FFFFFF;">% Hadir</th>
              <th style="padding: 8px; width: 110px; background-color: #991B1B; color: #FFFFFF;">% Tidak Hadir</th>
              <th style="padding: 8px; width: 220px; text-align: left;">Keterangan Piket</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDaily
              .map((row, idx) => {
                const isEven = idx % 2 === 0;
                const isPresent = row.status === 'PRESENT';
                const statusBg = isPresent
                  ? '#DCFCE7; color: #166534;'
                  : row.status === 'PERMISSION'
                  ? '#FEF9C3; color: #854D0E;'
                  : row.status === 'DUTY'
                  ? '#DBEAFE; color: #1E40AF;'
                  : row.status === 'SICK'
                  ? '#F3E8FF; color: #6B21A8;'
                  : '#FEE2E2; color: #991B1B;';

                return `
                  <tr style="background-color: ${isEven ? '#FFFFFF' : '#F8FAFC'};">
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${idx + 1}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold;">Jam ${row.periodNumber}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${row.teacherCode}</td>
                    <td style="text-align: left; border: 1px solid #CBD5E1; font-weight: bold;">${row.teacherName}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${row.jenjang}</td>
                    <td style="text-align: left; border: 1px solid #CBD5E1;">${row.subject}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${row.className}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; background-color: ${statusBg}">${row.statusLabel}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; background-color: ${isPresent ? '#DCFCE7; color: #166534;' : '#F1F5F9; color: #64748B;'}">${isPresent ? '100%' : '0%'}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; background-color: ${!isPresent ? '#FEE2E2; color: #991B1B;' : '#F1F5F9; color: #64748B;'}">${!isPresent ? '100%' : '0%'}</td>
                    <td style="text-align: left; border: 1px solid #CBD5E1; font-style: italic; color: #475569;">${row.notes}</td>
                  </tr>
                `;
              })
              .join('')}
            <tr style="background-color: #EEF2FF; font-weight: bold; color: #1E1B4B; border-top: 2px solid #4338CA;">
              <td colspan="7" style="text-align: center; padding: 8px; border: 1px solid #C7D2FE;">TOTAL: ${filteredDaily.length} JAM MENGAJAR</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${dailyPresent} Hadir / ${dailyNotPresent} Absen</td>
              <td style="text-align: center; border: 1px solid #C7D2FE; background-color: #DCFCE7; color: #166534;">${dailyPresentPct}%</td>
              <td style="text-align: center; border: 1px solid #C7D2FE; background-color: #FEE2E2; color: #991B1B;">${dailyAbsentPct}%</td>
              <td style="text-align: left; border: 1px solid #C7D2FE; font-size: 9pt;">${dailyPermission} Izin, ${dailyDuty} Dinas, ${dailySick} Sakit, ${dailyAbsent} Alpa</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      let sumTotal = 0;
      let sumHadir = 0;
      let sumIzin = 0;
      let sumDuty = 0;
      let sumSakit = 0;
      let sumAlpa = 0;

      tableHtml = `
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; width: 100%;">
          <thead>
            <tr style="background-color: #3730A3; color: #FFFFFF; font-weight: bold; text-align: center;">
              <th style="padding: 8px; width: 40px;">No</th>
              <th style="padding: 8px; width: 80px;">Kode</th>
              <th style="padding: 8px; width: 220px; text-align: left;">Nama Guru Pengajar</th>
              <th style="padding: 8px; width: 70px;">Jenjang</th>
              <th style="padding: 8px; width: 180px; text-align: left;">Mata Pelajaran</th>
              <th style="padding: 8px; width: 80px;">Total Jam</th>
              <th style="padding: 8px; width: 70px; background-color: #059669; color: #FFFFFF;">Hadir</th>
              <th style="padding: 8px; width: 70px;">Izin</th>
              <th style="padding: 8px; width: 70px;">Dinas</th>
              <th style="padding: 8px; width: 70px;">Sakit</th>
              <th style="padding: 8px; width: 70px;">Alpa</th>
              <th style="padding: 8px; width: 90px; background-color: #065F46; color: #FFFFFF;">% Hadir</th>
              <th style="padding: 8px; width: 110px; background-color: #991B1B; color: #FFFFFF;">% Tidak Hadir</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSummary
              .map((item, idx) => {
                sumTotal += item.totalScheduleHours;
                sumHadir += item.presentHours;
                sumIzin += item.permissionHours;
                sumDuty += item.dutyHours;
                sumSakit += item.sickHours;
                sumAlpa += item.absentHours;

                const isEven = idx % 2 === 0;
                return `
                  <tr style="background-color: ${isEven ? '#FFFFFF' : '#F8FAFC'};">
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${idx + 1}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${item.teacherCode}</td>
                    <td style="text-align: left; border: 1px solid #CBD5E1; font-weight: bold;">${item.teacherName}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1;">${item.jenjang}</td>
                    <td style="text-align: left; border: 1px solid #CBD5E1;">${item.subject}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold;">${item.totalScheduleHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; color: #166534; background-color: #F0FDF4;">${item.presentHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; color: #854D0E;">${item.permissionHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; color: #1E40AF;">${item.dutyHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; color: #6B21A8;">${item.sickHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; color: #991B1B;">${item.absentHours}</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; background-color: #DCFCE7; color: #166534;">${item.attendanceRate}%</td>
                    <td style="text-align: center; border: 1px solid #CBD5E1; font-weight: bold; background-color: ${item.absenceRate > 0 ? '#FEE2E2; color: #991B1B;' : '#F1F5F9; color: #64748B;'}">${item.absenceRate}%</td>
                  </tr>
                `;
              })
              .join('')}
            <tr style="background-color: #EEF2FF; font-weight: bold; color: #1E1B4B; border-top: 2px solid #4338CA;">
              <td colspan="5" style="text-align: center; padding: 8px; border: 1px solid #C7D2FE;">TOTAL KESELURUHAN (${filteredSummary.length} GURU)</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${sumTotal}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE; background-color: #DCFCE7; color: #166534;">${sumHadir}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${sumIzin}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${sumDuty}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${sumSakit}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE;">${sumAlpa}</td>
              <td style="text-align: center; border: 1px solid #C7D2FE; background-color: #DCFCE7; color: #166534;">${avgAttendanceRate}%</td>
              <td style="text-align: center; border: 1px solid #C7D2FE; background-color: #FEE2E2; color: #991B1B;">${avgAbsenceRate}%</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Rekap Presensi</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="font-family: Arial, sans-serif; padding: 15px;">
        <!-- Header Ringkas & Rapi -->
        <table style="width: 100%; margin-bottom: 12px; font-family: Arial, sans-serif;">
          <tr>
            <td colspan="12" style="font-size: 14pt; font-weight: bold; color: #3730A3;">
              SIMOGU - LAPORAN REKAPITULASI PRESENSI & KETIDAKHADIRAN GURU
            </td>
          </tr>
          <tr>
            <td colspan="12" style="font-size: 10pt; color: #475569; padding-bottom: 6px;">
              Format: <strong>Rekap ${periodLabel}</strong> | Jenjang: <strong>${selectedJenjang}</strong> | ${periodDescription} | Dicetak: <strong>${printDateStr}</strong>
            </td>
          </tr>
          <tr>
            <td colspan="12" style="background-color: #F1F5F9; border-left: 4px solid #4338CA; padding: 6px 10px; font-size: 10pt; font-weight: bold; color: #1E293B;">
              📊 Ringkasan: Total ${totalHours} Jam Jadwal | Kehadiran: <span style="color: #166534;">${pctHadir}%</span> | Ketidakhadiran: <span style="color: #991B1B;">${pctTidakHadir}%</span>
            </td>
          </tr>
        </table>

        <!-- Tabel Data Utama -->
        ${tableHtml}

        <!-- Tanda Tangan Simpel -->
        <table style="width: 100%; margin-top: 25px; font-family: Arial, sans-serif; font-size: 10pt;">
          <tr>
            <td colspan="3" style="text-align: center; width: 40%;">
              Mengetahui,<br><strong>Kepala Sekolah / Madrasah</strong>
              <br><br><br><br>
              <strong><u>H. Muhammad Irfan, M.Ag.</u></strong><br>
              <span style="font-size: 9pt; color: #64748B;">NIP. 197805122005011003</span>
            </td>
            <td colspan="4" style="width: 20%;"></td>
            <td colspan="5" style="text-align: center; width: 40%;">
              Cianjur, ${printDateStr}<br><strong>Ketua Petugas Piket</strong>
              <br><br><br><br>
              <strong><u>Drs. H. Ahmad Dahlan, M.Pd.</u></strong><br>
              <span style="font-size: 9pt; color: #64748B;">NIP. 198203142008011005</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Ekspor Format .XLSX Standar (Bersih, Rapi & Dipersimpel)
  const handleExportCleanXlsx = async () => {
    const periodLabel = period === 'DAILY' ? 'Harian' : period === 'WEEKLY' ? 'Mingguan' : 'Bulanan';
    const filename = `SIMOGU_Rekap_${periodLabel}_${selectedJenjang}_${Date.now()}.xlsx`;

    const now = new Date();
    const printDateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const periodDescription =
      period === 'DAILY'
        ? `Tanggal: ${selectedDate}`
        : period === 'WEEKLY'
        ? `Pekan: ${selectedWeek}`
        : `Bulan: ${selectedMonth}`;

    const totalHours = period === 'DAILY' ? dailyTotal : totalSummaryHours;
    const pctHadir = period === 'DAILY' ? dailyPresentPct : avgAttendanceRate;
    const pctTidakHadir = period === 'DAILY' ? dailyAbsentPct : avgAbsenceRate;

    const rows: any[][] = [
      [`SIMOGU - LAPORAN REKAPITULASI PRESENSI & KETIDAKHADIRAN GURU (${periodLabel.toUpperCase()})`],
      [`Jenjang: ${selectedJenjang} | ${periodDescription} | Dicetak: ${printDateStr}`],
      [`Ringkasan: Total ${totalHours} Jam | Kehadiran: ${pctHadir}% | Ketidakhadiran: ${pctTidakHadir}%`],
      [],
    ];

    let cols: { wch: number }[] = [];

    if (period === 'DAILY') {
      cols = [
        { wch: 6 },  // No
        { wch: 10 }, // Jam
        { wch: 12 }, // Kode
        { wch: 30 }, // Nama
        { wch: 10 }, // Jenjang
        { wch: 26 }, // Mapel
        { wch: 12 }, // Kelas
        { wch: 16 }, // Status
        { wch: 14 }, // % Hadir
        { wch: 16 }, // % Tidak Hadir
        { wch: 32 }, // Catatan
      ];

      rows.push([
        'NO',
        'JAM KE',
        'KODE',
        'NAMA GURU PENGAJAR',
        'JENJANG',
        'MATA PELAJARAN',
        'KELAS',
        'STATUS',
        '% HADIR',
        '% TIDAK HADIR',
        'CATATAN PIKET',
      ]);

      filteredDaily.forEach((r, idx) => {
        const isPresent = r.status === 'PRESENT';
        rows.push([
          idx + 1,
          `Jam ${r.periodNumber}`,
          r.teacherCode,
          r.teacherName,
          r.jenjang,
          r.subject,
          r.className,
          r.statusLabel,
          isPresent ? '100%' : '0%',
          !isPresent ? '100%' : '0%',
          r.notes,
        ]);
      });

      rows.push([
        'TOTAL',
        `${filteredDaily.length} Jam`,
        '',
        '',
        '',
        '',
        '',
        `${dailyPresent} Hadir / ${dailyNotPresent} Absen`,
        `${dailyPresentPct}%`,
        `${dailyAbsentPct}%`,
        '',
      ]);
    } else {
      cols = [
        { wch: 6 },  // No
        { wch: 12 }, // Kode
        { wch: 30 }, // Nama
        { wch: 10 }, // Jenjang
        { wch: 26 }, // Mapel
        { wch: 12 }, // Total Jam
        { wch: 10 }, // Hadir
        { wch: 10 }, // Izin
        { wch: 10 }, // Dinas
        { wch: 10 }, // Sakit
        { wch: 10 }, // Alpa
        { wch: 14 }, // % Hadir
        { wch: 16 }, // % Tidak Hadir
      ];

      rows.push([
        'NO',
        'KODE',
        'NAMA GURU PENGAJAR',
        'JENJANG',
        'MATA PELAJARAN',
        'TOTAL JAM',
        'HADIR',
        'IZIN',
        'DINAS',
        'SAKIT',
        'ALPA',
        '% HADIR',
        '% TIDAK HADIR',
      ]);

      let sumTotal = 0;
      let sumHadir = 0;
      let sumIzin = 0;
      let sumDuty = 0;
      let sumSakit = 0;
      let sumAlpa = 0;

      filteredSummary.forEach((r, idx) => {
        sumTotal += r.totalScheduleHours;
        sumHadir += r.presentHours;
        sumIzin += r.permissionHours;
        sumDuty += r.dutyHours;
        sumSakit += r.sickHours;
        sumAlpa += r.absentHours;

        rows.push([
          idx + 1,
          r.teacherCode,
          r.teacherName,
          r.jenjang,
          r.subject,
          r.totalScheduleHours,
          r.presentHours,
          r.permissionHours,
          r.dutyHours,
          r.sickHours,
          r.absentHours,
          `${r.attendanceRate}%`,
          `${r.absenceRate}%`,
        ]);
      });

      rows.push([
        'TOTAL',
        '',
        `${filteredSummary.length} Guru`,
        '',
        '',
        sumTotal,
        sumHadir,
        sumIzin,
        sumDuty,
        sumSakit,
        sumAlpa,
        `${avgAttendanceRate}%`,
        `${avgAbsenceRate}%`,
      ]);
    }

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = cols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap ${periodLabel}`);
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/ketua-piket/dashboard"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight truncate">
                Rekap & Cetak Laporan Guru
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Laporan Kehadiran & Ketidakhadiran Guru Harian, Mingguan, dan Bulanan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings/profile"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Print Header (Only visible when printing / PDF) */}
        <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6 space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-wide">YAYASAN PONDOK PESANTREN AL-ITTIHAD</h2>
          <h3 className="text-base font-bold uppercase">SISTEM MONITORING KEHADIRAN GURU (SIMOGU)</h3>
          <p className="text-xs text-gray-600">Jl. Raya Bandung - Cianjur KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat</p>
          <div className="pt-2 text-sm font-bold uppercase">
            LAPORAN REKAPITULASI PRESENSI & KETIDAKHADIRAN GURU ({period === 'DAILY' ? 'HARIAN' : period === 'WEEKLY' ? 'MINGGUAN' : 'BULANAN'})
          </div>
          <div className="text-xs text-gray-700">
            Periode:{' '}
            {period === 'DAILY'
              ? selectedDate
              : period === 'WEEKLY'
              ? `Minggu ke-36 (September 2026)`
              : `Bulan September 2026`}{' '}
            | Jenjang: {selectedJenjang.toUpperCase()} | Rata-rata Kehadiran: {period === 'DAILY' ? dailyPresentPct : avgAttendanceRate}% | Rata-rata Ketidakhadiran: {period === 'DAILY' ? dailyAbsentPct : avgAbsenceRate}%
          </div>
        </div>

        {/* Filter Controls Card (Hidden during print) */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-4 print:hidden">
          
          {/* Period Selector Tabs (Harian, Mingguan, Bulanan) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pilih Format Rekapitulasi:
              </span>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  onClick={() => setPeriod('DAILY')}
                  className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === 'DAILY'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📅 Rekap Harian
                </button>
                <button
                  onClick={() => setPeriod('WEEKLY')}
                  className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === 'WEEKLY'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📊 Rekap Mingguan
                </button>
                <button
                  onClick={() => setPeriod('MONTHLY')}
                  className={`px-3.5 sm:px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === 'MONTHLY'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📈 Rekap Bulanan
                </button>
              </div>
            </div>

            {/* Action Buttons: Cetak & Ekspor Excel */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak (Print/PDF)</span>
              </button>

              <button
                onClick={handleExportColoredExcel}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                title="Unduh Excel dengan tampilan warna, badge rapi & simpel"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Excel Berwarna</span>
              </button>

              <button
                onClick={handleExportCleanXlsx}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                title="Unduh format .xlsx standar"
              >
                <span>.XLSX</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters: Jenjang, Date/Week/Month, Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Filter Jenjang Chips */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Jenjang Pendidikan:</label>
              <div className="flex gap-1.5 flex-wrap">
                {(['Semua', 'SMP', 'SMA', 'SMK'] as EducationLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedJenjang(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedJenjang === lvl
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Date / Month Picker based on Active Tab */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">
                {period === 'DAILY' ? 'Pilih Tanggal:' : period === 'WEEKLY' ? 'Pilih Pekan / Minggu:' : 'Pilih Bulan:'}
              </label>
              {period === 'DAILY' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              )}
              {period === 'WEEKLY' && (
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              )}
              {period === 'MONTHLY' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Cari Guru / Mapel:</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama pengajar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Metric Cards: Persentase Kehadiran & Ketidakhadiran */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 print:hidden">
          {/* Card 1: % Kehadiran */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">% Kehadiran</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {period === 'DAILY' ? dailyPresentPct : avgAttendanceRate}%
              </span>
              <span className="text-[10px] text-emerald-600/80 font-bold">Hadir</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {period === 'DAILY' ? `${dailyPresent} dari ${dailyTotal} Jam` : `${totalPresentHours} dari ${totalSummaryHours} Jam`}
            </p>
          </div>

          {/* Card 2: % Ketidakhadiran */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">% Ketidakhadiran</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {period === 'DAILY' ? dailyAbsentPct : avgAbsenceRate}%
              </span>
              <span className="text-[10px] text-rose-600/80 font-bold">Tidak Hadir</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {period === 'DAILY' ? `${dailyNotPresent} Jam Izin/Sakit/Dinas` : `${totalAbsentHours} Jam Total Ketidakhadiran`}
            </p>
          </div>

          {/* Card 3: Total Jam Jadwal */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Jam Jadwal</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {period === 'DAILY' ? dailyTotal : totalSummaryHours}
              </span>
              <span className="text-[10px] text-slate-400">jam mengajar</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Jenjang: {selectedJenjang}
            </p>
          </div>

          {/* Card 4: Jam Ketidakhadiran */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Rincian Tidak Hadir</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {period === 'DAILY' ? dailyNotPresent : totalAbsentHours}
              </span>
              <span className="text-[10px] text-slate-400">jam non-hadir</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {period === 'DAILY'
                ? `${dailyPermission} Izin • ${dailyDuty} Tugas • ${dailySick} Sakit`
                : 'Izin, Sakit, Tugas Dinas & Alpa'}
            </p>
          </div>
        </div>

        {/* 1. VIEW: REKAP HARIAN */}
        {period === 'DAILY' && (
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Rekap Kehadiran Harian: {selectedDate}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Detail presensi per jam pelajaran (Jam ke-1 s/d 8)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {filteredDaily.length} Jam Mengajar
              </span>
            </div>

            {/* Daily KPI Summary Ribbon */}
            <div className="p-3 sm:p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Rangkuman Harian:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kehadiran: {dailyPresentPct}% ({dailyPresent} Jam)</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Ketidakhadiran: {dailyAbsentPct}% ({dailyNotPresent} Jam)</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {dailyPermission} Izin • {dailyDuty} Tugas Dinas • {dailySick} Sakit • {dailyAbsent} Alpa
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3.5 py-3">No</th>
                    <th className="px-3.5 py-3">Nama Guru Pengajar</th>
                    <th className="px-3.5 py-3">Jenjang</th>
                    <th className="px-3.5 py-3">Kelas / Mapel</th>
                    <th className="px-3.5 py-3">Jam Ke</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3">Keterangan Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredDaily.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-3.5 py-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {row.teacherName}
                        <div className="text-[10px] font-mono text-slate-400">{row.teacherCode}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {row.jenjang}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{row.className}</div>
                        <div className="text-[11px] text-slate-500">{row.subject}</div>
                      </td>
                      <td className="px-3.5 py-3 font-mono">
                        Jam {row.periodNumber} ({row.periodTime})
                      </td>
                      <td className="px-3.5 py-3">
                        {row.status === 'PRESENT' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            ✓ Hadir
                          </span>
                        )}
                        {row.status === 'PERMISSION' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            📋 Izin Resmi
                          </span>
                        )}
                        {row.status === 'DUTY' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            🏛️ Tugas Luar
                          </span>
                        )}
                        {row.status === 'SICK' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            🏥 Sakit
                          </span>
                        )}
                        {row.status === 'ABSENT' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            ✕ Alpa
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-slate-500 italic text-[11px]">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. & 3. VIEW: REKAP MINGGUAN / BULANAN (Matriks Akumulasi) */}
        {(period === 'WEEKLY' || period === 'MONTHLY') && (
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Rekapitulasi Akumulasi {period === 'WEEKLY' ? 'Mingguan' : 'Bulanan'}: {period === 'WEEKLY' ? selectedWeek : selectedMonth}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total jam mengajar terjadwal vs persentase kehadiran & ketidakhadiran riil
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {filteredSummary.length} Guru
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-3">No</th>
                    <th className="px-3 py-3">Nama Guru Pengajar</th>
                    <th className="px-3 py-3">Jenjang</th>
                    <th className="px-3 py-3">Mata Pelajaran</th>
                    <th className="px-3 py-3 text-center">Total Jam</th>
                    <th className="px-3 py-3 text-center text-emerald-600 dark:text-emerald-400">Hadir</th>
                    <th className="px-3 py-3 text-center text-amber-600 dark:text-amber-400">Izin</th>
                    <th className="px-3 py-3 text-center text-blue-600 dark:text-blue-400">Tugas</th>
                    <th className="px-3 py-3 text-center text-purple-600 dark:text-purple-400">Sakit</th>
                    <th className="px-3 py-3 text-center text-rose-600 dark:text-rose-400">Alpa</th>
                    <th className="px-3.5 py-3 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 font-extrabold">
                      % Kehadiran
                    </th>
                    <th className="px-3.5 py-3 text-center text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 font-extrabold">
                      % Ketidakhadiran
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSummary.map((item, idx) => (
                    <tr key={item.teacherCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {item.teacherName}
                        <div className="text-[10px] font-mono text-slate-400">{item.teacherCode}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.jenjang}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {item.subject}
                      </td>
                      <td className="px-3 py-3 text-center font-bold font-mono">
                        {item.totalScheduleHours} Jam
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.presentHours}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.permissionHours}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.dutyHours}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                        {item.sickHours}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                        {item.absentHours}
                      </td>
                      <td className="px-3.5 py-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center bg-rose-50/30 dark:bg-rose-950/10">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                          item.absenceRate > 0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {item.absenceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Print Signature Footer (Only visible when printing) */}
        <div className="hidden print:block pt-10 text-xs">
          <div className="grid grid-cols-2 gap-10 text-center">
            <div className="space-y-16">
              <p>Mengetahui,<br /><strong>Kepala Madrasah / Sekolah</strong></p>
              <p className="font-bold underline">H. Muhammad Irfan, M.Ag.<br /><span className="font-normal no-underline text-[10px]">NIP. 197805122005011003</span></p>
            </div>
            <div className="space-y-16">
              <p>Cianjur, {selectedDate}<br /><strong>Ketua Petugas Piket</strong></p>
              <p className="font-bold underline">Drs. H. Ahmad Dahlan, M.Pd.<br /><span className="font-normal no-underline text-[10px]">NIP. 198203142008011005</span></p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 print:hidden">
        <Footer />
      </div>
    </div>
  );
}
