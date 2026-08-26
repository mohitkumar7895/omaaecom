import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cashback_ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ad_type VARCHAR(50) NOT NULL DEFAULT 'video',
        media_urls JSON NOT NULL,
        duration INT NOT NULL DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Failed to run cashback_ads migration:", err);
  }
}

export async function GET() {
  try {
    await runMigration();
    const [rows]: any = await pool.query('SELECT * FROM cashback_ads LIMIT 1');

    if (!rows || rows.length === 0) {
      return NextResponse.json({ ad_type: 'video', media_urls: [], duration: 20 });
    }

    // Safely parse media_urls if stored as string
    let mediaUrls = rows[0].media_urls;
    if (typeof mediaUrls === 'string') {
      try {
        mediaUrls = JSON.parse(mediaUrls);
      } catch (e) {
        mediaUrls = [];
      }
    }

    return NextResponse.json({
      ...rows[0],
      media_urls: mediaUrls
    });
  } catch (error: any) {
    console.error('Error fetching cashback ad config:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await runMigration();
    const formData = await req.formData();
    const adType = formData.get('ad_type') as string;
    let duration = parseInt(formData.get('duration') as string) || 20;

    const uploadDir = path.join(process.cwd(), 'public/uploads/ads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let mediaUrls: string[] = [];

    if (adType === 'video') {
      const videoUrl = formData.get('video_url') as string;
      const videoFile = formData.get('video') as File;
      
      if (videoUrl && videoUrl.trim()) {
        mediaUrls.push(videoUrl.trim());
      } else if (videoFile && videoFile.size > 0) {
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `ad_${Date.now()}_${videoFile.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        mediaUrls.push(`/uploads/ads/${fileName}`);
      } else {
        // Keep existing if no new file
        const existingUrls = formData.get('existing_media') as string;
        if (existingUrls) mediaUrls = JSON.parse(existingUrls);
      }
    } else if (adType === 'image') {
      const imageFiles = formData.getAll('images') as File[];

      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `ad_img_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const filePath = path.join(uploadDir, fileName);
          await writeFile(filePath, buffer);
          mediaUrls.push(`/uploads/ads/${fileName}`);
        }
      }

      if (mediaUrls.length === 0) {
        const existingUrls = formData.get('existing_media') as string;
        if (existingUrls) mediaUrls = JSON.parse(existingUrls);
      }
    }

    const [existing]: any = await pool.query('SELECT id FROM cashback_ads LIMIT 1');

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cashback_ads SET ad_type = ?, media_urls = ?, duration = ? WHERE id = ?',
        [adType, JSON.stringify(mediaUrls), duration, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cashback_ads (ad_type, media_urls, duration) VALUES (?, ?, ?)',
        [adType, JSON.stringify(mediaUrls), duration]
      );
    }

    return NextResponse.json({ success: true, message: 'Ads configuration updated' });

  } catch (error: any) {
    console.error('Error saving cashback ads:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
