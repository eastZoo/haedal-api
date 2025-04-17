import { Module } from '@nestjs/common';
import { AlbumBoardService } from './album-board.service';
import { AlbumBoardController } from './album-board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { AlbumBoardComment } from 'src/entities/album-board-comment.entity';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { AlarmHistoryModule } from '../alarm-history/alarm-history.module';
import { FcmToken } from 'src/entities/fcm.entity';
import { User } from 'src/entities/user.entity';
import { Couple } from 'src/entities/couple.entity';
import { FcmService } from '../fcm/fcm.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlbumBoard,
      Files,
      AlbumBoardComment,
      FcmToken,
      User,
      Couple,
    ]),
    AlarmHistoryModule,
  ],
  providers: [AlbumBoardService, FcmService],
  controllers: [AlbumBoardController],
})
export class AlbumBoardModule {}
