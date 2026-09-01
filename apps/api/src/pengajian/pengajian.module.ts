import { Module } from '@nestjs/common';
import { PengajianController } from './pengajian.controller';
import { PengajianService } from './pengajian.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PengajianController],
  providers: [PengajianService],
  exports: [PengajianService],
})
export class PengajianModule {}
