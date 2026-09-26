import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { publicAssetUrl } from '../../../lib/public-media';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const searchTerm = `%${query.trim()}%`;

    const [categories]: any = await pool.query(
      `SELECT id, title, image_url, 'category' as type 
       FROM categories 
       WHERE title LIKE ? AND status = 'Active' 
       LIMIT 5`,
      [searchTerm]
    );

    const [services]: any = await pool.query(
      `SELECT id, category_id, title, image_url, 'service' as type, selling_price 
       FROM services 
       WHERE title LIKE ? 
       LIMIT 5`,
      [searchTerm]
    );

    const results = [...categories, ...services].map((row: any) => ({
      ...row,
      image_url: publicAssetUrl(row.image_url) || (row.image_url ? `/api/media/${row.type}/${row.id}` : ""),
    }));

    return NextResponse.json(
      { success: true, results },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
