import { Body, Controller, Post, Req, Get, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TransactionManager } from 'src/decorator/transaction-manager';
import { EntityManager } from 'typeorm';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /** 스토리 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  async create(
    @Req() req: any,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return await this.calendarService.create(req, queryManager);
  }

  /** 캘린더 리스트 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getScheduleList(@Req() req: any) {
    return await this.calendarService.getScheduleList(req);
  }

  /** 캘린더 라벨 컬러 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/color')
  async getColorList() {
    return await this.calendarService.getColorList();
  }
}
