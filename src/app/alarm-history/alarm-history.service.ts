import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { read } from 'fs';
import { AlarmHistory } from 'src/entities/alarm-history.entity';
import { AlarmReadStatus } from 'src/entities/alarm_read_status.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class AlarmHistoryService {
  constructor(
    @InjectRepository(AlarmHistory)
    private readonly alarmHistoryRepository: Repository<AlarmHistory>,
    @InjectRepository(AlarmReadStatus)
    private readonly alarmReadStatusRepository: Repository<AlarmReadStatus>,
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
    sub_content?: string,
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
        sub_content,
      });

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async getAlarmHistoryList(req: any) {
    const { coupleId, id: userId } = req.user;

    console.log('userId  @@@@@@@@@@@:', userId);
    console.log('coupleId  @@@@@@@@@@@:', coupleId);
    try {
      const alarmHistoryList = await this.alarmHistoryRepository
        .createQueryBuilder('alarmHistory')
        .leftJoin('alarmHistory.user', 'user')
        .addSelect('user.profileUrl')
        .addSelect('user.name')
        .leftJoin(
          'alarmHistory.alarmReadStatuses',
          'alarmReadStatus',
          'alarmReadStatus.userId = :userId',
          { userId },
        )
        .addSelect('alarmReadStatus.isRead')
        .where('alarmHistory.coupleId = :coupleId', { coupleId })
        .orderBy('alarmHistory.createdAt', 'DESC')
        .getMany();

      // Transform the result
      const transformedResult = alarmHistoryList.map((alarm) => {
        const isRead =
          alarm.alarmReadStatuses.length > 0
            ? alarm.alarmReadStatuses[0].isRead
            : false;
        return {
          ...alarm,
          alarmReadStatuses: isRead,
        };
      });

      return { success: true, alarmHistoryList: transformedResult };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('알람 히스토리 조회에 실패했습니다.', 500);
    }
  }

  async readAlarmHistory(req: any, alarmId: string) {
    const { id: userId } = req.user;
    try {
      const alarmReadStatus = await this.alarmReadStatusRepository.findOne({
        where: { alarmHistoryId: alarmId, userId },
      });

      if (!alarmReadStatus) {
        const newStatus = this.alarmReadStatusRepository.create({
          alarmHistoryId: alarmId,
          userId: userId,
          isRead: true,
        });
        await this.alarmReadStatusRepository.save(newStatus);
      } else if (!alarmReadStatus.isRead) {
        alarmReadStatus.isRead = true;
        await this.alarmReadStatusRepository.save(alarmReadStatus);
      }
    } catch (error) {
      Logger.error(error);
      throw new HttpException('알람 히스토리 읽음 처리에 실패했습니다.', 500);
    }
  }

  async getUnreadAlarmCount(req: any) {
    const { id: userId, coupleId } = req.user;
    try {
      const unreadAlarmCount = await this.alarmHistoryRepository
        .createQueryBuilder('alarmHistory')
        .leftJoin(
          'alarmHistory.alarmReadStatuses',
          'alarmReadStatus',
          'alarmReadStatus.alarmHistoryId = alarmHistory.id AND alarmReadStatus.userId = :userId',
          { userId },
        )
        .where('alarmHistory.coupleId = :coupleId', { coupleId })
        .andWhere(
          'alarmReadStatus.isRead IS NULL OR alarmReadStatus.isRead = false',
        )
        .getCount();

      return { success: true, unreadAlarmCount };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('안 읽은 알람 개수 조회에 실패했습니다.', 500);
    }
  }
}
