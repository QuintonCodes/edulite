import { UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { z } from 'zod';

import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';

const uploadSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  userId: z.string().optional(), // Or min(1) if auth is required
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subject = formData.get('subject') as string | null;
    const userId = formData.get('userId') as string | null; // Get this from your auth session

    // Validate metadata
    const validated = uploadSchema.safeParse({ subject, userId });
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDFs are allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'past_papers',
          resource_type: 'raw', // Use 'raw' for non-media files like PDFs
          format: 'pdf',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload result is undefined'));
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });

    // Save to database
    const newPastPaper = await db.pastPaper.create({
      data: {
        fileName: file.name,
        subject: validated.data.subject,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileSize: uploadResult.bytes,
        fileType: 'pdf',
        uploaderId: userId || null, // Connect to user if ID is provided
      },
    });

    return NextResponse.json(newPastPaper, { status: 201 });
  } catch (error) {
    console.error('POST past-paper upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
