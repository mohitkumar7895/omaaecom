import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const searchTerm = `%${query.trim()}%`;

    // Search categories
    const [categories]: any = await pool.query(
      `SELECT id, title, image_url, 'category' as type 
       FROM categories 
       WHERE title LIKE ? AND status = 'Active' 
       LIMIT 5`,
      [searchTerm]
    );

    // Search services
    const [services]: any = await pool.query(
      `SELECT id, category_id, title, image_url, 'service' as type, selling_price 
       FROM services 
       WHERE title LIKE ? 
       LIMIT 5`,
      [searchTerm]
    );

    // Combine results
    const results = [...categories, ...services];

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
