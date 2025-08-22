import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signJwt(payload: object, opts?: jwt.SignOptions) {
  if (!env.jwtSecret || env.jwtSecret === 'devsecret') {
    console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable for production.');
  }
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d', ...opts });
}

export function verifyJwt<T>(token: string): T {
  if (!env.jwtSecret || env.jwtSecret === 'devsecret') {
    console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable for production.');
  }
  return jwt.verify(token, env.jwtSecret) as T;
}
