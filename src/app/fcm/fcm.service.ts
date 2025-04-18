import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmToken } from 'src/entities/fcm.entity';
import * as admin from 'firebase-admin';
import { PushParamsDto } from './dto/push-params.dto';
import { responseObj } from 'src/util/responseObj';

@Injectable()
export class FcmService {
  private readonly fcm: admin.messaging.Messaging;

  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
  ) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }
    this.fcm = admin.messaging();
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
      notification: {
        title: pushParamsDto.title,
        body: pushParamsDto.body,
      },
      android: {
        notification: {
          channelId: 'high_importance_channel',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: pushParamsDto.title,
              body: pushParamsDto.body,
            },
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert', // 중요!
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

  async saveFcmToken(req: any) {
    try {
      console.log('req.user', req.user);
      const { id: userId } = req.user;
      const { fcmToken } = req.body;

      Logger.log('fcm save userId', userId);
      Logger.log('fcm save fcmToken', fcmToken);
      const existing = await this.fcmTokenRepository.findOne({
        where: { userId, fcmToken },
      });

      if (!existing) {
        const tokenEntity = this.fcmTokenRepository.create({
          userId,
          fcmToken,
        });
        await this.fcmTokenRepository.save(tokenEntity);
      }

      return responseObj.success('FCM 토큰이 새로 저장되었습니다.');
    } catch (error) {
      Logger.error('FCM 토큰 저장 중 오류 발생:', error);
      return responseObj.error('FCM 토큰 저장 중 오류가 발생했습니다.', error);
    }
  }

  async deleteFcmToken(req: any) {
    try {
      const { id: userId } = req.user;
      const { fcmToken } = req.body;

      Logger.log('fcm delete userId', userId);
      Logger.log('fcm delete fcmToken', fcmToken);

      const result = await this.fcmTokenRepository.delete({
        userId,
        fcmToken,
      });

      if (result.affected === 0) {
        return responseObj.error('존재하지 않는 FCM 토큰입니다.');
      }

      return responseObj.success('FCM 토큰이 삭제되었습니다.');
    } catch (error) {
      Logger.error('FCM 토큰 삭제 중 오류 발생:', error);
      return responseObj.error('FCM 토큰 삭제 중 오류가 발생했습니다.', error);
    }
  }
}
