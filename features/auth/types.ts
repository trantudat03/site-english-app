export type AuthUser = {
  id: number;
  username: string;
  email?: string;
};

export type AuthSession = {
  jwt: string;
  user: AuthUser;
};
