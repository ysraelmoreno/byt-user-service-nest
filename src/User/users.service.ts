import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ICreateUser,
  ILoginUser,
  ILoginUserResponse,
  IUpdateUsername,
} from 'src/dto/User';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { HashService } from 'src/Hash/hash.service';
import { SessionService } from './session.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('HashService')
    private hashService: HashService,
    @Inject('SessionService')
    private sessionService: SessionService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    const usersFormatted = users.map((user) => {
      delete user.password;

      return user;
    });

    return usersFormatted;
  }

  async createUser(user: ICreateUser): Promise<User> {
    const { email, name, password } = user;

    const findByEmail = await this.findByEmail(email);

    if (findByEmail) {
      throw new HttpException('User already exists', 400);
    }

    const [salt, hashedPassword] = await this.hashService.hash(password);

    const newUser = await this.usersRepository.save({
      email,
      name,
      password: hashedPassword,
      salt,
    });

    delete newUser.password;
    delete newUser.salt;

    return newUser;
  }

  async updateUsername({ username, id }: IUpdateUsername): Promise<User> {
    const findByUsername = await this.usersRepository.findOne({
      where: { username },
    });

    const specialCharacter = `!@#$%^&*()+{}:"<>?[];'\|,./`;

    const findSpecialCharacter = [...username]
      .map((letter) => !!specialCharacter.match(letter))
      .filter((letter) => letter === true);

    if (findByUsername) {
      throw new HttpException('Username already exists', 400);
    }

    if (findSpecialCharacter.length > 0) {
      throw new HttpException(
        'Username cannot contain special characters',
        400,
      );
    }

    const findById = await this.usersRepository.findOne({ where: { id } });

    if (!findById) {
      throw new HttpException('User not found', 400);
    }

    findById.username = username;

    const updatedUser = await this.usersRepository.save(findById);

    delete updatedUser.password;
    delete updatedUser.salt;

    return updatedUser;
  }

  async getUserData(id: string): Promise<User> {
    if (!id) {
      throw new HttpException('Id is required', 400);
    }

    const user = await this.usersRepository.findOne({ where: { id } });

    delete user.password;
    delete user.salt;

    return user;
  }

  async authenticate({
    email,
    password,
  }: ILoginUser): Promise<ILoginUserResponse> {
    const findUserByEmail = await this.findByEmail(email);

    if (!findUserByEmail.id) {
      throw new HttpException('Invalid credentials', 401);
    }

    const isPasswordValid = await this.hashService.compare(
      password,
      findUserByEmail.password,
      {
        salt: findUserByEmail.salt,
      },
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    const token = await this.hashService.generateToken({
      id: findUserByEmail.id,
      email: findUserByEmail.email,
      username: findUserByEmail.username,
      name: findUserByEmail.name,
    });

    await this.hashService.decode(token);

    await this.sessionService.create({
      token,
      userId: findUserByEmail.id,
    });

    delete findUserByEmail.password;
    delete findUserByEmail.salt;

    return {
      user: findUserByEmail,
      token,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.usersRepository.findOne({ where: { email } });

    return user;
  }
}
