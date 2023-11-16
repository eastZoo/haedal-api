import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  Bind,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { AlbumBoardService } from './album-board.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TransactionInterceptor } from 'src/middleware/transaction.middleware';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/decorator/transaction-manager';

@Controller('album-board')
export class AlbumBoardController {
  constructor(private readonly albumBoardService: AlbumBoardService) {}

  /** 앨범 사진 소식 추가 */
  /** FilesInterceptor의 첫번째 속성 이름이 formData의 이미지가 담겨있는 key값과 같아야한다.*/
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', null, multerDiskOptions))
  @Bind(UploadedFiles())
  async createAlbumBoard(
    filesData: Array<Express.Multer.File>,
    @Req() req: any,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return await this.albumBoardService.createAlbumBoard(
      filesData,
      {
        ...JSON.parse(req.body.data),
        userId: req.user.id,
      },
      queryManager,
    );
  }
}
