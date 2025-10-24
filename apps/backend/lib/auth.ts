import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { db } from './db';

type JwtPayload = {
  userId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  language: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
};

type AuthenticatedRequest = NextRequest & {
  user: User;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN;
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('❌ Missing JWT secrets in environment variables.');
}

const ACCESS_SECRET_KEY = new TextEncoder().encode(ACCESS_SECRET);
const REFRESH_SECRET_KEY = new TextEncoder().encode(REFRESH_SECRET);

const ACCESS_EXPIRES = 15 * 60; // 15 minutes
const REFRESH_EXPIRES = 7 * 24 * 60 * 60; // 7 days
const SALT_ROUNDS = 10;

// Password utilities
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// JWT Generation
export async function generateAccessToken(userId: string) {
  const jwt = await new SignJWT({ userId, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('edulite')
    .setAudience('edulite-mobile')
    .setExpirationTime(`${ACCESS_EXPIRES}s`)
    .sign(ACCESS_SECRET_KEY);

  return jwt;
}

export async function generateRefreshToken(userId: string) {
  const jwt = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('edulite')
    .setAudience('edulite-mobile')
    .setExpirationTime(`${REFRESH_EXPIRES}s`)
    .sign(REFRESH_SECRET_KEY);

  return jwt;
}

// JWT Verification
export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET_KEY, {
    issuer: 'edulite',
    audience: 'edulite-mobile',
  });
  return payload as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET_KEY, {
    issuer: 'edulite',
    audience: 'edulite-mobile',
  });
  return payload as JwtPayload;
}

// Token decoding
export function decodeAccessToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Auth middleware
export function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextResponse) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);

      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

      const authReq = req as AuthenticatedRequest;
      authReq.user = user;

      return handler(authReq, res);
    } catch (error) {
      console.error('Auth Middleware error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
