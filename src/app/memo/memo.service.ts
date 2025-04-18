import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Memo } from 'src/entities/memo.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { responseObj } from 'src/util/responseObj';
import { AlarmHistory } from 'src/entities/alarm-history.entity';
import { AlarmReadStatus } from 'src/entities/alarm_read_status.entity';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { User } from 'src/entities/user.entity';
import { FcmToken } from 'src/entities/fcm.entity';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(MemoCategory)
    private readonly memoCategoryRepository: Repository<MemoCategory>,
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
    private readonly alarmHistoryService: AlarmHistoryService,
    private readonly dataSource: DataSource, // DataSource를 주입받습니다.
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    private readonly fcmService: FcmService,
  ) {}

  async getMemoList(req) {
    const { coupleId } = req.user;
    const result = await this.memoCategoryRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .andWhere('memo_category.isDeleted = false')
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .orderBy('memo_category.created_At', 'DESC')
      .addOrderBy('memo.created_At', 'DESC')
      .getMany();

    const updatedData = result.map((obj) => ({
      ...obj,
      clear: obj.memos.filter((memo) => memo.isDone).length,
    }));

    return responseObj.success(updatedData);
  }

  async createMemoCategory(req: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { coupleId, id: userId } = req.user;

      // 메모 카테고리 저장
      const memoCategory = await queryRunner.manager.save(MemoCategory, {
        category: req.body.category,
        title: req.body.title,
        color: req.body.color,
        userId: userId,
        coupleId: coupleId,
      });

      // 알람 히스토리 저장
      const alarmHistory = await queryRunner.manager.save(AlarmHistory, {
        alarmId: memoCategory.id,
        userId: userId,
        coupleId: coupleId,
        type: 'memoCategory',
        crud: 'create',
        content: req.body.title,
      });

      // 본인 알람 읽음 처리
      await queryRunner.manager.save(AlarmReadStatus, {
        alarmHistoryId: alarmHistory.id,
        userId: userId,
        isRead: true,
      });

      // 상대방 찾기
      const partner = await queryRunner.manager.findOne(User, {
        where: {
          coupleId: coupleId,
          id: Not(userId), // 자신이 아닌 상대방
        },
      });
      Logger.log('partner', partner);
      await queryRunner.commitTransaction();

      // 트랜잭션 완료 후 푸시 알림 전송
      if (partner) {
        // 상대방의 FCM 토큰 조회
        const partnerFcmTokens = await this.fcmTokenRepository.find({
          where: { userId: partner.id },
        });

        Logger.log('partnerFcmTokens', partnerFcmTokens);

        // 각 토큰에 대해 푸시 알림 전송
        for (const tokenData of partnerFcmTokens) {
          const result = await this.fcmService.sendPushNotification({
            fcmToken: tokenData.fcmToken,
            title: '새로운 메모 카테고리가 생성되었습니다.',
            body: `${req.body.title}`,
          });
          Logger.log('result', result);
        }
      }

      return responseObj.success();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    } finally {
      await queryRunner.release();
    }
  }
  async createMemo(req: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { coupleId, id: userId } = req.user;

      const memo = await queryRunner.manager.save(Memo, {
        memoCategoryId: req.body.categoryId,
        userId: userId,
        coupleId: coupleId,
        memo: req.body.memo,
      });

      Logger.log('memo', {
        memoCategoryId: req.body.categoryId,
        userId: userId,
        coupleId: coupleId,
        memo: req.body.memo,
      });

      Logger.log('memo', memo);

      // 메모 카테고리 이름 가져오기
      const { title: categoryName } = await this.memoCategoryRepository.findOne(
        {
          where: { id: req.body.categoryId },
        },
      );

      // 알람 히스토리 저장
      const {
        data: { id },
      } = await this.alarmHistoryService.addAlarmHistory(
        memo.id,
        userId,
        coupleId,
        'memo',
        'create',
        null,
        categoryName, // 카테고리 이름
        req.body.memo, // 메모 내용
      );
      // 본인 알람은 자동으로 읽음 처리
      await this.alarmHistoryService.addMyAlarmReadStatus(id, userId);

      await queryRunner.commitTransaction();
      return responseObj.success();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException('저장에 실패했습니다.', 500);
    } finally {
      await queryRunner.release();
    }
  }

  async updateMemoItemCheck(req: any) {
    try {
      const memo = await this.memoRepository.update(
        { id: req.body.id },
        { isDone: req.body.isDone },
      );
      if (memo.affected === 0) {
        return responseObj.success();
      }

      return responseObj.success();
    } catch (e: any) {
      return responseObj.error(e.message);
    }
  }

  async getCurrentMemo(id: string, req: any) {
    const { coupleId } = req.user;

    const data = await this.memoCategoryRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .andWhere('memo_category.id = :id', { id })
      .andWhere('memo_category.isDeleted = false')
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .getMany();

    return responseObj.success({ currentMemo: data });
  }
}
