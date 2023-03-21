import { Injectable } from '@nestjs/common';
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';

import { sign, verify } from 'jsonwebtoken';
import auth from 'src/config/auth';

interface ICompareOptions {
  salt: string;
}

@Injectable()
export class HashService {
  // eslint-disable-next-line
  constructor() {}

  async hash(data: string): Promise<string[]> {
    const salt = randomBytes(16).toString();

    const hashedData = scryptSync(data, salt, 64).toString('hex');

    return [salt, hashedData];
  }

  async decode(token: string) {
    try {
      const tokenDecoded = await verify(token, auth.jwt.secret, {
        algorithms: ['HS256'],
      });

      return tokenDecoded;
    } catch (err) {
      console.log(err);
    }
  }

  async generateToken(info: any): Promise<string> {
    return sign(info, auth.jwt.secret, { algorithm: 'HS256' });
  }

  async decryptToken(token: string) {
    try {
      const decoded = await verify(token, auth.jwt.secret, {
        algorithms: ['HS256'],
      });

      return decoded;
    } catch (err) {
      throw new Error(err);
    }
  }

  async compare(
    comparedData: string,
    dataToBeCompared: string,
    { salt }: ICompareOptions,
  ) {
    const hashedBuffer = scryptSync(comparedData, salt, 64);

    const dataBuffer = Buffer.from(dataToBeCompared, 'hex');

    const match = timingSafeEqual(hashedBuffer, dataBuffer);

    return match;
  }
}
