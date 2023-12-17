import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { LabelColor } from 'src/entities/label-color.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar, LabelColor, WorkSchedule])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
