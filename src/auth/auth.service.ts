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
    message?: string;
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
        message:
          '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
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

  // insertStore = async (queryManager: EntityManager, store: SiginUpDto) => {
  //   const newStore = Object.assign(new Store(), {
  //     businessAddress: store.businessAddress,
  //     businessAddressDetail: store.businessAddressDetail,
  //     businessNumber: store.businessNumber,
  //     merchantAssociationMembership: store.merchantAssociationMembership,
  //     merchantAssociationName: store.merchantAssociationName,
  //     postalCode: store.postalCode,
  //     storeName: store.storeName,
  //     storeType: store.storeType,
  //   });

  //   return await queryManager.save(Store, newStore);
  // };

  insertUser = async (user: SiginUpDto, queryManager: EntityManager) => {
    const newUser = Object.assign(new User(), {
      userEmail: user.userEmail,
      password: user.password,
      connectState: 1,
    });

    return await queryManager.save(User, newUser);
  };

  // insertMenu = async (
  //   queryManager: EntityManager,
  //   menus: Menu[],
  //   userType: string,
  //   userId: string,
  // ) => {
  //   const employeePermission = [
  //     '66a51f89-d6c9-4e4b-a596-4ea06e105b75',
  //     'ceb70c83-997f-47bd-ba6d-3a777731456d',
  //   ];

  //   await queryManager.insert(
  //     MenuPermission,
  //     menus.map((menu) => {
  //       let isApproved = true;

  //       // 유저타입이 직원일때 employeePermission제외 하고는 Permission값 false로 설정
  //       if (userType === 'employee' && !employeePermission.includes(menu.id)) {
  //         isApproved = false;
  //       }

  //       return {
  //         isApproved: isApproved,
  //         user: {
  //           id: userId,
  //         },
  //         menu: {
  //           id: menu.id,
  //         },
  //       };
  //     }),
  //   );
  // };
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
