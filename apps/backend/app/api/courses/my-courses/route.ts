import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Get all subjects the user is enrolled in
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        subject: true, // Include the subject (course) data
      },
    });

    if (!enrollments.length) {
      return NextResponse.json([], { status: 200 }); // Return empty array, not an error
    }

    const subjectIds = enrollments.map((e: { subjectId: string }) => e.subjectId);

    // 2. Get all lessons for ALL those subjects
    const lessons = await db.lesson.findMany({
      where: {
        subjectId: {
          in: subjectIds,
        },
      },
      select: {
        id: true,
        subjectId: true,
      },
    });

    // 3. Get all COMPLETED progress records for this user
    const completedProgress = await db.progress.findMany({
      where: {
        userId,
        completed: true,
        lessonId: {
          in: lessons.map((l: { id: string }) => l.id), // Only check lessons relevant to user's courses
        },
      },
      select: {
        lessonId: true,
      },
    });

    const completedLessonIds = new Set(completedProgress.map((p: { lessonId: string }) => p.lessonId));

    // 4. Map and calculate progress for each course
    const coursesWithProgress = enrollments.map(
      (enrollment: {
        subjectId: string;
        subject: {
          id: string;
          createdAt: Date;
          title: string;
          description: string | null;
          thumbnailUrl: string | null;
        };
      }) => {
        const courseLessons = lessons.filter(
          (l: { subjectId: string; id: string }) => l.subjectId === enrollment.subjectId,
        );
        const totalLessons = courseLessons.length;

        const completedCount = courseLessons.filter((l: { id: string }) => completedLessonIds.has(l.id)).length;

        const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

        return {
          ...enrollment.subject, // All subject details (id, title, etc.)
          progress: Math.round(progress),
          totalLessons,
          completedLessons: completedCount,
        };
      },
    );

    // Filter for only "in-progress" courses
    const inProgressCourses = coursesWithProgress.filter(
      (c: { progress: number }) => c.progress > 0 && c.progress < 100,
    );

    return NextResponse.json(inProgressCourses, { status: 200 });
  } catch (error) {
    console.error('GET /api/courses/my-courses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
