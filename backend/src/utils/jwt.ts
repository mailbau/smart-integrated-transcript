import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export function signJwt(payload: object, opts?: jwt.SignOptions) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d', ...opts });
}
export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as T;
}
