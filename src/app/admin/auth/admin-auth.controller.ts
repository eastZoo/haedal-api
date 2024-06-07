import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInDto } from 'src/auth/dto/sign-in.dto';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  /** 관리자 구역 */

  @ApiOperation({ summary: '관리자 로그인' })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  @Post('/sign-in')
  adminiginIn(@Body() siginInDto: SignInDto) {
    console.log(siginInDto);
    return this.adminAuthService.signIn(siginInDto);
  }
}
