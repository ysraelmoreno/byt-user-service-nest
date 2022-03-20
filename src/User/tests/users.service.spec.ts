import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { UsersService } from '../users.service';
import { uuid } from 'uuidv4';

describe('User Service', () => {
  let userService: UsersService;
  let repositoryMock: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    repositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('Should be able to list all users', async () => {
    const users = [
      {
        id: uuid(),
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await jest
      .spyOn(repositoryMock, 'find')
      .mockImplementation(async (): Promise<User[]> => users);

    expect(await userService.findAll()).toEqual(users);
  });

  it('should not be able to create a user that already exists', async () => {
    const user = {
      id: uuid(),
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await jest.spyOn(repositoryMock, 'findOne').mockImplementation(async () => {
      return user;
    });

    await userService
      .createUser({
        email: 'johndoe@gmail.com',
        name: 'John Doe',
        password: '123456',
      })
      .catch((error) => {
        expect(error.message).toBe('User already exists');
      });
  });

  it("should be able to identify if a user it's already created", async () => {
    const user = {
      id: uuid(),
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await jest
      .spyOn(repositoryMock, 'findOne')
      .mockImplementation(async () => user);

    expect(await userService.findByEmail('johndoe@gmail.com')).toEqual(user);
  });

  it('Should be able to create a new user', async () => {
    const newUser = {
      email: 'johndoe@gmail.com',
      name: 'John Doe',
      password: '123456',
    };

    await jest
      .spyOn(repositoryMock, 'findOne')
      .mockImplementation(async () => null);

    await jest
      .spyOn(repositoryMock, 'save')
      .mockImplementation(async () => newUser as User);

    expect(await userService.createUser(newUser)).toEqual(newUser);
  });

  it('should be able to update a username to user', async () => {
    const existingUsername = {
      id: 'e6130352-a815-11ec-b909-0242ac120002',
      name: 'John Doe',
      username: null,
      email: 'johndoe@gmail.com',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await jest
      .spyOn(repositoryMock, 'findOne')
      .mockImplementation(async (conditions: Record<string, any>) => {
        if (conditions.where.username) {
          return null;
        }

        return existingUsername;
      });

    await jest.spyOn(repositoryMock, 'save').mockImplementation(async () => {
      return {
        ...existingUsername,
        username: 'johndoe',
      };
    });

    expect(
      await userService.updateUsername({
        id: 'e6130352-a815-11ec-b909-0242ac120002',
        username: 'johndoe',
      }),
    ).toMatchObject({
      username: 'johndoe',
    });
  });

  it('should be not able to set a existing username to user', async () => {
    const existingUsername = {
      id: 'e6130352-a815-11ec-b909-0242ac120002',
      name: 'John Doe',
      userName: 'ysraelmoreno',
      email: 'johndoe@gmail.com',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await jest.spyOn(repositoryMock, 'findOne').mockImplementation(async () => {
      return existingUsername;
    });

    await userService
      .updateUsername({
        username: 'ysraelmoreno',
        id: 'e6130352-a815-11ec-b909-0242ac120002',
      })
      .catch((error) => {
        expect(error.message).toBe('Username already exists');
      });
  });

  it('should not be able to send a username with special characters', async () => {
    const existingUsername = {
      id: 'e6130352-a815-11ec-b909-0242ac120002',
      name: 'John Doe',
      username: null,
      email: 'johndoe@gmail.com',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await jest
      .spyOn(repositoryMock, 'findOne')
      .mockImplementation(async (conditions: Record<string, any>) => {
        if (conditions.where.username) {
          return null;
        }

        return existingUsername;
      });

    await userService
      .updateUsername({
        id: 'e6130352-a815-11ec-b909-0242ac120002',
        username: '@johndoe',
      })
      .catch((error) => {
        expect(error.message).toBe(
          'Username cannot contain special characters',
        );
      });
  });

  it('should be not able to update username of an unexisting user', async () => {
    await jest
      .spyOn(repositoryMock, 'findOne')
      .mockImplementation(async (conditions: Record<string, any>) => {
        if (conditions.where.username) {
          return null;
        }

        return null;
      });

    await userService
      .updateUsername({
        id: 'e6130352-a815-11ec-b909-0242ac120002',
        username: 'johndoe',
      })
      .catch((error) => {
        expect(error.message).toBe('User not found');
      });
  });
});
