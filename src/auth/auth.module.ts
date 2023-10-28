import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.contoller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Couple } from 'src/entities/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Couple])],
  providers: [
    LocalStrategy,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthService,
  ],
  controllers: [AuthController],
  // exports: [TypeOrmModule],
})
export class AuthModule {}
