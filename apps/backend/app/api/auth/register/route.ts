import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, language } = await req.json();

    if (!firstName || !lastName || !email || !password || !language) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'User exists' }, { status: 409 });

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        language,
      },
    });

    return NextResponse.json({ message: 'Account created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
