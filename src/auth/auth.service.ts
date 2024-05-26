import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';

import { SiginUpDto } from './dto/sign-up.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Couple } from 'src/entities/couple.entity';
import { SignInDto } from './dto/sign-in.dto';
import { CodeDto } from './dto/code.dto';
import { InfoDto } from './dto/info.dto';
import { socialUserDto } from './dto/social-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    private readonly dataSource: DataSource,
  ) {}

  /** 소셜 유저 회원가입 및 로그인  */
  async socialLoginRegister(socialUser: socialUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userEmail, provider, providerUserId } = socialUser;
      const user = await this.validateSocialUser({
        provider,
        providerUserId,
        userEmail,
      });

      Logger.log('user  @@@@@@@@@@@:', user);

      if (user) {
        Logger.log('소설 로그인 성공!!');
        const payload = {
          userEmail: user.userEmail,
          id: user.id,
        };
        const accessToken = this.createAccessToken(payload);
        const refreshToken = this.createRefreshToken(payload);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return {
          success: true,
          accessToken,
          refreshToken,
          connectState: user.connectState,
        };
      } else {
        Logger.log('소설 회원가입 성공!!');
        // 소셜 로그인 정보가 없다면 회원가입
        const user = await this.insertUser(socialUser, queryRunner.manager);
        // 승인 코드 생성
        const code = Math.floor(Math.random() * 89999999) + 10000000;
        await queryRunner.manager.save(Couple, {
          myId: user.id,
          code: code,
        });

        const payload = {
          userEmail: user.userEmail,
          id: user.id,
        };
        const accessToken = this.createAccessToken(payload);
        const refreshToken = this.createRefreshToken(payload);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return {
          success: true,
          accessToken,
          refreshToken,
          connectState: user.connectState,
        };
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return { success: false, msg: e.response };
    }
  }

  /**
   * 로그인
   * @param {SignInDto} siginInDto 아이디, 비밀번호
   * @returns {{ accessToken: string; refreshToken: string }} 유저정보
   */
  async signIn(siginInDto: SignInDto): Promise<{
    success: boolean;
    msg?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    connectState?: number;
  }> {
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
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    return {
      success: true,
      accessToken,
      refreshToken,
      connectState: user.connectState,
    };
  }

  /** 회원가입 및 로그인  */
  async signUp(siginUpDto: SiginUpDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.insertUser(siginUpDto, queryRunner.manager);

      console.log('user : ', user);
      const code = Math.floor(Math.random() * 89999999) + 10000000;
      await queryRunner.manager.save(Couple, {
        myId: user.id,
        code: code,
      });

      const payload = {
        userEmail: user.userEmail,
        id: user.id,
      };
      const accessToken = this.createAccessToken(payload);
      const refreshToken = this.createRefreshToken(payload);

      await queryRunner.commitTransaction();
      return {
        success: true,
        accessToken,
        refreshToken,
        connectState: user.connectState,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return { success: false, msg: e.response };
    } finally {
      await queryRunner.release();
    }
  }

  async siginUpCancel(userEmail: string) {
    try {
      const userId = await this.userRepository.findOne({
        where: { userEmail },
      });
      await this.userRepository.delete({
        userEmail: userEmail,
      });
      await this.coupleRepository.delete({
        myId: userId.id,
      });

      return { success: true, msg: '회원가입 삭제 완료' };
    } catch (e: any) {
      return { success: false, msg: e.response };
    }
  }

  /** userId 존재 유무 판별 */
  async findById(userEmail: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userEmail },
      });
      if (user === null) {
        return false;
      } else {
        return true;
      }
    } catch (e: any) {
      throw new HttpException(e.response, 500);
    }
  }

  // 회원가입 연결 진행상태값 얻기(1: 승인코드 미입력 , 2:개인정보 미입력, 3:모두입력)
  async getConnectState(userEmail: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userEmail },
      });
      console.log(user);
      return user === null ? false : user.connectState;
    } catch (e: any) {
      throw new HttpException(e.response, 500);
    }
  }

  // 회원가입시 초대코드 정보(코드, 시간 ) 얻기
  async getAccessCodeInfo(id: string) {
    try {
      const code = await this.coupleRepository.findOne({
        where: { myId: id },
      });
      console.log('code   :', code);
      return code;
    } catch (e: any) {
      throw new HttpException(e.response, 500);
    }
  }

  // 초대코드 재설정(24시간 주기)
  async refreshInviteCode(id: string) {
    try {
      const code = await this.coupleRepository.findOne({
        where: { myId: id },
      });
      await this.generateUniqueInviteCode(code.id);

      return code;
    } catch (e: any) {
      throw new HttpException(e.response, 500);
    }
  }

  // 초대코드 디비와 겹치지않게 생성
  async generateUniqueInviteCode(id: string) {
    while (true) {
      const randomCode = Math.floor(Math.random() * 89999999) + 10000000;
      const code = await this.coupleRepository.findOne({
        where: { code: randomCode },
      });

      if (code === null) {
        const existingRecord = await this.coupleRepository.update(
          { id: id },
          { code: randomCode },
        );
      }
    }
  }

  /**
   * 초대코드 연결
   * @param {CodeDto} codeDto 초대코드
   * @param {string} id 로그인 유저의 id(uuid)
   * @returns {{ success?: boolean; msg?: string }} 유저정보
   */
  async onConnect(
    codeDto: CodeDto,
    id: string,
  ): Promise<{
    success: boolean;
    msg?: string;
    connectState?: number;
  }> {
    try {
      const { code } = codeDto;
      const couple = await this.coupleRepository.findOne({
        where: { code: code },
      });

      console.log('couple  : ', couple);
      console.log('My id  : ', id);

      if (couple !== null) {
        // 커플 매칭 테이블 연결
        await this.coupleRepository.update(
          { myId: couple.myId },
          { partnerId: id },
        );
        // DELETE 초대코드 입력한 사람(나)도 couple 테이블에 초대코드 만들었던 흔적이 있다면 삭제
        await this.coupleRepository.delete({ myId: id });

        // 내 정보에 연결 상태 업데이트
        await this.userRepository.update(
          { id: id },
          { connectState: 2, coupleId: couple.id },
        );
        // 상대방 정보 연결상태 업데이트
        await this.userRepository.update(
          { id: couple.myId },
          { connectState: 2, coupleId: couple.id },
        );
        return {
          success: true,
          connectState: 2,
        };
      }
      // 코드가 존재 하지 않을 때
      return { success: false, msg: '입력하신 코드가 존재하지 않습니다.' };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  }

  /** 개인정보 입력 후 시작하기 */
  async onStartConnect(infoDto: InfoDto, id: string) {
    try {
      console.log('infoDto : ', infoDto);
      await this.userRepository.update(
        { id: id },
        { ...infoDto, connectState: 3 },
      );

      return { success: true, connectState: '3' };
    } catch (e) {
      return { success: false, msg: e.response };
    }
  }

  // 유저 정보 가져오기
  async getUserProfile(id: string) {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  /** 소셜 유저 존재 여부 확인 */
  async validateSocialUser(socialUser: socialUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          provider: socialUser.provider,
          providerUserId: socialUser.providerUserId,
          userEmail: socialUser.userEmail,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (e) {
      throw new HttpException('서버요청 에러!', 500);
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
        where: { userEmail },
      });

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

  async getCoupleId(userId: string) {
    return this.coupleRepository.findOne({
      select: ['id'],
      where: [{ myId: userId }, { partnerId: userId }],
    });
  }

  insertUser = async (
    user: SiginUpDto | socialUserDto,
    queryManager: EntityManager,
  ) => {
    try {
      const newUser = Object.assign(new User(), {
        userEmail: user.userEmail,
        password:
          user.provider != 'email'
            ? null
            : await bcrypt.hash(user.password, 10), // email이 아닐경우 비밀번호 null 소셜인증으로 이미 인증된 사용자임을 확인
        provider: user.provider,
        connectState: 1, // 회원가입 1단계 승인코드
        providerUserId: user.providerUserId ?? null, // 소설고유 아이디
      });

      console.log('newUser : ', newUser);
      return await queryManager.save(User, newUser);
    } catch (e) {
      console.log('error : ', e);
      throw new Error('Failed to insert user');
    }
  };

  createAccessToken = (payload: any) => {
    const ACCESS_TOKEN_EXPIRES = '180d'; //6개월
    const jwtSecretKey = this.configService.get('JWT_SECRET');

    return jwt.sign(payload, jwtSecretKey, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
  };

  createRefreshToken = (payload: any) => {
    const REFRESH_TOKEN_EXPIRES = '360d'; //1년
    const jwtRefreshSecretKey = this.configService.get('JWT_REFRESH_SECRET');

    return jwt.sign(payload, jwtRefreshSecretKey, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });
  };
}
