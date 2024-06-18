import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { SignInDto } from 'src/auth/dto/sign-in.dto';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  /**
   * 로그인
   * @param {SignInDto} siginInDto 아이디, 비밀번호
   * @returns {{ accessToken: string; refreshToken: string }} 유저정보
   */
  async signIn(siginInDto: SignInDto): Promise<{
    success: boolean;
    msg?: string;
    data?: {
      accessToken?: string;
      refreshToken?: string;
      user?: User;
      connectState?: number;
    };
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userEmail, password } = siginInDto;
      const user = await this.validateUser({ userEmail, password });

      if (!user) {
        return {
          success: false,
          msg: '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
        };
      }
      const payload = {
        userEmail: user.userEmail,
        id: user.id,
      };
      const accessToken = this.authService.createAccessToken(payload);
      const refreshToken = this.authService.createRefreshToken(payload);

      await queryRunner.commitTransaction();
      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return { success: false, msg: e.response };
    } finally {
      await queryRunner.release();
    }
  }

  public async validateUser({
    userEmail,
    password,
  }: {
    userEmail: string;
    password: string;
  }) {
    try {
      const user = await this.userRepository.findOne({
        where: { userEmail, provider: 'developer' },
      });

      console.log(user, 'user');

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (e) {
      throw new HttpException('서버요청 에러!', 500);
    }
  }
}
