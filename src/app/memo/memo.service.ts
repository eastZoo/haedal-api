import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(MemoCategory)
    private readonly memoRepository: Repository<MemoCategory>,
  ) {}

  async getMemoList(req) {
    const { coupleId } = req.user;
    const result = await this.memoRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .getMany();

    console.log('getMemoList : : : : : :', result);
    return result;
  }

  async create(req: any) {
    try {
      const { coupleId, id } = req.user;
      console.log('memoRepository : : : ', req.body);

      const result = await this.memoRepository.save({
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

  async getCurrentMemo(id: string, req: any) {
    const { coupleId } = req.user;

    console.log('coupleId ::::', coupleId);
    const data = await this.memoRepository
      .createQueryBuilder('memo_category')
      .where('memo_category.couple_id = :coupleId', { coupleId })
      .andWhere('memo_category.id = :id', { id })
      .leftJoinAndSelect('memo_category.memos', 'memo')
      .getMany();

    console.log('getCurrentMemo : : : : : :', data);
    return { currentMemo: data };
  }
}
