import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 로그인
   * @param {string} userId 아이디
   * @param {string} password 비밀번호
   * @returns {{ accessToken: string; refreshToken: string }} 유저정보
   */
  async signIn(
    userId: string,
    password: string,
  ): Promise<{
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }> {
    const user = await this.validateUser({ userId, password });

    if (!user) {
      return {
        success: false,
        message:
          '아이디 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.',
      };
    }

    const payload = {
      userId: user.userId,
      userName: user.name,
      id: user.id,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);
    delete user.password;

    return { success: true, accessToken, refreshToken, user };
  }

  public async validateUser({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
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

  // insertUser = async (
  //   queryManager: EntityManager,
  //   user: SiginUpDto,
  //   storeId: string,
  // ) => {
  //   const newUser = Object.assign(new User(), {
  //     name: user.name,
  //     userId: user.userId,
  //     password: user.password,
  //     phoneNumber: user.phoneNumber,
  //     userType: user.userType,
  //     storeId: storeId,
  //     approvalStatus: user.userType === 'ceo' ? 'approved' : undefined,
  //   });

  //   return await queryManager.save(User, newUser);
  // };

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
