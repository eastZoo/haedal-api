import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Memo } from 'src/entities/memo.entity';
import { DataSource, Repository } from 'typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { responseObj } from 'src/util/responseObj';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(MemoCategory)
    private readonly memoCategoryRepository: Repository<MemoCategory>,
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
    private readonly alarmHistoryService: AlarmHistoryService,
    private readonly dataSource: DataSource, // DataSource를 주입받습니다.
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

      const memoCategory = await this.memoCategoryRepository.save({
        category: req.body.category,
        title: req.body.title,
        color: req.body.color,
        userId: userId,
        coupleId: coupleId,
      });

      // 알람 히스토리 저장
      const {
        data: { id },
      } = await this.alarmHistoryService.addAlarmHistory(
        memoCategory.id,
        userId,
        coupleId,
        'memoCategory',
        'create',
        null,
        req.body.title,
      );
      Logger.log('id', id);

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
