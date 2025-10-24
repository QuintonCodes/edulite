import { db } from '@/lib/db';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

ffmpeg.setFfmpegPath(ffmpegStatic!);

export async function POST(req: NextRequest) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req as unknown as import('http').IncomingMessage, async (err, fields, files) => {
      if (err || !files.file) {
        return resolve(NextResponse.json({ error: 'Upload failed' }, { status: 400 }));
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const inputPath = file.filepath;
      const ext = path.extname(file.originalFilename || '');
      const baseName = path.basename(file.newFilename, ext);
      const outputPath = path.join(uploadDir, `compressed-${baseName}.mp4`);

      try {
        await new Promise((ffmpegResolve, ffmpegReject) => {
          ffmpeg(inputPath)
            .outputOptions([
              '-preset fast',
              '-crf 28', // Lower = better quality, higher = more compression
              '-movflags +faststart',
            ])
            .toFormat('mp4')
            .save(outputPath)
            .on('end', ffmpegResolve)
            .on('error', ffmpegReject);
        });
        // determine file type (use mimetype when available, otherwise infer from extension)
        const fileType = (file as any).mimetype || (ext ? `video/${ext.slice(1)}` : 'application/octet-stream');

        // Insert into database (cast db to any to avoid TypeScript model mismatch; replace with correct model name if available)
        await (db as any).media.create({
            data: {
            filename: `compressed-${baseName}.mp4`,
            type: fileType,
            url: `/uploads/compressed-${baseName}.mp4`,
            },
        });

        return resolve(
          NextResponse.json({
            message: 'Upload and compression successful',
            url: `/uploads/compressed-${baseName}.mp4`,
          })
        );
      } catch (compressionError) {
        return resolve(NextResponse.json({ error: 'Compression failed' }, { status: 500 }));
      }
    });
  });
}
