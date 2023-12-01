import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private anavadaRepository: Repository<AlbumBoard>,
  ) {}

  async create(filesData: any, queryManager: EntityManager) {
    try {
      console.log(filesData);

      //   const { id } = await queryManager.save(AlbumBoard, {
      //     ...post,
      //   });

      //   const file = filesData.map((item) => ({ ...item, postId: id }));
      //   console.log(file);
      //   await queryManager.save(Files, file);

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('사진을 인식하지 못했습니다.', 500);
    }
  }
}
