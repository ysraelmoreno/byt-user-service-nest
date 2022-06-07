export interface ICreateUser {
  email: string;
  password: string;
  name: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface ILoginUserResponse {
  user: {
    id: string;
    email: string;
    username?: string;
  };
  token: string;
}

export interface IUpdateUsername {
  username: string;
  id: string;
}
