// src/lib/tursoClient.ts
import { createClient } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN
});

// Helper function to get feature image (first page image)
export async function getFeatureImage(mangaId: number): Promise<string | null> {
  try {
    const result = await turso.execute({
      sql: 'SELECT image_url FROM pages WHERE chapter_id IN (SELECT id FROM chapters WHERE manga_id = ?) ORDER BY page_number LIMIT 1',
      args: [mangaId]
    });
    
    return result.rows[0]?.image_url as string || null;
  } catch (error) {
    console.error('Error fetching feature image:', error);
    return null;
  }
}

// Helper function to get all images for a manga
export async function getMangaImages(mangaId: number): Promise<string[]> {
  try {
    const result = await turso.execute({
      sql: `
        SELECT p.image_url 
        FROM pages p 
        JOIN chapters c ON p.chapter_id = c.id 
        WHERE c.manga_id = ? 
        ORDER BY c.chapter_number, p.page_number
      `,
      args: [mangaId]
    });
    
    return result.rows.map(row => row.image_url as string);
  } catch (error) {
    console.error('Error fetching manga images:', error);
    return [];
  }
}

// Helper function for pagination
export function paginate(page: number, pageSize: number = 20) {
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize
  };
}