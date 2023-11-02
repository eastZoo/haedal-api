import { ApiProperty } from '@nestjs/swagger';

export class CodeDto {
  @ApiProperty({ description: '초대코드' })
  code: number;
}
