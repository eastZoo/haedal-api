import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,
    @InjectRepository(Files)
    private filesRepository: Repository<Files>,
    private readonly dataSource: DataSource,
  ) {}

  async create(filesData: Express.Multer.File[], req: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // 트랜잭션 시작
    await queryRunner.startTransaction();
    try {
      const post = JSON.parse(req.body.postData);

      const albumBoard = await this.albumBoardRepository.save({
        ...post,
        lat: parseFloat(post.lat),
        lng: parseFloat(post.lng),
        userId: req.user.id,
        coupleId: req.user.coupleId,
      });

      console.log('!!!!', albumBoard);
      console.log('!!!!', albumBoard.id);
      const file = filesData.map((item) => ({
        ...item,
        albumBoardId: albumBoard.id,
        coupleId: req.user.coupleId,
      }));
      await this.filesRepository.save(file);
      // await queryManager.save(Files, file);
      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('저장에 실패했습니다.', 500);
    } finally {
      await queryRunner.release();
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
