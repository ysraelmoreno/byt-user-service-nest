import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Session } from './session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async findAll(): Promise<Session[]> {
    const users = await this.sessionRepository.find();

    return users;
  }

  async create(session: { userId: string; token: string }): Promise<Session> {
    const findSession = await this.sessionRepository.find({
      where: {
        userId: session.userId,
      },
    });

    if (findSession.length > 0) {
      await this.sessionRepository.delete({
        userId: session.userId,
      });
    }

    const newSession = await this.sessionRepository.save(session);

    return newSession;
  }
}
