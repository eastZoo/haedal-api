import { Body, Controller, Post, Request } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { PushParamsDto } from './dto/push-params.dto';

@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @ApiOperation({ summary: 'FCM 토큰 저장' })
  @ApiResponse({
    status: 200,
    description: 'FCM 토큰 저장 성공',
  })
  @Post('save-fcm-token')
  async saveFcmToken(@Request() req: any) {
    console.log(req.body);
    return this.fcmService.saveFcmToken(req.body);
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
