import {
  Bind,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';
import { AlbumBoardService } from './album-board.service';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/decorator/transaction-manager';
import { TransactionInterceptor } from 'src/middleware/transaction.middleware';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('album-board')
export class AlbumBoardController {
  constructor(private readonly albumBoardService: AlbumBoardService) {}

  /** 스토리 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  /** FilesInterceptor의 첫번째 속성 이름이 formData의 이미지가 담겨있는 key값과 같아야한다.*/
  @UseInterceptors(FilesInterceptor('images', null, multerDiskOptions))
  @UseInterceptors(TransactionInterceptor)
  @Bind(UploadedFiles())
  async create(filesData: Array<Express.Multer.File>, @Req() req: Request) {
    const result = await this.albumBoardService.create(filesData, req);
    return;
  }

  /** 스토리 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getAlbumBoardList(
    @Req() req: Request,
    @Query('_offset') offset: string,
  ) {
    return await this.albumBoardService.getAlbumBoardList(req, offset);
  }

  /** 카테고리별 스토리 */
  @UseGuards(AccessTokenGuard)
  @Get('/category')
  async getCategoryAlbumBoardList(
    @Req() req: Request,
    @Query('_offset') offset: string,
    @Query('_category') category: string,
  ) {
    return await this.albumBoardService.getCategoryAlbumBoardList(
      req,
      offset,
      category,
    );
  }

  // 스토리 삭제
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  @Delete('/delete/:id')
  async deleteAlbumBoard(
    @TransactionManager() queryManager: EntityManager,
    @Req() req: any,
    @Param('id') boardId: string,
  ) {
    return await this.albumBoardService.deleteAlbumBoard(
      queryManager,
      req,
      boardId,
    );
  }
}
