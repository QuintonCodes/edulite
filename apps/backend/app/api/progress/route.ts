import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { XP_REWARDS } from '@/lib/levelSystem';

const progressSchema = z.object({
  userId: z.string().cuid(),
  lessonId: z.string(),
});

// GET progress for a specific lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'Missing userId or lessonId' }, { status: 400 });
    }

    const progress = await db.progress.findFirst({
      where: {
        userId,
        lessonId,
      },
    });

    return NextResponse.json({ completed: !!progress?.completed }, { status: 200 });
  } catch (error) {
    console.error('GET /api/progress error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to mark a lesson as complete and award XP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = progressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { userId, lessonId } = validation.data;

    // Check if it's already completed to prevent awarding XP twice
    const existingProgress = await db.progress.findFirst({
      where: { userId, lessonId },
    });

    if (existingProgress?.completed) {
      // Already completed, just return success
      return NextResponse.json({ message: 'Tutorial already completed.' }, { status: 200 });
    }

    // Use a transaction to mark as complete AND update XP
    const [, updatedUser] = await db.$transaction([
      db.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          completed: true,
        },
        create: {
          userId,
          lessonId,
          completed: true,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: XP_REWARDS.COMPLETE_TUTORIAL,
          },
          lessonsCompleted: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: 'Tutorial completed!',
        xpAwarded: XP_REWARDS.COMPLETE_TUTORIAL,
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('POST /api/progress error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
