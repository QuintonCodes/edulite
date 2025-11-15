import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateAndStoreOtp, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email-service';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  language: z.string().min(1, 'Language is required'),
  role: z.enum(['student', 'teacher'], {
    required_error: 'Please select a role',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validatedData = registerSchema.safeParse(data);

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, password, language, role } = validatedData.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        language,
        role,
      },
    });

    const otpCode = await generateAndStoreOtp(email);
    await sendVerificationEmail(otpCode, email);

    return NextResponse.json({ message: 'Account created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('POST Register error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
