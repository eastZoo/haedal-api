import { Module } from '@nestjs/common';
import { AlbumBoardController } from './album-board.controller';
import { AlbumBoardService } from './album-board.service';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AlbumBoard])],
  controllers: [AlbumBoardController],
  providers: [AlbumBoardService],
})
export class AlbumBoardModule {}
