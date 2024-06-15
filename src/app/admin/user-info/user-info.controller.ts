import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('admin-user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  /** 관리자 페이지에서 유저 정보 획득 */
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '관리자 유저들 정보 획득' })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Get('/')
  getUsersInfo() {
    return this.userInfoService.getUsersInfo();
  }
}
