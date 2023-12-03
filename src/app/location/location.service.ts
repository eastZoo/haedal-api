import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,
  ) {}

  async userLocation(coupleId: string) {
    return this.albumBoardRepository.find({
      where: [
        {
          coupleId: coupleId,
        },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
