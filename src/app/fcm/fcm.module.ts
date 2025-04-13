import { Module } from '@nestjs/common';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';
import { FcmToken } from 'src/entities/fcm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FcmToken])],
  controllers: [FcmController],
  providers: [FcmService],
})
export class FcmModule {}
