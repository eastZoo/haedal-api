import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 관리자 페이지에서 유저정보 획득
   */
  async getUsersInfo(): Promise<{}> {
    try {
      const result = await this.userRepository.find({
        order: { connectState: 'DESC' },
      });

      return { success: true, data: result };
    } catch (e) {
      return { success: false, msg: e.response };
    }
  }
}
