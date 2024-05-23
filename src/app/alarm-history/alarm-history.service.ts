import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { read } from 'fs';
import { AlarmHistory } from 'src/entities/alarm-history.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class AlarmHistoryService {
  constructor(
    @InjectRepository(AlarmHistory)
    private readonly alarmHistoryRepository: Repository<AlarmHistory>,
  ) {}

  /** 사용자의 활동에 대한 내역 저장 */
  async addAlarmHistory(
    alarmId: string,
    userId: string,
    coupleId: string,
    type: string,
    crud: string,
    pic_qty?: number,
    content?: string,
  ) {
    try {
      await this.alarmHistoryRepository.save({
        alarmId,
        userId,
        coupleId,
        type,
        crud,
        pic_qty,
        content,
      });

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }
}
