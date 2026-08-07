import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { open, rename, unlink } from 'fs/promises';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Canonical extension per verified type — never derived from the
// client-supplied filename, which is untrusted input.
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * Sniffs the real file type from its magic bytes. The `fileFilter` below
 * only sees the client-supplied `Content-Type` header, which is trivial to
 * spoof (e.g. rename an .html/.svg file and claim `image/png`). This is the
 * actual source of truth, checked after the bytes are on disk.
 */
async function detectImageMimeType(filePath: string): Promise<string | null> {
  const handle = await open(filePath, 'r');
  try {
    const header = Buffer.alloc(12);
    await handle.read(header, 0, 12, 0);

    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return 'image/jpeg';
    }
    if (header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
      return 'image/png';
    }
    if (
      header.subarray(0, 3).toString('ascii') === 'GIF' &&
      ['87a', '89a'].includes(header.subarray(3, 6).toString('ascii'))
    ) {
      return 'image/gif';
    }
    if (
      header.subarray(0, 4).toString('ascii') === 'RIFF' &&
      header.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return 'image/webp';
    }
    return null;
  } finally {
    await handle.close();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        // Extension-less placeholder — the real extension is decided after
        // we've verified the actual file content, not the claimed one.
        filename: (_req, _file, callback) => callback(null, randomUUID()),
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        // Cheap first-pass rejection based on the declared Content-Type.
        // Spoofable, so it's not the real guard — just avoids accepting
        // obviously-wrong uploads before we've written anything to disk.
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, WEBP, or GIF images are allowed.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const detectedType = await detectImageMimeType(file.path);
    if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
      await unlink(file.path).catch(() => undefined);
      throw new BadRequestException(
        'File content does not match an allowed image type (JPEG, PNG, WEBP, or GIF).',
      );
    }

    const finalFilename = `${file.filename}${EXTENSION_BY_MIME[detectedType]}`;
    await rename(file.path, join(UPLOAD_DIR, finalFilename));

    const origin = `${req.protocol}://${req.get('host')}`;
    return { url: `${origin}/uploads/${finalFilename}` };
  }
}
