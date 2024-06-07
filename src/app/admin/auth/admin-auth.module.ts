import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Couple } from 'src/entities/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Couple])],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AuthService],
})
export class AdminAuthModule {}
