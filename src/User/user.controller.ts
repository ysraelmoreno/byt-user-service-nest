import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { ICreateUser, IUpdateUsername } from 'src/dto/User';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() { email, name, password }: ICreateUser): Promise<User> {
    if (!email || !password) {
      throw new HttpException('Email and password are required', 400);
    }

    const user = this.userService.createUser({ email, name, password });

    return user;
  }

  @Post('update/username/:id')
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

  @Post('login')
  async login(@Body() { email, password }: ICreateUser): Promise<User> {
    if (!email || !password) {
      throw new HttpException('Email and password are required', 400);
    }

    const user = await this.userService.login({ email, password });

    return user;
  }
}
