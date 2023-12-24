import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MemoService } from './memo.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('memo')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  /** 캘린더 리스트 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getScheduleList(@Req() req: any) {
    return await this.memoService.getMemoList(req);
  }

  /** 메모 카테고리 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  async create(@Req() req: any) {
    return await this.memoService.create(req);
  }
}
