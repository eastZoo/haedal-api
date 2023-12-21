import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { LabelColor } from 'src/entities/label-color.entity';
import { WorkScheduleFiles } from 'src/entities/work-schedule-files.entity';
import { WorkSchedule } from 'src/entities/work-schedule.entity';
import { AnyBulkWriteOperation, EntityManager, Repository } from 'typeorm';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(LabelColor)
    private readonly labelColorRepository: Repository<LabelColor>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
  ) {}

  async create(req: any, queryManager: EntityManager) {
    try {
      const { coupleId, id } = req.user;

      const result = await this.calendarRepository.save({
        ...req.body,
        userId: id,
        coupleId: coupleId,
      });

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
    return this.labelColorRepository.find();
  }

  async getCurrentWorkTableUrl(month: string, req: any) {
    const { coupleId } = req.user;

    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', month);
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

  async deleteCalendarItem(coupleId: string, calendarId: string) {
    try {
      await this.calendarRepository.delete({
        id: calendarId,
        coupleId: coupleId,
      });

      return { success: true, message: '삭제 성공' };
    } catch (e) {
      return { success: false, message: '삭제 실패' };
    }
  }
}
