import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoCategory } from 'src/entities/memo-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemoCategory])],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
