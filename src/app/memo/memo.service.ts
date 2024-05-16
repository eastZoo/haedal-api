import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Memo } from 'src/entities/memo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(MemoCategory)
    private readonly memoCategoryRepository: Repository<MemoCategory>,
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
  ) {}

  async getMemoList(req) {
    const { coupleId } = req.user;
    const result = await this.memoCategoryRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .orderBy('memo_category.created_At', 'DESC')
      .addOrderBy('memo.created_At', 'DESC')
      .getMany();

    const updatedData = result.map((obj) => ({
      ...obj,
      clear: obj.memos.filter((memo) => memo.isDone).length,
    }));

    return updatedData;
  }

  async createMemoCategory(req: any) {
    try {
      const { coupleId, id } = req.user;

      await this.memoCategoryRepository.save({
        category: req.body.category,
        userId: id,
        coupleId: coupleId,
      });

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async createMemo(req: any) {
    try {
      Logger.log(req.body);
      const { coupleId, id } = req.user;

      await this.memoRepository.save({
        memoCategoryId: req.body.categoryId,
        userId: id,
        coupleId: coupleId,
        memo: req.body.memo,
      });

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async updateMemoItemCheck(req: any) {
    const memo = await this.memoRepository.update(
      { id: req.body.id },
      { isDone: req.body.isDone },
    );
    if (memo.affected === 0) {
      return { success: false };
    }

    return { success: true };
  }

  async getCurrentMemo(id: string, req: any) {
    const { coupleId } = req.user;

    const data = await this.memoCategoryRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .andWhere('memo_category.id = :id', { id })
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .getMany();

    return { currentMemo: data };
  }
}
