import { ApiProperty } from '@nestjs/swagger';

export class SiginUpDto {
  @ApiProperty({ description: '아이디' })
  userEmail: string;
  @ApiProperty({ description: '비밀번호' })
  password: string;
}
