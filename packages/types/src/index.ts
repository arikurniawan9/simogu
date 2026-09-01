export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  KETUA_PIKET = 'KETUA_PIKET',
  PIKET = 'PIKET',
  GURU = 'GURU',
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
