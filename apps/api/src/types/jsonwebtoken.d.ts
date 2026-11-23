declare module 'jsonwebtoken' {
  export interface JwtPayload {
    sub?: string;
    iat?: number;
    exp?: number;
    [key: string]: string | number | boolean | undefined;
  }

  export function sign(
    payload: string | object | JwtPayload,
    secretOrPrivateKey: string,
    options?: { expiresIn?: string | number }
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string
  ): string | JwtPayload;
}