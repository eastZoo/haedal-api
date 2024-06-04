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
  @ApiProperty({ description: '성별' })
  sex?: string;
  @ApiProperty({ description: '생년월일' })
  birth?: string;
  @ApiProperty({ description: '이름' })
  name?: string;
  @ApiProperty({ description: '프로필 url 주소' })
  profileUrl?: string;
}
