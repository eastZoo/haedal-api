import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const coupleId = await this.authService.getCoupleId(payload.id);
    console.log('coupleId   : ', coupleId);
    // console.log('coupleId[0].id   : ', coupleId[0].id);
    return {
      id: payload.id,
      userEmail: payload.userEmail,
      coupleId: coupleId.id || null,
    };
  }
}
