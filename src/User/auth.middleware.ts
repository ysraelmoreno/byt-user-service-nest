import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { verify } from 'jsonwebtoken';
import auth from 'src/config/auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const [, token] = req.headers.authorization.split(' ');

      try {
        verify(token, auth.jwt.secret, {
          algorithms: ['HS256'],
        });

        return next();
      } catch (err) {
        throw new HttpException('Invalid JWT token', 401);
      }
    }

    throw new HttpException('Unauthorized', 401);
  }
}
