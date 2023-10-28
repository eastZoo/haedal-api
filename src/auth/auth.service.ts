import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';

import { SiginUpDto } from './dto/sign-up.dto';
import { EntityManager, Repository } from 'typeorm';
import { Couple } from 'src/entities/couple.entity';

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
   * @param {string} userEmail 아이디
   * @param {string} password 비밀번호
   * @returns {{ accessToken: string; refreshToken: string }} 유저정보
   */
  async signIn(
    userEmail: string,
    password: string,
  ): Promise<{
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }> {
    const user = await this.validateUser({ userEmail, password });

    if (!user) {
      return {
        success: false,
        message:
          '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
      };
    }

    const payload = {
      userEmail: user.id,
      userName: user.name,
      id: user.id,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);
    delete user.password;

    return { success: true, accessToken, refreshToken, user };
  }

  /** 회원가입 및 로그인  */
  async signUp(siginUpDto: SiginUpDto, queryManager: EntityManager) {
    const user = await this.insertUser(siginUpDto, queryManager);

    console.log('user : ', user);
    // 승인 코드 생성
    const code = Math.floor(Math.random() * 89999999) + 10000000;
    await this.coupleRepository.save({
      myId: user.id,
      code: code,
    });

    const payload = {
      userEmail: siginUpDto.userEmail,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    return { success: true, accessToken, refreshToken };
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

  async getConnectState(userEmail: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userEmail },
      });

      console.log(user);
      console.log(user.connectState);
      return user.connectState;
    } catch (e: any) {
      throw new HttpException(e.response, 500);
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
