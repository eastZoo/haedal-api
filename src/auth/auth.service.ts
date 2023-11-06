import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';

import { SiginUpDto } from './dto/sign-up.dto';
import { EntityManager, Repository } from 'typeorm';
import { Couple } from 'src/entities/couple.entity';
import { SignInDto } from './dto/sign-in.dto';
import { CodeDto } from './dto/code.dto';
import { InfoDto } from './dto/info.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
  ) {}

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
  async signUp(siginUpDto: SiginUpDto, queryManager: EntityManager) {
    const user = await this.insertUser(siginUpDto, queryManager);
    // 승인 코드 생성
    const code = Math.floor(Math.random() * 89999999) + 10000000;
    await this.coupleRepository.save({
      myId: user.id,
      code: code,
    });

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
      return user.connectState || 0;
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
  }> {
    try {
      const { code } = codeDto;
      const couple = await this.coupleRepository.findOne({
        where: { code: code },
      });

      console.log('couple  : ', couple);
      console.log('My id  : ', id);

      if (code !== null) {
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

  insertUser = async (user: SiginUpDto, queryManager: EntityManager) => {
    const newUser = Object.assign(new User(), {
      userEmail: user.userEmail,
      password: user.password,
      connectState: 1,
    });

    return await queryManager.save(User, newUser);
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
