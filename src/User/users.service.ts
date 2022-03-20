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
    const findByUsername = await this.usersRepository.findOne({
      where: { username },
    });

    const specialCharacter = `!@#$%^&*()_+{}:"<>?[];'\|,./`;

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
