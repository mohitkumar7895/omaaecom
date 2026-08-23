import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ommaecom'
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows]: any = await connection.query('SELECT * FROM cashback_ads LIMIT 1');
    await connection.end();
    
    if (rows.length === 0) {
      return NextResponse.json({
        ad_type: 'video',
        media_urls: [],
        duration: 20
      });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error fetching cashback ad config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const adType = formData.get('ad_type') as string;
    let duration = parseInt(formData.get('duration') as string) || 20;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads/ads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let mediaUrls: string[] = [];

    if (adType === 'video') {
      const videoFile = formData.get('video') as File;
      if (videoFile && videoFile.size > 0) {
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `ad_${Date.now()}_${videoFile.name.replace(/\\s+/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        mediaUrls.push(`/uploads/ads/${fileName}`);
      } else {
        // If no new file uploaded, keep existing
        const existingUrls = formData.get('existing_media') as string;
        if (existingUrls) mediaUrls = JSON.parse(existingUrls);
      }
    } else if (adType === 'image') {
      const imageFiles = formData.getAll('images') as File[];
      
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `ad_img_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;
          const filePath = path.join(uploadDir, fileName);
          await writeFile(filePath, buffer);
          mediaUrls.push(`/uploads/ads/${fileName}`);
        }
      }
      
      // Keep existing if no new images
      if (mediaUrls.length === 0) {
        const existingUrls = formData.get('existing_media') as string;
        if (existingUrls) mediaUrls = JSON.parse(existingUrls);
      }
    }

    const connection = await mysql.createConnection(dbConfig);
    const [existing]: any = await connection.query('SELECT id FROM cashback_ads LIMIT 1');
    
    if (existing.length > 0) {
      await connection.query(
        'UPDATE cashback_ads SET ad_type = ?, media_urls = ?, duration = ? WHERE id = ?',
        [adType, JSON.stringify(mediaUrls), duration, existing[0].id]
      );
    } else {
      await connection.query(
        'INSERT INTO cashback_ads (ad_type, media_urls, duration) VALUES (?, ?, ?)',
        [adType, JSON.stringify(mediaUrls), duration]
      );
    }
    
    await connection.end();

    return NextResponse.json({ success: true, message: 'Ads configuration updated' });
  } catch (error: any) {
    console.error('Error saving cashback ads:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
