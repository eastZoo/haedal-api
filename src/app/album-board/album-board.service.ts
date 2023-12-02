import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,
  ) {}

  async create(
    filesData: Express.Multer.File[],
    req: any,
    queryManager: EntityManager,
  ) {
    try {
      const post = JSON.parse(req.body.postData);
      const { id } = await queryManager.save(AlbumBoard, {
        ...post,
        lat: parseFloat(post.lat),
        lng: parseFloat(post.lng),
        userId: req.user.id,
        coupleId: req.user.coupleId,
      });

      const file = filesData.map((item) => ({ ...item, albumBoardId: id }));
      await queryManager.save(Files, file);

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async getAlbunBoardList(req: any, offset: string) {
    console.log(req.user);
    console.log(offset);

    const { coupleId } = req.user;

    const queryBuilder = this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .orderBy('album_board.createdAt', 'ASC')
      .offset(parseInt(offset))
      .limit(5);

    return await queryBuilder.getMany();

    // const { coupleId } = req.user;
    // const result = await this.albumBoardRepository.find({
    //   where: { coupleId },
    //   relations: ['user', 'files'],
    //   order: { createdAt: 'DESC' },
    // });

    // return result;
  }
}
