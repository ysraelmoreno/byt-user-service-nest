import { Injectable } from '@nestjs/common';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

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

  async generateToken(info: any, options?: any): Promise<string> {
    const token: string = await sign({ ...info }, auth.jwt.secret, {
      ...options,
      expiresIn: auth.jwt.expiresIn,
      algorithm: 'HS512',
    });

    return token;
  }

  async decryptToken(token: string) {
    try {
      const decoded = await verify(token, auth.jwt.secret, {
        algorithms: ['HS512'],
      });

      return decoded;
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  async compare(
    password: string,
    databasePassword: string,
    { salt }: ICompareOptions,
  ) {
    const hashedBuffer = scryptSync(password, salt, 64);

    const passwordBuffer = Buffer.from(databasePassword, 'hex');

    const match = timingSafeEqual(hashedBuffer, passwordBuffer);

    return match;
  }
}
