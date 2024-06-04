import { ApiProperty } from '@nestjs/swagger';

export class ReqUserDto {
  @ApiProperty({ description: '유저 oid' })
  id?: string;
  @ApiProperty({ description: '커플 oid' })
  coupleId?: string;
}
