import { generateAccessToken, generateRefreshToken, validateOtp } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const verifySchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),

  code: z
    .string()
    .trim()
    .length(4, 'Verification code must be 4 digits')
    .regex(/^\d+$/, 'Verification code must only contain digits'),
});

export async function POST(req: Request) {
  const data = await req.json();

  const validatedData = verifySchema.safeParse(data);

  if (!validatedData.success) {
    const errors = validatedData.error.flatten().fieldErrors;
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const { email, code } = validatedData.data;

  try {
    const isValid = await validateOtp(email, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { email },
      data: { isVerified: true, lastLogin: new Date() },
    });

    // Generate tokens for immediate authentication
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

    return NextResponse.json(
      { message: 'Email verified successfully', accessToken, refreshToken, user },
      { status: 200 },
    );
  } catch (error) {
    console.error('POST OTP Verification error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
