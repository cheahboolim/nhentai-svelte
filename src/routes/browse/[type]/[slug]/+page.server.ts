// src/routes/browse/[type]/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { turso, getFeatureImage, paginate } from '$lib/tursoClient';

interface MetaRow {
  id: number;
  name: string;
}

interface MangaRow {
  id: number;
  slug: string;
  title: string;
}

export const load: PageServerLoad = async ({ params, url }) => {
  const { type, slug } = params;
  const page = Number(url.searchParams.get('page')) || 1;
  const { limit, offset } = paginate(page, 10);

  // Map type to table names (simplified for Turso schema)
  const allowed: Record<string, { table: string; joinTable: string; idField: string }> = {
    tags: { table: 'tags', joinTable: 'manga_tags', idField: 'tag_id' },
    artists: { table: 'artists', joinTable: 'manga_artists', idField: 'artist_id' },
    characters: { table: 'characters', joinTable: 'manga_characters', idField: 'character_id' }
  };

  const typeLabels: Record<string, string> = {
    tags: 'Tag',
    artists: 'Artist', 
    characters: 'Character'
  };

  if (!(type in allowed)) {
    throw error(404, 'Invalid browse type');
  }

  const config = allowed[type];

  try {
    // Get the meta info (tag/artist/character)
    const metaResult = await turso.execute({
      sql: `SELECT id, name FROM ${config.table} WHERE name = ?`,
      args: [slug.replace(/-/g, ' ')] // Convert slug back to name
    });

    if (metaResult.rows.length === 0) {
      throw error(404, 'Browse category not found');
    }

    const meta = metaResult.rows[0] as unknown as MetaRow;

    // Count total manga for pagination
    const countResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM ${config.joinTable} WHERE ${config.idField} = ?`,
      args: [meta.id]
    });
    const totalManga = countResult.rows[0]?.count as number || 0;
    const totalPages = Math.ceil(totalManga / 10);

    // Get paginated manga
    const mangaResult = await turso.execute({
      sql: `
        SELECT m.id, m.slug, m.title 
        FROM manga m 
        JOIN ${config.joinTable} mt ON m.id = mt.manga_id 
        WHERE mt.${config.idField} = ? 
        ORDER BY m.id 
        LIMIT ? OFFSET ?
      `,
      args: [meta.id, limit, offset]
    });

    const mangaRows = mangaResult.rows as unknown as MangaRow[];

    // Get feature images for each manga
    const comics = await Promise.all(
      mangaRows.map(async (manga) => ({
        id: manga.id.toString(),
        title: manga.title,
        slug: manga.slug,
        featureImage: await getFeatureImage(manga.id) || '/placeholder.svg',
        author: { name: 'Unknown' }
      }))
    );

    const typeLabel = typeLabels[type] || type;

    // Enhanced SEO data
    const generateDescription = () => {
      const pageInfo = page > 1 ? ` - Page ${page}` : '';
      switch (type) {
        case 'tags':
          return `Browse ${totalManga} hentai with ${meta.name} tag${pageInfo}. Find doujinshi and hentai manga featuring ${meta.name.toLowerCase()} content on nhentai.pics.`;
        case 'artists':
          return `Discover ${totalManga} hentai by artist ${meta.name}${pageInfo}. Read all works from this talented manga creator on nhentai.pics.`;
        case 'characters':
          return `Find ${totalManga} hentai featuring ${meta.name}${pageInfo}. Browse doujinshi with this popular character on nhentai.pics.`;
        default:
          return `Browse ${totalManga} hentai in ${meta.name}${pageInfo} on nhentai.pics.`;
      }
    };

    return {
      type,
      slug,
      name: meta.name,
      comics,
      page,
      totalPages,
      totalManga,
      typeLabel,
      seo: {
        title: page === 1 ? 
          `${meta.name} ${typeLabel} - ${totalManga} Hentai | nhentai.pics` :
          `${meta.name} ${typeLabel} - Page ${page} of ${totalPages} | nhentai.pics`,
        description: generateDescription(),
        canonical: `https://nhentai.pics/browse/${type}/${slug}${page > 1 ? `?page=${page}` : ''}`,
        keywords: `${meta.name.toLowerCase()}, ${type}, hentai, doujinshi, adult manga, ${meta.name.toLowerCase()} hentai`,
        ogTitle: `${meta.name} ${typeLabel} - ${totalManga} Hentai`,
        ogDescription: generateDescription(),
        ogImage: comics[0]?.featureImage || '/default-browse-og.jpg'
      }
    };
  } catch (err) {
    console.error('Error loading browse page:', err);
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    throw error(500, 'Failed to load browse page');
  }
};