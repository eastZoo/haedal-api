import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { response } from 'express';
import { responseObj } from 'src/util/responseObj';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,

    @InjectRepository(Files)
    private filesRepository: Repository<Files>,
    private readonly alarmHistoryService: AlarmHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(filesData: Express.Multer.File[], req: any) {
    const { coupleId, id: userId } = req.user;

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
        userId: userId,
        coupleId: coupleId,
      });
      const file = filesData.map((item) => ({
        ...item,
        albumBoardId: albumBoard.id,
        coupleId: coupleId,
      }));
      await this.filesRepository.save(file);
      // await queryManager.save(Files, file);

      // 알람 히스토리 저장
      const {
        data: { id },
      } = await this.alarmHistoryService.addAlarmHistory(
        albumBoard.id,
        userId,
        coupleId,
        'albumboard',
        'create',
        filesData.length,
        post.title,
      );
      // 본인 알람은 자동으로 읽음 처리
      await this.alarmHistoryService.addMyAlarmReadStatus(id, userId);

      await queryRunner.commitTransaction();
      return responseObj.success();
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
      .andWhere('album_board.isDeleted = false')
      .getMany();

    const data = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .andWhere('album_board.isDeleted = false')
      .orderBy('album_board.storyDate', 'DESC')
      .skip(parseInt(offset)) // Calculate the number of items to skip
      .take(LIMIT) // Se
      .getMany();

    return responseObj.success({ appendData: data, total: total.length });
    // return { appendData: data, total: total.length };
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
      .andWhere('album_board.isDeleted = false')
      .getMany();

    const data = await this.albumBoardRepository
      .createQueryBuilder('album_board')
      .leftJoinAndSelect('album_board.user', 'user')
      .leftJoinAndSelect('album_board.files', 'files')
      .where('album_board.couple_id = :coupleId', { coupleId })
      .andWhere('album_board.category = :category', { category })
      .andWhere('album_board.isDeleted = false')
      .orderBy('album_board.storyDate', 'DESC')
      .skip(parseInt(offset)) // Calculate the number of items to skip
      .take(LIMIT) // Se
      .getMany();

    return responseObj.success({ appendData: data, total: total.length });
  }

  async deleteAlbumBoard(
    queryManager: EntityManager,
    req: any,
    boardId: string,
  ) {
    const { coupleId, id: userId } = req.user;
    try {
      // 삭제가 아닌 isDeleted를 true로 변경
      await queryManager.update(
        Files,
        {
          albumBoardId: boardId,
          coupleId: coupleId,
        },
        { isDeleted: true },
      );
      // 삭제가 아닌 isDeleted를 true로 변경
      await queryManager.update(
        AlbumBoard,
        {
          id: boardId,
          coupleId: coupleId,
        },
        { isDeleted: true },
      );

      return { success: true, message: '삭제 성공' };
    } catch (e) {
      return { success: false, message: '삭제 실패' };
    }
  }
}
