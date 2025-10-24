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

  return new Promise((resolve) => {
    form.parse(req as unknown as import('http').IncomingMessage, async (err, fields, files) => {
      if (err || !files.file) {
        return resolve(NextResponse.json({ error: 'Upload failed' }, { status: 400 }));
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      const fileObj = file as {
        filepath?: string;
        path?: string;
        originalFilename?: string;
        newFilename?: string;
        name?: string;
        mimetype?: string;
        type?: string;
      };

      const inputPath = fileObj.filepath || fileObj.path;
      const ext = path.extname(fileObj.originalFilename || fileObj.name || '');
      const baseName = path.basename(fileObj.newFilename || fileObj.name || '', ext);
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

        const fileType =
          fileObj.mimetype || fileObj.type || (ext ? `video/${ext.slice(1)}` : 'application/octet-stream');

        type DbWithMedia = {
          media: {
            create: (args: { data: { filename: string; type: string; url: string } }) => Promise<unknown>;
          };
        };

        await (db as unknown as DbWithMedia).media.create({
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
      } catch (err) {
        console.error('Compression error:', err);
        return resolve(NextResponse.json({ error: 'Compression failed' }, { status: 500 }));
      }
    });
  });
}
