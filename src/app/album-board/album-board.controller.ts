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
  async create(
    filesData: Array<Express.Multer.File>,
    @Req() req: Request,
    @TransactionManager() queryManager: EntityManager,
  ) {
    const result = await this.albumBoardService.create(
      filesData,
      req,
      queryManager,
    );
    return;
  }

  /** 스토리 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getAlbunBoardList(@Req() req: Request, @Query('_page') page: string) {
    return await this.albumBoardService.getAlbunBoardList(req, page);
  }
}
