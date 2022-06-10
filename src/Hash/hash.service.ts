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
    const splitToken = token.split('.');

    const payload = JSON.parse(
      Buffer.from(splitToken[1], 'base64url').toString(),
    );

    const signatureToBeCompared = createHmac('SHA256', auth.jwt.secret)
      .update(`${splitToken[0]}.${splitToken[1]}.${auth.jwt.secret}`)
      .digest('hex');

    const isNotManipulated = timingSafeEqual(
      Buffer.from(signatureToBeCompared),
      Buffer.from(splitToken[2]),
    );

    if (isNotManipulated) {
      return false;
    } else {
      return payload;
    }
  }

  async generateToken(info: any): Promise<string> {
    const hmac = createHmac('SHA256', auth.jwt.secret);

    const tokenHeader = Buffer.from(
      JSON.stringify({
        alg: 'SHA256',
        typ: 'JWT',
      }),
    ).toString('base64url');

    const tokenPayload = Buffer.from(
      JSON.stringify({
        ...info,
        iat: new Date().getTime(),
        exp: new Date().getTime() + auth.jwt.expiresIn,
      }),
    ).toString('base64url');

    const tokenSignature = hmac
      .update(`${tokenHeader}.${tokenPayload}.${auth.jwt.secret}`)
      .digest('hex');

    return `${tokenHeader}.${tokenPayload}.${tokenSignature}`;
  }

  async decryptToken(token: string) {
    try {
      const decoded = await verify(token, auth.jwt.secret, {
        algorithms: ['SHA256'],
      });

      return decoded;
    } catch (err) {
      throw new Error('Invalid token');
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
