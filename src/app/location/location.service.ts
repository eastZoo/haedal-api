import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { responseObj } from 'src/util/responseObj';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,
  ) {}

  async userLocation(coupleId: string) {
    try {
      const result = await this.albumBoardRepository
        .createQueryBuilder('album_board')
        .leftJoinAndSelect('album_board.user', 'user')
        .leftJoinAndSelect('album_board.files', 'files')
        .where('album_board.couple_id = :coupleId', { coupleId })
        .andWhere('album_board.lat != 0')
        .andWhere('album_board.lng != 0')
        .orderBy('album_board.createdAt', 'ASC')
        .getMany();

      console.log('result : ', result);
      return responseObj.success(result);
    } catch (error) {
      return responseObj.error('위치 정보 조회에 실패했습니다.');
    }
  }
}
