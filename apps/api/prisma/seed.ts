import { PrismaClient, Role, Gender, SemesterType, DayOfWeek, PengajianSession } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SIMOGU Database Seeding...');

  // 1. Hash default password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Seed Users
  console.log('👤 Seeding Users...');

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@simogu.sch.id',
      passwordHash,
      fullName: 'Super Administrator',
      role: Role.SUPER_ADMIN,
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@simogu.sch.id',
      passwordHash,
      fullName: 'Administrator Sekolah',
      role: Role.ADMIN,
    },
  });

  const piket1 = await prisma.user.upsert({
    where: { username: 'piket1' },
    update: {},
    create: {
      username: 'piket1',
      email: 'piket1@simogu.sch.id',
      passwordHash,
      fullName: 'Petugas Piket A',
      role: Role.PIKET,
    },
  });

  const piket2 = await prisma.user.upsert({
    where: { username: 'piket2' },
    update: {},
    create: {
      username: 'piket2',
      email: 'piket2@simogu.sch.id',
      passwordHash,
      fullName: 'Petugas Piket B',
      role: Role.PIKET,
    },
  });

  const ketuaPiket = await prisma.user.upsert({
    where: { username: 'ketuapiket' },
    update: {},
    create: {
      username: 'ketuapiket',
      email: 'ketuapiket@simogu.sch.id',
      passwordHash,
      fullName: 'Drs. H. Ahmad Dahlan, M.Pd. (Ketua Piket)',
      role: Role.KETUA_PIKET,
    },
  });

  const piketPengajian = await prisma.user.upsert({
    where: { username: 'piket_pengajian' },
    update: {},
    create: {
      username: 'piket_pengajian',
      email: 'piket.pengajian@simogu.sch.id',
      passwordHash,
      fullName: 'Ust. Ridwan Kamil, S.Pd.I (Piket Pengajian)',
      role: Role.PIKET_PENGAJIAN,
    },
  });

  const ketuaPengajian = await prisma.user.upsert({
    where: { username: 'ketua_pengajian' },
    update: {},
    create: {
      username: 'ketua_pengajian',
      email: 'ketua.pengajian@simogu.sch.id',
      passwordHash,
      fullName: 'K.H. Syamsul Arifin, Lc. (Ketua Piket Pengajian)',
      role: Role.KETUA_PIKET_PENGAJIAN,
    },
  });


  // 3. Seed Teachers (10 Teachers)
  console.log('👨‍🏫 Seeding 10 Teachers...');

  const teacherData = [
    { code: 'GRU-001', name: 'Drs. Ari Kurniawan, M.Pd.', subject: 'Matematika', gender: Gender.MALE, phone: '6281234567801' },
    { code: 'GRU-002', name: 'Siti Rahma, S.Pd.', subject: 'Bahasa Indonesia', gender: Gender.FEMALE, phone: '6281234567802' },
    { code: 'GRU-003', name: 'Budi Santoso, S.T.', subject: 'Fisika', gender: Gender.MALE, phone: '6281234567803' },
    { code: 'GRU-004', name: 'Dewi Lestari, M.Sc.', subject: 'Biologi', gender: Gender.FEMALE, phone: '6281234567804' },
    { code: 'GRU-005', name: 'Ahmad Fauzi, S.Ag.', subject: 'Pendidikan Agama', gender: Gender.MALE, phone: '6281234567805' },
    { code: 'GRU-006', name: 'Rina Wijaya, S.Kom.', subject: 'Informatika', gender: Gender.FEMALE, phone: '6281234567806' },
    { code: 'GRU-007', name: 'Hendra Saputra, S.Pd.', subject: 'Penjaskes', gender: Gender.MALE, phone: '6281234567807' },
    { code: 'GRU-008', name: 'Maya Indah, M.Hum.', subject: 'Bahasa Inggris', gender: Gender.FEMALE, phone: '6281234567808' },
    { code: 'GRU-009', name: 'Bambang Utomo, S.E.', subject: 'Ekonomi', gender: Gender.MALE, phone: '6281234567809' },
    { code: 'GRU-010', name: 'Novi Fitriani, S.Pd.', subject: 'Kimia', gender: Gender.FEMALE, phone: '6281234567810' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const teacher = await prisma.teacher.upsert({
      where: { teacherCode: t.code },
      update: {},
      create: {
        teacherCode: t.code,
        fullName: t.name,
        subject: t.subject,
        gender: t.gender,
        whatsappNumber: t.phone,
        isActive: true,
      },
    });
    teachers.push(teacher);
  }

  // 4. Seed Classes (6 Classes)
  console.log('🏫 Seeding 6 Classes...');

  const classData = [
    { name: 'X IPA 1', grade: '10', major: 'IPA', homeroomIdx: 0 },
    { name: 'X IPA 2', grade: '10', major: 'IPA', homeroomIdx: 1 },
    { name: 'XI IPA 1', grade: '11', major: 'IPA', homeroomIdx: 2 },
    { name: 'XI IPA 2', grade: '11', major: 'IPA', homeroomIdx: 3 },
    { name: 'XII IPA 1', grade: '12', major: 'IPA', homeroomIdx: 4 },
    { name: 'XII IPA 2', grade: '12', major: 'IPA', homeroomIdx: 5 },
  ];

  const classes = [];
  for (const c of classData) {
    const cls = await prisma.class.create({
      data: {
        name: c.name,
        grade: c.grade,
        major: c.major,
        homeroomTeacherId: teachers[c.homeroomIdx]?.id,
        isActive: true,
      },
    });
    classes.push(cls);
  }

  // 5. Seed Lesson Periods (10 Periods)
  console.log('⏰ Seeding 10 Lesson Periods...');

  const periodsData = [
    { num: 1, start: '07:00', end: '07:45' },
    { num: 2, start: '07:45', end: '08:30' },
    { num: 3, start: '08:30', end: '09:15' },
    { num: 4, start: '09:30', end: '10:15' },
    { num: 5, start: '10:15', end: '11:00' },
    { num: 6, start: '11:00', end: '11:45' },
    { num: 7, start: '12:30', end: '13:15' },
    { num: 8, start: '13:15', end: '14:00' },
    { num: 9, start: '14:00', end: '14:45' },
    { num: 10, start: '14:45', end: '15:30' },
  ];

  const periods = [];
  for (const p of periodsData) {
    const period = await prisma.lessonPeriod.create({
      data: {
        periodNumber: p.num,
        startTime: p.start,
        endTime: p.end,
        isActive: true,
      },
    });
    periods.push(period);
  }

  // 6. Seed Academic Year & Semesters
  console.log('📅 Seeding Academic Year & Semesters...');

  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025/2026',
      startDate: new Date('2025-07-14'),
      endDate: new Date('2026-06-20'),
      isActive: true,
    },
  });

  const semesterGanjil = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      name: 'Semester Ganjil 2025/2026',
      type: SemesterType.ODD,
      startDate: new Date('2025-07-14'),
      endDate: new Date('2025-12-20'),
      isActive: false,
    },
  });

  const semesterGenap = await prisma.semester.create({
    data: {
      academicYearId: academicYear.id,
      name: 'Semester Genap 2025/2026',
      type: SemesterType.EVEN,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-06-20'),
      isActive: true,
    },
  });

  // 7. Seed Schedules (Monday - Saturday)
  console.log('📅 Seeding Schedules for Monday - Saturday...');

  const days: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  let scheduleCount = 0;
  for (let dIdx = 0; dIdx < days.length; dIdx++) {
    const day = days[dIdx];
    for (let cIdx = 0; cIdx < classes.length; cIdx++) {
      const cls = classes[cIdx];
      for (let pIdx = 0; pIdx < 4; pIdx++) { // 4 periods per day per class
        const teacherIdx = (cIdx + pIdx + dIdx) % teachers.length;
        const periodIdx = pIdx % periods.length;
        const teacher = teachers[teacherIdx];
        const period = periods[periodIdx];

        await prisma.schedule.create({
          data: {
            teacherId: teacher.id,
            classId: cls.id,
            lessonPeriodId: period.id,
            semesterId: semesterGenap.id,
            dayOfWeek: day,
            subject: teacher.subject,
            periodValidFrom: new Date('2026-01-05'),
            periodValidTo: new Date('2026-06-20'),
            isActive: true,
          },
        });
        scheduleCount++;
      }
    }
  }

  // 8. Seed System Settings
  console.log('⚙️ Seeding System Settings...');
  await prisma.systemSetting.createMany({
    data: [
      { key: 'SCHOOL_NAME', value: 'SMA Negeri 1 SIMOGU (Pesantren)', description: 'Nama Sekolah & Pesantren Utama' },
      { key: 'WHATSAPP_AUTO_SEND', value: 'true', description: 'Otomatis kirim notifikasi WA saat catat absensi' },
      { key: 'TIMEZONE', value: 'Asia/Jakarta', description: 'Waktu standar sistem' },
    ],
    skipDuplicates: true,
  });

  // 9. Seed Pengajian Halaqah / Classes (Pesantren Boarding School)
  console.log('🕌 Seeding Pengajian Halaqah / Classes...');
  const halaqahData = [
    { name: 'Halaqah Al-Jurumiyah (Nahwu A)', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 1', description: 'Kajian dasar kaidah bahasa arab & nahwu shorof' },
    { name: 'Halaqah Fathul Qorib (Fiqih)', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 2', description: 'Pendalaman fiqih madzhab Syafi\'i' },
    { name: 'Halaqah Tahfidz Al-Qur\'an Putra', category: 'Tahfidz', location: 'Gedung Tahfidz Lt. 1', description: 'Setoran hafalan & muroja\'ah Al-Qur\'an' },
    { name: 'Halaqah Safinatun Najah', category: 'Diniyah', location: 'Asrama Putra Al-Ghazali', description: 'Dasar-dasar aqidah dan ibadah praktis' },
    { name: 'Halaqah Riyadhus Shalihin', category: 'Hadits', location: 'Aula Utama Pesantren', description: 'Kajian hadits nabawi & tazkiyatun nafs' },
  ];

  const pengajianClasses = [];
  for (const h of halaqahData) {
    const existing = await prisma.pengajianClass.findFirst({ where: { name: h.name } });
    if (!existing) {
      const created = await prisma.pengajianClass.create({
        data: {
          name: h.name,
          category: h.category,
          location: h.location,
          description: h.description,
          isActive: true,
        },
      });
      pengajianClasses.push(created);
    } else {
      pengajianClasses.push(existing);
    }
  }

  // 10. Seed Pengajian Schedules for PAGI, ASHAR, MAGHRIB
  console.log('📖 Seeding Pengajian Schedules (Pagi, Ashar, Maghrib)...');
  const pengajianSessions = [
    { session: PengajianSession.PAGI, timeSlot: '05:30 - 06:30 (Ba\'da Subuh)' },
    { session: PengajianSession.ASHAR, timeSlot: '16:00 - 17:00 (Ba\'da Ashar)' },
    { session: PengajianSession.MAGHRIB, timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)' },
  ];

  const kitabs = ['Jurumiyah & Imrithi', 'Fathul Qorib Al-Mujib', 'Tahfidz 30 Juz & Tahsin', 'Safinatun Najah', 'Riyadhus Shalihin'];

  let pengajianScheduleCount = 0;
  for (const s of pengajianSessions) {
    for (let i = 0; i < pengajianClasses.length; i++) {
      const cls = pengajianClasses[i];
      const teacher = teachers[(i + (s.session === PengajianSession.PAGI ? 0 : s.session === PengajianSession.ASHAR ? 2 : 4)) % teachers.length];
      const kitab = kitabs[i % kitabs.length];

      // Seed for every day from MONDAY to SUNDAY
      for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]) {
        const existingSched = await prisma.pengajianSchedule.findFirst({
          where: {
            pengajianClassId: cls.id,
            session: s.session,
            dayOfWeek: day,
          },
        });

        if (!existingSched) {
          await prisma.pengajianSchedule.create({
            data: {
              pengajianClassId: cls.id,
              teacherId: teacher.id,
              session: s.session,
              dayOfWeek: day,
              kitab,
              timeSlot: s.timeSlot,
              isActive: true,
            },
          });
          pengajianScheduleCount++;
        }
      }
    }
  }

  console.log(`✅ SIMOGU Database Seeding Completed Successfully!`);
  console.log(`   - Users: 6 (SuperAdmin, Admin, Piket1, Piket2, Piket Pengajian, Ketua Pengajian)`);
  console.log(`   - Teachers / Ustadz: ${teachers.length}`);
  console.log(`   - Formal Classes: ${classes.length}`);
  console.log(`   - Formal Periods: ${periods.length}`);
  console.log(`   - Formal Schedules: ${scheduleCount}`);
  console.log(`   - Pengajian Halaqah: ${pengajianClasses.length}`);
  console.log(`   - Pengajian Schedules: ${pengajianScheduleCount}`);
}


main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
