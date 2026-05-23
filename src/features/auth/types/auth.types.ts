export type User = {
  id: string;
  email: string;
  name: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
};
