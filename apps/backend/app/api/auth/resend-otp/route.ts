import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateAndStoreOtp } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email-service';

const resendSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((val) => val.trim().toLowerCase()),
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validated = resendSchema.safeParse(data);

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email } = validated.data;

    // ✅ Check if user exists
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 404 });
    }

    const otpCode = await generateAndStoreOtp(email);
    await sendVerificationEmail(email, otpCode);

    return NextResponse.json({ message: 'Verification code sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('POST Resend OTP error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
