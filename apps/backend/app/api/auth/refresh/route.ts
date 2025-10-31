import { NextRequest, NextResponse } from 'next/server';

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });

    const tokenRecord = await db.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.revoked) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await db.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });
      return NextResponse.json({ error: 'Expired refresh token' }, { status: 401 });
    }

    // Verify JWT payload
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload.userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const newAccessToken = await generateAccessToken(payload.userId);
    const newRefreshToken = await generateRefreshToken(payload.userId);

    await db.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    await db.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: 'Token refreshed successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('POST Refresh error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
