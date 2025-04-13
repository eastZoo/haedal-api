import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmToken } from 'src/entities/fcm.entity';
import * as admin from 'firebase-admin';
import { PushParamsDto } from './dto/push-params.dto';

@Injectable()
export class FcmService {
  private readonly fcm: admin.messaging.Messaging;

  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
  ) {
    const serviceAccount = require('../../../haedal-project-firebase-adminsdk.json');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    this.fcm = admin.messaging();
  }

  /** 푸시 알림 전송 */
  async sendPushNotification(pushParamsDto: PushParamsDto) {
    Logger.log('푸시 알림 전송');
    const message: admin.messaging.Message = {
      token: pushParamsDto.fcmToken,
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        route: '/home',
        title: pushParamsDto.title,
        body: pushParamsDto.body,
      },
      // notification: {
      //   title: pushParamsDto.title,
      //   body: pushParamsDto.body,
      // },
      android: {
        // notification: {
        //   channelId: 'high_importance_channel',
        //   clickAction: 'FLUTTER_NOTIFICATION_CLICK', // ✅ 안드로이드 클릭 액션 지원
        // },
      },
      apns: {
        payload: {
          aps: {
            // category: 'FLUTTER_NOTIFICATION_CLICK', // ✅ iOS 클릭 액션 지원
            contentAvailable: true,
          },
        },
      },
    };

    Logger.log('message', message);
    try {
      const response = await this.fcm.send(message);
      console.log('Successfully sent message:', response);
      return 1;
    } catch (error) {
      console.error('Error sending message:', error);
      return 2;
    }
  }

  async saveFcmToken(body: any) {
    try {
      // 기본 유효성 검사
      if (!body) {
        return { success: false, message: '요청 데이터가 없습니다.' };
      }

      const { userId, userType, fcmToken } = body;

      if (!userId || !userType || !fcmToken) {
        return { success: false, message: '필수 파라미터가 누락되었습니다.' };
      }

      if (userType !== 'student' && userType !== 'guardian') {
        return { success: false, message: '잘못된 사용자 타입입니다.' };
      }

      // fcmToken으로 기존 데이터 조회
      const existingTokenData = await this.fcmTokenRepository.findOne({
        where: { fcmToken },
      });

      // Case 1: fcmToken이 이미 존재하는 경우
      if (existingTokenData) {
        // 동일한 사용자의 토큰인 경우
        if (
          existingTokenData.userId === userId &&
          existingTokenData.userType === userType
        ) {
          return { success: true, message: '이미 저장되어 있는 토큰입니다.' };
        }

        // 다른 사용자의 토큰인 경우 -> 업데이트
        await this.fcmTokenRepository.update(existingTokenData.id, {
          userId,
          userType,
        });
        return {
          success: true,
          message: 'FCM 토큰 정보가 업데이트되었습니다.',
        };
      }

      // Case 2: 새로운 fcmToken인 경우
      const newFcmToken = this.fcmTokenRepository.create({
        userId,
        userType,
        fcmToken,
      });
      await this.fcmTokenRepository.save(newFcmToken);
      return { success: true, message: 'FCM 토큰이 새로 저장되었습니다.' };
    } catch (error) {
      Logger.error('FCM 토큰 저장 중 오류 발생:', error);
      return {
        success: false,
        message: 'FCM 토큰 저장 중 오류가 발생했습니다.',
      };
    }
  }
}
