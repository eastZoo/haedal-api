import { Module } from '@nestjs/common';
import { AlbumBoardService } from './album-board.service';
import { AlbumBoardController } from './album-board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { AlbumBoardComment } from 'src/entities/album-board-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlbumBoard, Files, AlbumBoardComment])],
  providers: [AlbumBoardService],
  controllers: [AlbumBoardController],
})
export class AlbumBoardModule {}
