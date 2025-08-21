// src/routes/sitemap-hentai.xml/+server.ts
import type { RequestHandler } from './$types';
import { turso } from '$lib/tursoClient';

interface MangaRow {
  slug: string;
  id: number;
}

interface PageCountRow {
  manga_id: number;
  page_count: number;
}

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://nhentai.pics';
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    // Get all manga
    const mangaResult = await turso.execute('SELECT slug, id FROM manga ORDER BY id');
    const manga = mangaResult.rows as unknown as MangaRow[];

    // Get page counts for each manga
    const pageCountResult = await turso.execute(`
      SELECT 
        c.manga_id,
        COUNT(p.id) as page_count
      FROM chapters c
      LEFT JOIN pages p ON c.id = p.chapter_id
      GROUP BY c.manga_id
    `);
    const pageCounts = pageCountResult.rows as unknown as PageCountRow[];
    const pageCountMap = new Map(pageCounts.map(pc => [pc.manga_id, pc.page_count]));

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add manga gallery pages
    manga.forEach(m => {
      sitemap += `  <url>
    <loc>${baseUrl}/hentai/${m.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    // Add manga reader pages (limit to avoid too large sitemaps)
    manga.slice(0, 1000).forEach(m => { // Limit to first 1000 manga for performance
      const pageCount = Math.min(pageCountMap.get(m.id) || 0, 50); // Limit to 50 pages per manga
      for (let page = 1; page <= pageCount; page++) {
        sitemap += `  <url>
    <loc>${baseUrl}/hentai/${m.slug}/${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating hentai sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};