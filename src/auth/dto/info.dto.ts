import { ApiProperty } from '@nestjs/swagger';

export class InfoDto {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '성별' })
  sex: string;

  @ApiProperty({ description: '생일' })
  birth: string;

  @ApiProperty({ description: '처음 만난날' })
  firstDay: string;
}
