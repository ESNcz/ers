export type JwtContent = {
  sub: string;
  ver?: number; // Token version, bumped to revoke all sessions of the user
  iat: number; // Issued at
};
