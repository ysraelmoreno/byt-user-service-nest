import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashService } from 'src/Hash/hash.service';
import { AuthMiddleware } from './auth.middleware';
import { Session } from './session.entity';
import { SessionService } from './session.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  providers: [
    UsersService,
    {
      provide: 'HashService',
      useClass: HashService,
    },
    {
      provide: 'SessionService',
      useClass: SessionService,
    },
  ],
  controllers: [UserController],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'users/:id',
      method: RequestMethod.GET,
    });
  }
}
