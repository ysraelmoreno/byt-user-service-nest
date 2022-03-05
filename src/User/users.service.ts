import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateUser, ILoginUser, IUpdateUsername } from 'src/dto/User';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { hash, compare } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async createUser(user: ICreateUser): Promise<User> {
    const { email, name, password } = user;

    const findByEmail = await this.usersRepository.findOne({
      where: { email },
    });

    if (findByEmail) {
      throw new HttpException('User already exists', 400);
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await this.usersRepository.save({
      email,
      name,
      password: hashedPassword,
    });

    return newUser;
  }

  async updateUsername({ username, id }: IUpdateUsername): Promise<User> {
    const findById = await this.usersRepository.findOne({ where: { id } });
    const findByUsername = await this.usersRepository.findOne({
      where: { username },
    });

    const specialCharacter = `!@#$%^&*()_+{}:"<>?[];'\|,./`;

    const findSpecialCharacter = [...username]
      .map((letter) => !!specialCharacter.match(letter))
      .filter((letter) => letter === true);

    if (findByUsername) {
      throw new HttpException('Username already exists', 4000);
    }

    if (findSpecialCharacter.length > 0) {
      throw new HttpException(
        'Username cannot contain special characters',
        400,
      );
    }

    if (!findById) {
      throw new HttpException('User not found', 400);
    }

    const updatedUser = await this.usersRepository.save({
      username,
    });

    return updatedUser;
  }

  async login({ email, password }: ILoginUser): Promise<User> {
    const findUserByEmail = await this.usersRepository.findOne({
      where: { email },
    });

    if (!findUserByEmail) {
      throw new HttpException('User not found', 400);
    }

    const validPassword = await compare(password, findUserByEmail.password);

    if (!validPassword) {
      throw new HttpException('Invalid password', 400);
    }

    return findUserByEmail;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.usersRepository.findOne({ where: { email } });

    return user;
  }
}
