import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from 'src/util/env.validation';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { User } from './entities/user.entity';
import { AuthController } from './auth/auth.contoller';

import { AlbumBoardModule } from './app/album-board/album-board.module';
import { CalendarModule } from './app/calendar/calendar.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { LocationModule } from './app/location/location.module';
import { MemoModule } from './app/memo/memo.module';
import { AlarmHistoryModule } from './app/alarm-history/alarm-history.module';
import { AuthModule } from './auth/auth.module';
import { AdminAuthModule } from './app/admin/auth/admin-auth.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, __dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
      logging: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    AdminAuthModule,
    AlbumBoardModule,
    CalendarModule,
    LocationModule,
    MemoModule,
    AlarmHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
