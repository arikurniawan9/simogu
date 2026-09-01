import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { LessonPeriodsModule } from './lesson-periods/lesson-periods.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ChangeRequestsModule } from './change-requests/change-requests.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PengajianModule } from './pengajian/pengajian.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TeachersModule,
    ClassesModule,
    LessonPeriodsModule,
    AcademicYearsModule,
    SchedulesModule,
    AttendanceModule,
    ChangeRequestsModule,
    WhatsAppModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    PengajianModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

