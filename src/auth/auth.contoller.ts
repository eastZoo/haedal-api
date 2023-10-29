import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { SiginUpDto } from './dto/sign-up.dto';
import { TransactionManager } from 'src/decorator/transaction-manager';
import { EntityManager } from 'typeorm';
import { TransactionInterceptor } from 'src/middleware/transaction.middleware';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 200,
    description: '회원가입',
    type: Boolean,
  })
  @Post('sign-up')
  @UseInterceptors(TransactionInterceptor)
  siginUp(
    @Body() siginUpDto: SiginUpDto,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return this.authService.signUp(siginUpDto, queryManager);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('sign-in')
  siginIn(@Body() siginInDto: SignInDto) {
    const { userId, password } = siginInDto;
    return this.authService.signIn(userId, password);
  }

  @ApiOperation({ summary: '아이디 중복 체크(회원가입 시)' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Get('/check-id/:userEmail')
  findById(@Param('userEmail') userEmail: string) {
    return this.authService.findById(userEmail);
  }

  @ApiOperation({ summary: '회원가입 연결 진행상태값 얻기' })
  @ApiResponse({
    status: 200,
    type: Number,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/check-state')
  getConnectState(@Request() req: any) {
    console.log(req.user);

    const { userEmail } = req.user;
    console.log('userEmail  :', userEmail);
    return this.authService.getConnectState(userEmail);
  }

  @ApiOperation({ summary: '초대코드 얻기' })
  @ApiResponse({
    status: 200,
    type: Number,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/invite-code')
  getAccessCodeInfo(@Request() req: any) {
    const { id } = req.user;

    console.log('@@@@@@@@@@@@@@@@@@@@@', id);
    return this.authService.getAccessCodeInfo(id);
  }

  @ApiOperation({ summary: '초대코드 재설정(24시간 주기)' })
  @ApiResponse({
    status: 200,
    type: Number,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/invite-code/refresh')
  refreshInviteCode(@Request() req: any) {
    const { id } = req.user;
    return this.authService.refreshInviteCode(id);
  }
}
