import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_EXPIRES = '180d'; // 6개월

export const createAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES, //토큰 유지 기간
  });
};

export const createRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '360d',
  });
};
