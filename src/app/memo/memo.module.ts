import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Memo } from 'src/entities/memo.entity';
import { AlarmHistoryModule } from '../alarm-history/alarm-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([MemoCategory, Memo]), AlarmHistoryModule],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
