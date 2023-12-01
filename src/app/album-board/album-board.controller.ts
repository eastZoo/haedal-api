import {
  Bind,
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';
import { AlbumBoardService } from './album-board.service';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/decorator/transaction-manager';
import { TransactionInterceptor } from 'src/middleware/transaction.middleware';

@Controller('album-board')
export class AlbumBoardController {
  constructor(private readonly albumBoardService: AlbumBoardService) {}

  @Post('/create')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('images', null, multerDiskOptions))
  @Bind(UploadedFiles())
  async create(
    filesData: Array<Express.Multer.File>,
    @TransactionManager() queryManager: EntityManager,
  ) {
    // const result = await this.albumBoardService.create(filesData, queryManager);
    return;
  }
}
