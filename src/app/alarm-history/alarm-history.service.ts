import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { read } from 'fs';
import { AlarmHistory } from 'src/entities/alarm-history.entity';
import { AlarmReadStatus } from 'src/entities/alarm_read_status.entity';
import { responseObj } from 'src/util/responseObj';
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
      const { id } = await this.alarmHistoryRepository.save({
        alarmId,
        userId,
        coupleId,
        type,
        crud,
        pic_qty,
        content,
        sub_content,
      });

      return responseObj.success({ id });
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async getAlarmHistoryList(req: any) {
    Logger.log('알람 히스토리 조회');

    const { coupleId, id: userId } = req.user;
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

      // 데이터 변환
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

      return responseObj.success(transformedResult);
      // return { success: true, alarmHistoryList: transformedResult };
    } catch (error) {
      Logger.error(error);
      return responseObj.error('알람 히스토리 조회에 실패했습니다');
    }
  }

  async readAlarmHistory(req: any) {
    Logger.log('알람 ');
    const { coupleId, id: userId } = req.user;
    try {
      // 해당 커플의 알람 히스토리를 가져옵니다.
      const alarmHistory = await this.alarmHistoryRepository.find({
        where: { coupleId },
      });

      // 현재 사용자와 연관된 alarmReadStatus를 가져옵니다.
      const alarmReadStatus = await this.alarmReadStatusRepository.find({
        where: {
          userId: userId,
          alarmHistoryId: In(alarmHistory.map((alarm) => alarm.id)),
        },
      });

      // alarmHistory에 있는 항목들 중 alarmReadStatus에 없는 항목을 필터링합니다.
      const unreadAlarms = alarmHistory.filter(
        (alarm) =>
          !alarmReadStatus.some((status) => status.alarmHistoryId === alarm.id),
      );

      // 새로 생성해야 할 alarmReadStatus 항목을 만듭니다.
      const newAlarmReadStatuses = unreadAlarms.map((alarm) => ({
        alarmHistoryId: alarm.id,
        userId: userId,
        isRead: true,
      }));

      // 새로 생성된 alarmReadStatus 항목들을 저장합니다.
      if (newAlarmReadStatuses.length > 0) {
        await this.alarmReadStatusRepository.save(newAlarmReadStatuses);
      }

      return
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

      return responseObj.success(unreadAlarmCount);
    } catch (error) {
      Logger.error(error);
      return responseObj.error('안 읽은 알람 개수 조회에 실패했습니다.');
    }
  }

  /** 나의 활동에대한 알림은 동시 읽음 처리 */
  async addMyAlarmReadStatus(alarmHistoryId: string, userId: string) {
    try {
      await this.alarmReadStatusRepository.save({
        alarmHistoryId: alarmHistoryId,
        userId: userId,
        isRead: true,
      });
    } catch (error) {
      Logger.error(error);
      throw new HttpException('알림 읽음 처리에 실패했습니다.', 500);
    }
  }
}
