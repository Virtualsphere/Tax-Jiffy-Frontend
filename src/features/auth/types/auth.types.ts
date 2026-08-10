export type User = {
  id: number;
  email: string;
  name: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  companyId: number;
  userName: string;
  userEmail: string;
  userPassword: string;
};

/** Shape returned by POST /api/auth/login */
export type AuthSession = {
  token: string;
  userId: number;
  userName: string;
  email: string;
  role?: string;
};
