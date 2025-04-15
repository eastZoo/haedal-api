import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { CommonCode } from 'src/entities/common_code.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';
import { AlarmHistoryModule } from '../alarm-history/alarm-history.module';
import { FcmToken } from 'src/entities/fcm.entity';
import { User } from 'src/entities/user.entity';
import { Couple } from 'src/entities/couple.entity';
import { FcmService } from '../fcm/fcm.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calendar,
      CommonCode,
      WorkSchedule,
      FcmToken,
      User,
      Couple,
    ]),
    AlarmHistoryModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService, FcmService],
})
export class CalendarModule {}
