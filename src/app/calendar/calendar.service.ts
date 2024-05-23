import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { CommonCode } from 'src/entities/common_code.entity';
import { WorkScheduleFiles } from 'src/entities/work-schedule-files.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';
import { AnyBulkWriteOperation, EntityManager, Repository } from 'typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(CommonCode)
    private readonly CommonCodeRepository: Repository<CommonCode>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
    private readonly alarmHistoryService: AlarmHistoryService,
  ) {}

  async create(req: any, queryManager: EntityManager) {
    try {
      const { coupleId, id: userId } = req.user;

      const calendar = await this.calendarRepository.save({
        ...req.body,
        userId: userId,
        coupleId: coupleId,
      });

      console.log(
        calendar.id,
        userId,
        coupleId,
        'calendar',
        'create',
        0,
        req.body.title,
      );
      // 알람 히스토리 저장
      await this.alarmHistoryService.addAlarmHistory(
        calendar.id,
        userId,
        coupleId,
        'calendar',
        'create',
        null,
        req.body.title,
      );

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async getScheduleList(req) {
    const { coupleId } = req.user;

    return this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.couple_id = :coupleId', { coupleId })
      .getMany();
  }

  async getColorList() {
    return this.CommonCodeRepository.find({ where: { codeType: 'LC01' } });
  }

  async getCurrentWorkTableUrl(month: string, req: any) {
    const { coupleId } = req.user;

    const data: any = await this.workScheduleRepository
      .createQueryBuilder('work_schedule')
      .leftJoinAndSelect('work_schedule.user', 'user')
      .leftJoinAndSelect('work_schedule.workScheduleFile', 'workScheduleFile')
      .where('work_schedule.couple_id = :coupleId', { coupleId })
      .andWhere("TO_CHAR(work_schedule.workMonth, 'YYYY-MM') = :targetDate", {
        targetDate: month,
      })
      .getMany();

    if (data.length == 0) {
      return { currentWorkTableUrl: 'null' };
    }
    return { currentWorkTableUrl: data };
  }

  /** 알바 스케쥴  */
  async addWorkTable(
    filesData: Express.Multer.File[],
    req: any,
    queryManager: EntityManager,
  ) {
    try {
      const post = JSON.parse(req.body.postData);
      const { id } = await queryManager.save(WorkSchedule, {
        ...post,
        userId: req.user.id,
        coupleId: req.user.coupleId,
      });

      const file = filesData.map((item) => ({
        ...item,
        workScheduleId: id,
        coupleId: req.user.coupleId,
      }));
      await queryManager.save(WorkScheduleFiles, file);

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async deleteWorkTable(
    queryManager: EntityManager,
    coupleId: string,
    id: string,
  ) {
    try {
      await queryManager.delete(WorkScheduleFiles, {
        workScheduleId: id,
        coupleId: coupleId,
      });
      await queryManager.delete(WorkSchedule, { id: id, coupleId: coupleId });

      return { success: true, message: '삭제 성공' };
    } catch (e) {
      return { success: false, message: '삭제 실패' };
    }
  }

  async deleteCalendarItem(req: any, calendarId: string) {
    const { coupleId, id: userId } = req.user;
    try {
      const calendar = await this.calendarRepository.update(
        {
          id: calendarId,
          coupleId: coupleId,
        },
        { isDeleted: true },
      );

      // 알람 히스토리 저장
      await this.alarmHistoryService.addAlarmHistory(
        calendarId,
        userId,
        coupleId,
        'albumboard',
        'delete',
        null,
        calendar.raw.changedRows[0].title,
      );

      return { success: true, message: '삭제 성공' };
    } catch (e) {
      return { success: false, message: '삭제 실패' };
    }
  }
}
