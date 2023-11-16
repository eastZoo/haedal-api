import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,
  ) {}

  async createAlbumBoard(
    filesData: Express.Multer.File[],
    post: any,
    queryManager: EntityManager,
  ) {
    try {
      console.log(filesData);
      console.log(post);
      const { id } = await queryManager.save(AlbumBoard, {
        ...post,
      });

      const file = filesData.map((item) => ({ ...item, postId: id }));
      console.log(file);
      await queryManager.save(Files, file);

      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false, message: e };
    }
  }
}
