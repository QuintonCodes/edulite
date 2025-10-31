import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ user: null, isAuthenticated: false }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return NextResponse.json({ user: null, isAuthenticated: false }, { status: 401 });
    }

    return NextResponse.json({ user, isAuthenticated: true }, { status: 200 });
  } catch (error) {
    console.error('GET Session error:', error);
    return NextResponse.json({ user: null, isAuthenticated: false }, { status: 401 });
  }
}
