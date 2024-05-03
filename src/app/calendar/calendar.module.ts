import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { CommonCode } from 'src/entities/common_code.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar, CommonCode, WorkSchedule])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
