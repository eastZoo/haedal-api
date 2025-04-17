import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { AlbumBoard } from 'src/entities/album-board.entity';
import { Files } from 'src/entities/files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AlarmHistoryService } from '../alarm-history/alarm-history.service';
import { response } from 'express';
import { responseObj } from 'src/util/responseObj';
import { User } from 'src/entities/user.entity';
import { FcmService } from '../fcm/fcm.service';
import { FcmToken } from 'src/entities/fcm.entity';

@Injectable()
export class AlbumBoardService {
  constructor(
    @InjectRepository(AlbumBoard)
    private albumBoardRepository: Repository<AlbumBoard>,

    @InjectRepository(Files)
    private filesRepository: Repository<Files>,
    private readonly alarmHistoryService: AlarmHistoryService,
    private readonly dataSource: DataSource,
    private readonly fcmService: FcmService,
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
  ) {}

  async create(filesData: Express.Multer.File[], req: any) {
    const { coupleId, id: userId } = req.user;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = JSON.parse(req.body.postData);

      // 앨범 보드 저장
      const albumBoard = await queryRunner.manager.save(AlbumBoard, {
        ...post,
        lat: parseFloat(post.lat),
        lng: parseFloat(post.lng),
        userId: userId,
        coupleId: coupleId,
      });

      // 파일 저장
      const file = filesData.map((item) => ({
        ...item,
        albumBoardId: albumBoard.id,
        coupleId: coupleId,
      }));
      await queryRunner.manager.save(Files, file);

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

      // 본인 알람 읽음 처리
      await this.alarmHistoryService.addMyAlarmReadStatus(id, userId);

      // 상대방 찾기
      const partner = await queryRunner.manager.findOne(User, {
        where: {
          coupleId: coupleId,
          id: Not(userId),
        },
      });

      await queryRunner.commitTransaction();

      // 트랜잭션 완료 후 푸시 알림 전송
      if (partner) {
        const partnerFcmTokens = await this.fcmTokenRepository.find({
          where: { userId: partner.id },
        });

        for (const tokenData of partnerFcmTokens) {
          await this.fcmService.sendPushNotification({
            fcmToken: tokenData.fcmToken,
            title: '새로운 앨범이 등록되었습니다',
            body: `${post.title}`,
          });
        }
      }

      return responseObj.success();
    } catch (error) {
      await queryRunner.rollbackTransaction();
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
