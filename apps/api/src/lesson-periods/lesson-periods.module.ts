import { Module } from '@nestjs/common';
import { LessonPeriodsService } from './lesson-periods.service';
import { LessonPeriodsController } from './lesson-periods.controller';

@Module({
  controllers: [LessonPeriodsController],
  providers: [LessonPeriodsService],
  exports: [LessonPeriodsService],
})
export class LessonPeriodsModule {}
