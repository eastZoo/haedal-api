import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlbumBoard])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
