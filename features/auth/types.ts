export type AuthUser = {
  id: number;
  username: string;
  email?: string;
};

export type AuthSession = {
  success: true;
};

export type RefreshResponse = {
  success: true;
  user?: AuthUser;
};
