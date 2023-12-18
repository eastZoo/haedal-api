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

      const file = filesData.map((item) => ({
        ...item,
        albumBoardId: id,
        coupleId: req.user.coupleId,
      }));
      await queryManager.save(Files, file);

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    }
  }

  async getAlbumBoardList(req: any, offset: string) {
    const LIMIT = 15;
    console.log(req.user);
    console.log(offset);

    const { coupleId } = req.user;

    const total = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .getMany();

    const data = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .orderBy('album_board.storyDate', 'DESC')
      .skip(parseInt(offset)) // Calculate the number of items to skip
      .take(LIMIT) // Se
      .getMany();

    return { appendData: data, total: total.length };

    // const { coupleId } = req.user;
    // const result = await this.albumBoardRepository.find({
    //   where: { coupleId },
    //   relations: ['user', 'files'],
    //   order: { createdAt: 'DESC' },
    // });

    // return result;
  }

  async getCategoryAlbumBoardList(req: any, offset: string, category: string) {
    const LIMIT = 5;
    console.log(req.user);
    console.log(offset);
    console.log(category);
    const { coupleId } = req.user;

    const total = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .andWhere('album_board.category = :category', { category })
      .getMany();

    const data = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .andWhere('album_board.category = :category', { category })
      .orderBy('album_board.storyDate', 'DESC')
      .skip(parseInt(offset)) // Calculate the number of items to skip
      .take(LIMIT) // Se
      .getMany();

    return { appendData: data, total: total.length };
  }

  async deleteAlbumBoard(
    queryManager: EntityManager,
    coupleId: string,
    boardId: string,
  ) {
    try {
      console.log('HERE');
      console.log(coupleId);
      console.log(coupleId);

      await queryManager.delete(Files, {
        albumBoardId: boardId,
        coupleId: coupleId,
      });
      await queryManager.delete(AlbumBoard, {
        id: boardId,
        coupleId: coupleId,
      });

      return { success: true, message: '삭제 성공' };
    } catch (e) {
      return { success: false, message: '삭제 실패' };
    }
  }
}
