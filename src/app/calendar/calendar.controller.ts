import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  UseGuards,
  Query,
  UseInterceptors,
  Bind,
  UploadedFiles,
  Delete,
  Param,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { TransactionManager } from 'src/decorator/transaction-manager';
import { EntityManager } from 'typeorm';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from 'src/common/multerOptions';
import { TransactionInterceptor } from 'src/middleware/transaction.middleware';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /** 일정 생성 */
  @UseGuards(AccessTokenGuard)
  @Post('/create')
  async create(
    @Req() req: any,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return await this.calendarService.create(req, queryManager);
  }

  /** 캘린더 리스트 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getScheduleList(@Req() req: any) {
    return await this.calendarService.getScheduleList(req);
  }

  /** 캘린더 라벨 컬러 가져오기 */
  @UseGuards(AccessTokenGuard)
  @Get('/color')
  async getColorList() {
    return await this.calendarService.getColorList();
  }

  /** 근무표 사진 등록 */
  @UseGuards(AccessTokenGuard)
  @Post('/work-table/create')
  /** FilesInterceptor의 첫번째 속성 이름이 formData의 이미지가 담겨있는 key값과 같아야한다.*/
  @UseInterceptors(FilesInterceptor('images', null, multerDiskOptions))
  @UseInterceptors(TransactionInterceptor)
  @Bind(UploadedFiles())
  async addWorkTable(
    filesData: Array<Express.Multer.File>,
    @Req() req: any,
    @TransactionManager() queryManager: EntityManager,
  ) {
    console.log(filesData);
    console.log(req.body);
    const result = await this.calendarService.addWorkTable(
      filesData,
      req,
      queryManager,
    );
    return;
  }

  /** 근무표 가져오기 쿼리에따라 */
  @UseGuards(AccessTokenGuard)
  @Get('/work-table')
  async getCurrentWorkTableUrl(
    @Req() req: any,
    @Query('_month') month: string,
  ) {
    return await this.calendarService.getCurrentWorkTableUrl(month, req);
  }

  // 근무표 삭제
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  @Delete('/work-table/:id')
  async deleteWorkTable(
    @TransactionManager() queryManager: EntityManager,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const { coupleId } = req.user;

    return await this.calendarService.deleteWorkTable(
      queryManager,
      coupleId,
      id,
    );
  }
}
