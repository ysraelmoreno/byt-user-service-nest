import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
