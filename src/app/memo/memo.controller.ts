import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MemoService } from './memo.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('memo')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  /** 메모 전체 리스트 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getMemoList(@Req() req: any) {
    return await this.memoService.getMemoList(req);
  }

  /** 메모 카테고리 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/category/create')
  async createMemoCategory(@Req() req: any) {
    return await this.memoService.createMemoCategory(req);
  }

  /** 메모 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  async createMemo(@Req() req: any) {
    console.log('@!#@!', req.body);
    return await this.memoService.createMemo(req);
  }

  /** 메모 아이템 체크 업데이트 */
  @UseGuards(AccessTokenGuard)
  @Post('/update/check')
  async updateMemoItemCheck(@Req() req: any) {
    return await this.memoService.updateMemoItemCheck(req);
  }

  /** 메모 디테일 현재 선택 메모 리스트 */
  @UseGuards(AccessTokenGuard)
  @Get('/detail/:id')
  async getCurrentMemo(@Req() req: any, @Param('id') id: string) {
    return await this.memoService.getCurrentMemo(id, req);
  }
}
