-- AlterTable AttendanceRecord
ALTER TABLE "AttendanceRecord" 
ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "attachmentType" TEXT,
ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;

-- AlterTable PengajianAttendance
ALTER TABLE "PengajianAttendance" 
ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "attachmentType" TEXT,
ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;
