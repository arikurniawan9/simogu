export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  KETUA_PIKET = 'KETUA_PIKET',
  PIKET = 'PIKET',
  GURU = 'GURU',
  PIKET_PENGAJIAN = 'PIKET_PENGAJIAN',
  KETUA_PIKET_PENGAJIAN = 'KETUA_PIKET_PENGAJIAN',
}

export enum PengajianSession {
  PAGI = 'PAGI',
  ASHAR = 'ASHAR',
  MAGHRIB = 'MAGHRIB',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT_PENDING_CONFIRMATION = 'ABSENT_PENDING_CONFIRMATION',
  PERMISSION = 'PERMISSION',
  SICK = 'SICK',
  OFFICIAL_DUTY = 'OFFICIAL_DUTY',
  LATE = 'LATE',
  WITHOUT_EXPLANATION = 'WITHOUT_EXPLANATION',
  CANCELLED = 'CANCELLED',
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export interface TeacherSummary {
  id: string;
  teacherCode: string;
  nip?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  whatsappNumber: string;
  subject: string;
  isActive: boolean;
}

export interface SystemHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export interface PengajianClassItem {
  id: string;
  name: string;
  category: string;
  location?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface PengajianScheduleItem {
  id: string;
  pengajianClassId: string;
  teacherId: string;
  session: PengajianSession;
  dayOfWeek: string;
  kitab: string;
  timeSlot?: string | null;
  isActive: boolean;
  pengajianClass?: PengajianClassItem;
  teacher?: TeacherSummary;
}

export interface PengajianAttendanceItem {
  id: string;
  pengajianScheduleId: string;
  attendanceDate: string;
  session: PengajianSession;
  status: AttendanceStatus;
  badalTeacherId?: string | null;
  badalTeacherName?: string | null;
  notes?: string | null;

  recordedById: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  schedule?: PengajianScheduleItem;
}

export interface AttendanceAttachment {
  url: string;
  name: string;
  type: 'IMAGE' | 'PDF';
  size?: number;
}


