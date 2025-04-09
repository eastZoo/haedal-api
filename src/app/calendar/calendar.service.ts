import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { CommonCode } from 'src/entities/common_code.entity';
import { WorkScheduleFiles } from 'src/entities/work-schedule-files.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';
import {
  AnyBulkWriteOperation,
  DataSource,
  EntityManager,
  Repository,
} from 'typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { responseObj } from 'src/util/responseObj';

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
    private readonly dataSource: DataSource, // DataSource를 주입받습니다.
  ) {}

  async create(req: any, queryManager: EntityManager) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { coupleId, id: userId } = req.user;

      console.log(req);
      const calendar = await queryRunner.manager.save(Calendar, {
        ...req.body,
        userId: userId,
        coupleId: coupleId,
      });

      // 알람 히스토리 저장
      const {
        data: { id },
      } = await this.alarmHistoryService.addAlarmHistory(
        calendar.id,
        userId,
        coupleId,
        'calendar',
        'create',
        null,
        req.body.title,
        req.body.startDate, // sub_content - 시작날짜
      );

      // 본인 알람은 자동으로 읽음 처리
      await this.alarmHistoryService.addMyAlarmReadStatus(id, userId);
      await queryRunner.commitTransaction();
      return responseObj.success();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    } finally {
      await queryRunner.release();
    }
  }

  async getScheduleList(req) {
    const { coupleId } = req.user;
    const result = await this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.couple_id = :coupleId', { coupleId })
      .andWhere('calendar.isDeleted = false')
      .getMany();

    console.log(result);
    return responseObj.success(result);
  }

  async getColorList() {
    try {
      const result = await this.CommonCodeRepository.find({
        where: { codeType: 'LC01' },
      });
      return responseObj.success(result);
    } catch (error) {
      return responseObj.error('캘린더 라벨 컬러 조회에 실패했습니다.');
    }
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { coupleId, id: userId } = req.user;

      // 삭제 전 캘린더 항목 조회
      const calendarItem = await this.calendarRepository.findOne({
        where: {
          id: calendarId,
          coupleId: coupleId,
        },
      });

      if (!calendarItem) {
        throw new NotFoundException('캘린더 항목을 찾을 수 없습니다.');
      }

      // 삭제 처리
      await this.calendarRepository.update(
        {
          id: calendarId,
          coupleId: coupleId,
        },
        { isDeleted: true },
      );

      // 알람 히스토리 저장 (수정된 부분)
      const {
        data: { id },
      } = await this.alarmHistoryService.addAlarmHistory(
        calendarId,
        userId,
        coupleId,
        'albumboard',
        'delete',
        null,
        calendarItem.title, // 미리 조회한 데이터의 title 사용
      );

      // 본인 알람은 자동으로 읽음 처리
      await this.alarmHistoryService.addMyAlarmReadStatus(id, userId);

      await queryRunner.commitTransaction();
      return responseObj.success(null, '삭제 성공');
    } catch (e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();
      return responseObj.error('삭제 실패');
    } finally {
      await queryRunner.release();
    }
  }
}
