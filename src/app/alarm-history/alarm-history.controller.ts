import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
