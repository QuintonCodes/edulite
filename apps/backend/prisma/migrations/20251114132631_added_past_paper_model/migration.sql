-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coursesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "earnedAchievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastStreakDate" TIMESTAMP(3),
ADD COLUMN     "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "loginStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxLessonsInDay" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nightLessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "perfectQuizzes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PastPaper" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT,

    CONSTRAINT "PastPaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PastPaper_publicId_key" ON "PastPaper"("publicId");

-- AddForeignKey
ALTER TABLE "PastPaper" ADD CONSTRAINT "PastPaper_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
