// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';
import { turso } from '$lib/tursoClient';

interface MangaRow {
  slug: string;
  id: number;
}

interface TagRow {
  name: string;
}

interface ArtistRow {
  name: string;
}

interface CharacterRow {
  name: string;
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

    // Get all tags
    const tagsResult = await turso.execute('SELECT DISTINCT name FROM tags ORDER BY name');
    const tags = tagsResult.rows as unknown as TagRow[];

    // Get all artists
    const artistsResult = await turso.execute('SELECT DISTINCT name FROM artists ORDER BY name');
    const artists = artistsResult.rows as unknown as ArtistRow[];

    // Get all characters
    const charactersResult = await turso.execute('SELECT DISTINCT name FROM characters ORDER BY name');
    const characters = charactersResult.rows as unknown as CharacterRow[];

    // Helper function to create slug from name
    const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: 'random', changefreq: 'hourly', priority: '0.8' },
      { url: 'browse', changefreq: 'weekly', priority: '0.7' }
    ];

    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

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

    // Add manga reader pages (all pages for each manga)
    manga.forEach(m => {
      const pageCount = pageCountMap.get(m.id) || 0;
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

    // Add browse pages for tags
    tags.forEach(tag => {
      const tagSlug = createSlug(tag.name);
      sitemap += `  <url>
    <loc>${baseUrl}/browse/tags/${tagSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // Add browse pages for artists
    artists.forEach(artist => {
      const artistSlug = createSlug(artist.name);
      sitemap += `  <url>
    <loc>${baseUrl}/browse/artists/${artistSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // Add browse pages for characters
    characters.forEach(character => {
      const characterSlug = createSlug(character.name);
      sitemap += `  <url>
    <loc>${baseUrl}/browse/characters/${characterSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};