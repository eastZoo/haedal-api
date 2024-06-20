import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AlarmHistoryService } from './alarm-history.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('alarm-history')
export class AlarmHistoryController {
  constructor(private readonly alarmHistoryService: AlarmHistoryService) {}

  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getAlarmHistoryList(@Req() req: Request) {
    return await this.alarmHistoryService.getAlarmHistoryList(req);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/read/:alarmId')
  async readAlarmHistory(
    @Req() req: Request,
    @Param('alarmId') alarmId: string, // @Param() 데코레이터를 사용하여 경로 매개변수 추출
  ) {
    return await this.alarmHistoryService.readAlarmHistory(req, alarmId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/unread-all')
  async getUnreadAlarmCount(@Req() req: Request) {
    return await this.alarmHistoryService.getUnreadAlarmCount(req);
  }
}
