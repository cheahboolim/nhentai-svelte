// src/routes/sitemap-browse.xml/+server.ts
import type { RequestHandler } from './$types';
import { turso } from '$lib/tursoClient';

interface TagRow {
  name: string;
}

interface ArtistRow {
  name: string;
}

interface CharacterRow {
  name: string;
}

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://nhentai.pics';
  const currentDate = new Date().toISOString().split('T')[0];

  try {
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

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

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
        'Cache-Control': 'max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating browse sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};