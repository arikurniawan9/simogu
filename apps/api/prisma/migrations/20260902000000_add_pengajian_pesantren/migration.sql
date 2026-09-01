-- AlterEnum: Add new roles if they do not exist
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'KETUA_PIKET';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PIKET_PENGAJIAN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'KETUA_PIKET_PENGAJIAN';

-- CreateEnum: PengajianSession
DO $$ BEGIN
  CREATE TYPE "PengajianSession" AS ENUM ('PAGI', 'ASHAR', 'MAGHRIB');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable: PengajianClass
CREATE TABLE IF NOT EXISTS "PengajianClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengajianClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PengajianSchedule
CREATE TABLE IF NOT EXISTS "PengajianSchedule" (
    "id" TEXT NOT NULL,
    "pengajianClassId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "session" "PengajianSession" NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "kitab" TEXT NOT NULL,
    "timeSlot" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengajianSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PengajianAttendance
CREATE TABLE IF NOT EXISTS "PengajianAttendance" (
    "id" TEXT NOT NULL,
    "pengajianScheduleId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "session" "PengajianSession" NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "badalTeacherId" TEXT,
    "badalTeacherName" TEXT,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengajianAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "PengajianClass_name_idx" ON "PengajianClass"("name");
CREATE INDEX IF NOT EXISTS "PengajianClass_category_idx" ON "PengajianClass"("category");

CREATE INDEX IF NOT EXISTS "PengajianSchedule_pengajianClassId_idx" ON "PengajianSchedule"("pengajianClassId");
CREATE INDEX IF NOT EXISTS "PengajianSchedule_teacherId_idx" ON "PengajianSchedule"("teacherId");
CREATE INDEX IF NOT EXISTS "PengajianSchedule_session_idx" ON "PengajianSchedule"("session");
CREATE INDEX IF NOT EXISTS "PengajianSchedule_dayOfWeek_idx" ON "PengajianSchedule"("dayOfWeek");

CREATE UNIQUE INDEX IF NOT EXISTS "PengajianAttendance_pengajianScheduleId_attendanceDate_key" ON "PengajianAttendance"("pengajianScheduleId", "attendanceDate");
CREATE INDEX IF NOT EXISTS "PengajianAttendance_attendanceDate_idx" ON "PengajianAttendance"("attendanceDate");
CREATE INDEX IF NOT EXISTS "PengajianAttendance_session_idx" ON "PengajianAttendance"("session");
CREATE INDEX IF NOT EXISTS "PengajianAttendance_status_idx" ON "PengajianAttendance"("status");

-- AddForeignKeys
ALTER TABLE "PengajianSchedule" DROP CONSTRAINT IF EXISTS "PengajianSchedule_pengajianClassId_fkey";
ALTER TABLE "PengajianSchedule" ADD CONSTRAINT "PengajianSchedule_pengajianClassId_fkey" FOREIGN KEY ("pengajianClassId") REFERENCES "PengajianClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PengajianSchedule" DROP CONSTRAINT IF EXISTS "PengajianSchedule_teacherId_fkey";
ALTER TABLE "PengajianSchedule" ADD CONSTRAINT "PengajianSchedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PengajianAttendance" DROP CONSTRAINT IF EXISTS "PengajianAttendance_pengajianScheduleId_fkey";
ALTER TABLE "PengajianAttendance" ADD CONSTRAINT "PengajianAttendance_pengajianScheduleId_fkey" FOREIGN KEY ("pengajianScheduleId") REFERENCES "PengajianSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PengajianAttendance" DROP CONSTRAINT IF EXISTS "PengajianAttendance_recordedById_fkey";
ALTER TABLE "PengajianAttendance" ADD CONSTRAINT "PengajianAttendance_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
