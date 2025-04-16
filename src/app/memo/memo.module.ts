import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Memo } from 'src/entities/memo.entity';
import { AlarmHistoryModule } from '../alarm-history/alarm-history.module';
import { FcmService } from '../fcm/fcm.service';
import { FcmToken } from 'src/entities/fcm.entity';
import { AlarmHistory } from 'src/entities/alarm-history.entity';
import { AlarmReadStatus } from 'src/entities/alarm_read_status.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemoCategory,
      Memo,
      FcmToken,
      AlarmHistory,
      AlarmReadStatus,
      User,
    ]),
    AlarmHistoryModule,
  ],
  controllers: [MemoController],
  providers: [MemoService, FcmService],
})
export class MemoModule {}
