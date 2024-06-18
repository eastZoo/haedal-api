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

  async getAlarmHistoryList(req: any) {
    const { coupleId } = req.user;
    try {
      const alarmHistoryList = await this.alarmHistoryRepository
        .createQueryBuilder('alarmHistory')
        .leftJoin('alarmHistory.user', 'user') // user 테이블과 조인
        .addSelect('user.profileUrl') // user의 profileUrl 필드만 선택
        .addSelect('user.name') // user의 name 필드만 선택
        .where('alarmHistory.coupleId = :coupleId', { coupleId: coupleId })
        .orderBy('alarmHistory.createdAt', 'DESC')
        .getMany();

      return { success: true, alarmHistoryList: alarmHistoryList };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('알람 히스토리 조회에 실패했습니다.', 500);
    }
  }
}
