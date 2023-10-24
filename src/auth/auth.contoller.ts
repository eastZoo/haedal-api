import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @ApiOperation({ summary: '회원가입' })
  // @ApiResponse({
  //   status: 200,
  //   description: '회원가입',
  //   type: Boolean,
  // })
  // @Post('sign-up')
  // @UseInterceptors(TransactionInterceptor)
  // siginUp(
  //   @Body() siginUpDto: SiginUpDto,
  //   @TransactionManager() queryManager: EntityManager,
  // ) {
  //   return this.authService.signUp(siginUpDto, queryManager);
  // }

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
}
