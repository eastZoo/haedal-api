import { Module } from '@nestjs/common';
import { AlarmHistoryController } from './alarm-history.controller';
import { AlarmHistoryService } from './alarm-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmHistory } from 'src/entities/alarm-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmHistory])],
  controllers: [AlarmHistoryController],
  providers: [AlarmHistoryService],
  exports: [AlarmHistoryService], // AlbumBoardModule에서 AlarmHistoryService를 사용하기 위해 export
})
export class AlarmHistoryModule {}
