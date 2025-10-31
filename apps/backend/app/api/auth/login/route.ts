import { NextRequest, NextResponse } from 'next/server';

import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validatedData = loginSchema.safeParse(data);

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email, password } = validatedData.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    await db.refreshToken.deleteMany({ where: { userId: user.id } });

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ message: 'Login successful', accessToken, refreshToken, user }, { status: 200 });
  } catch (error) {
    console.error('POST Login error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
