import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { PushParamsDto } from './dto/push-params.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @ApiOperation({ summary: 'FCM 토큰 저장' })
  @ApiResponse({
    status: 200,
    description: 'FCM 토큰 저장 성공',
  })
  @UseGuards(AccessTokenGuard)
  @Post('fcm-token')
  async saveFcmToken(@Request() req: any) {
    return this.fcmService.saveFcmToken(req);
  }

  @ApiOperation({ summary: '푸시 알림 전송' })
  @ApiResponse({
    status: 200,
    description: '푸시 알림 전송 성공',
  })
  @Post('send-push-notification')
  async sendPushNotification(@Body() pushParamsDto: PushParamsDto) {
    return this.fcmService.sendPushNotification(pushParamsDto);
  }
}
