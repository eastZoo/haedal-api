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
    @InjectRepository(AlarmHistory)
    private albumBoardRepository: Repository<AlbumBoard>,
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
      const alarmHistoryList = await this.alarmHistoryRepository.find({
        where: { coupleId: coupleId },
        order: { createdAt: 'DESC' },
      });

      const testList = await this.alarmHistoryList
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.files', 'file')
        .select([
          'post.oid',
          'post.title',
          // Add other post columns you want to select
          `json_agg(file.filename) AS filelist`,
        ])
        .groupBy('post.oid')
        .getRawMany();

      return alarmHistoryList;
    } catch (error) {
      Logger.error(error);
      throw new HttpException('알람 히스토리 조회에 실패했습니다.', 500);
    }
  }
}
