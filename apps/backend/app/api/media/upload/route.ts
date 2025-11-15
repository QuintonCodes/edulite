import { UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { Readable } from 'stream';
import { z } from 'zod';

import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';

const uploadSchema = z.object({
  type: z.enum(['image', 'video']),
  userId: z.string().optional(),
  folder: z.string().optional().default('uploads'),
});

/**
 * POST /api/media/upload
 * Handles direct uploads (image or video) and saves to DB.
 *
 * Body (form-data):
 * - file: File
 * - type: "image" | "video"
 * - userId?: string
 * - folder?: string (default "uploads")
 */

export const runtime = 'nodejs'; // ensures Node APIs are available

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const type = formData.get('type') as string | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const userId = formData.get('userId') as string | null;
    const file = formData.get('file') as File | null;

    // Validate other fields via Zod (file is handled manually)
    const validatedData = uploadSchema.safeParse({ type, folder, userId });

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    if (type === 'image' && buffer.length > 1_000_000) {
      buffer = (await sharp(buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer()) as Buffer<ArrayBuffer>;
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: type === 'video' ? 'video' : 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload result is undefined'));
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    const media = await db.media.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: type === 'video' ? 'video' : 'image',
        format: uploadResult.format,
        size: uploadResult.bytes,
        userId: userId || null,
      },
    });

    if (userId && folder === 'avatars') {
      await db.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResult.secure_url },
      });
    }

    return NextResponse.json(
      {
        message: 'Upload successful',
        media,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST media upload error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
