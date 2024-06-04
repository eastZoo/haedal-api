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
import { CodeDto } from './dto/code.dto';
import { InfoDto } from './dto/info.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '소셜 로그인 && 회원가입' })
  @ApiResponse({
    status: 200,
    description: '소셜 로그인 && 회원가입',
    type: Boolean,
  })
  @Post('social')
  @UseInterceptors(TransactionInterceptor)
  socialLoginRegister(
    @Body() siginUpDto: SiginUpDto,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return this.authService.socialLoginRegister(siginUpDto);
  }

  @ApiOperation({ summary: '1. 회원가입' })
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
    return this.authService.signUp(siginUpDto);
  }

  @ApiOperation({ summary: '회원가입 취소' })
  @ApiResponse({
    status: 200,
    description: '회원가입 취소',
    type: Boolean,
  })
  @Post('sign-up/cancel')
  @UseInterceptors(TransactionInterceptor)
  siginUpCancel(
    @Body() siginUpDto: SiginUpDto,
    @TransactionManager() queryManager: EntityManager,
  ) {
    return this.authService.siginUpCancel(siginUpDto.userEmail);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('sign-in')
  siginIn(@Body() siginInDto: SignInDto) {
    console.log(siginInDto);
    return this.authService.signIn(siginInDto);
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
    const { userEmail } = req.user;
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

  @ApiOperation({ summary: '2. 초대코드 연결' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('/code/connect')
  @UseGuards(AccessTokenGuard)
  onConnect(@Request() req: any, @Body() codeDto: CodeDto) {
    const { id } = req.user;
    return this.authService.onConnect(codeDto, id);
  }

  @ApiOperation({ summary: '3. 개인정보 입력 후 시작하기' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('/info/connect')
  @UseGuards(AccessTokenGuard)
  onStartConnect(@Request() req: any, @Body() infoDto: InfoDto) {
    return this.authService.onStartConnect(infoDto, req.user);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/profile')
  async getUserProfile(@Request() req: any) {
    console.log('PROFILELELELELELELL');

    const result = await this.authService.getUserProfile(req);
    console.log(result);
    return result;
  }
}
