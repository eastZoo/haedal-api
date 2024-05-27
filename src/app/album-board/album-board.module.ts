import { Module } from '@nestjs/common';
import { AlbumBoardService } from './album-board.service';
import { AlbumBoardController } from './album-board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { AlbumBoardComment } from 'src/entities/album-board-comment.entity';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { AlarmHistoryModule } from '../alarm-history/alarm-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlbumBoard, Files, AlbumBoardComment]),
    AlarmHistoryModule,
  ],
  providers: [AlbumBoardService],
  controllers: [AlbumBoardController],
})
export class AlbumBoardModule {}
