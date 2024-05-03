import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MemoService } from './memo.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('memo')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  /** 메모 디테일 현재 선택 메모 리스트 */
  @UseGuards(AccessTokenGuard)
  @Get('/detail/:id')
  async getCurrentMemo(@Req() req: any, @Param('id') id: string) {
    return await this.memoService.getCurrentMemo(id, req);
  }

  /** 메모 전체 리스트 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getMemoList(@Req() req: any) {
    return await this.memoService.getMemoList(req);
  }

  /** 메모 카테고리 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  async create(@Req() req: any) {
    return await this.memoService.create(req);
  }
}
