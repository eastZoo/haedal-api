import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar } from 'src/entities/calendar.entity';
import { LabelColor } from 'src/entities/label-color.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarRepository: Repository<Calendar>,
    @InjectRepository(LabelColor)
    private readonly labelColorRepository: Repository<LabelColor>,
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
}
