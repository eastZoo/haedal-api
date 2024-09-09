import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AlarmHistoryService } from './alarm-history.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request } from 'express';
import { ApiOperation } from '@nestjs/swagger';

@Controller('alarm-history')
export class AlarmHistoryController {
  constructor(private readonly alarmHistoryService: AlarmHistoryService) {}

  @ApiOperation({ summary: '알람 목록 리스트 조회' })
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getAlarmHistoryList(@Req() req: Request) {
    return await this.alarmHistoryService.getAlarmHistoryList(req);
  }

  @ApiOperation({ summary: '알림 목록의 읽지 않은 알림 전체 읽음 처리' })
  @UseGuards(AccessTokenGuard)
  @Get('/read')
  async readAlarmHistory(@Req() req: Request) {
    return await this.alarmHistoryService.readAlarmHistory(req);
  }

  @ApiOperation({ summary: '읽지않은 알림 수 획득' })
  @UseGuards(AccessTokenGuard)
  @Get('/unread-all')
  async getUnreadAlarmCount(@Req() req: Request) {
    return await this.alarmHistoryService.getUnreadAlarmCount(req);
  }
}
