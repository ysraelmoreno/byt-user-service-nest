export interface ICreateUser {
  email: string;
  password: string;
  name: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateUsername {
  username: string;
  id: string;
}
