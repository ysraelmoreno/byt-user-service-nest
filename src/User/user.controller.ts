import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ICreateUser,
  ILoginUser,
  ILoginUserResponse,
  IUpdateUsername,
} from 'src/dto/User';
import { HashService } from 'src/Hash/hash.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    @Inject('HashService')
    private readonly hashService: HashService,
  ) {}

  @Get()
  @HttpCode(200)
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/me')
  @HttpCode(200)
  async getUserData(@Req() request: Request): Promise<User> {
    const [, token] = request.headers.authorization.split(' ');

    const { id } = await this.hashService.decryptToken(token);

    if (!id) {
      throw new HttpException('Id is required', 400);
    }

    const user = await this.userService.getUserData(id);

    return user;
  }

  @Post('/login')
  @HttpCode(200)
  async authenticate(
    @Body() { email, password }: ILoginUser,
  ): Promise<ILoginUserResponse> {
    try {
      if (!email || !password) {
        throw new HttpException('Email and password are required', 400);
      }

      const user = await this.userService.authenticate({ email, password });

      return user;
    } catch {
      throw new HttpException('Invalid credentials', 401);
    }
  }

  @Post()
  async create(@Body() { email, name, password }: ICreateUser): Promise<User> {
    if (!email || !password) {
      throw new HttpException('Email and password are required', 400);
    }

    const user = this.userService.createUser({ email, name, password });

    return user;
  }

  @Patch('update/username/:id')
  @HttpCode(200)
  async updateUsername(
    @Body() { username }: Omit<IUpdateUsername, 'id'>,
    @Param() { id }: Omit<IUpdateUsername, 'username'>,
  ): Promise<User> {
    if (!username || !id) {
      throw new HttpException('Username and id are required', 400);
    }

    const user = await this.userService.updateUsername({
      username,
      id,
    });

    return user;
  }
}
