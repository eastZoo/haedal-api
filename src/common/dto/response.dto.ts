import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = undefined> {
  @ApiProperty({ type: Boolean, description: '성공여부' })
  readonly success: boolean;

  @ApiProperty({ type: String, description: '실패시 메세지', required: false })
  readonly message?: string;

  @ApiProperty({
    type: 'generic',
    required: false,
  })
  data?: T;
}
