import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  language: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const validatedData = registerSchema.safeParse(data);

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, password, language } = validatedData.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        language,
      },
    });

    return NextResponse.json({ message: 'Account created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
