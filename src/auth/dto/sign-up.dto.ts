import { ApiProperty } from '@nestjs/swagger';

export class SiginUpDto {
  @ApiProperty({ description: '아이디' })
  userEmail: string;
  @ApiProperty({ description: '비밀번호' })
  password: string;
  @ApiProperty({ description: '로그인 타입' })
  provider: string;
  @ApiProperty({ description: '소셜 아이디' })
  providerUserId: string;
}
