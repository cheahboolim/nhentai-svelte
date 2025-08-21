// src/routes/search/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { turso, getFeatureImage, paginate } from '$lib/tursoClient';

interface MangaRow {
  id: number;
  slug: string;
  title: string;
}

export const load: PageServerLoad = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const { limit, offset } = paginate(page, 10);

  if (!query) {
    return {
      query,
      comics: [],
      page: 1,
      totalPages: 1,
      meta: {
        title: 'Search | nhentai.pics',
        description: 'Search for hentai on nhentai.pics.',
        prev: null,
        next: null
      }
    };
  }

  try {
    // Count total results
    const countResult = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM manga WHERE title LIKE ?',
      args: [`%${query}%`]
    });
    const totalCount = countResult.rows[0]?.count as number || 0;
    const totalPages = Math.ceil(totalCount / 10);

    // Get paginated results
    const mangaResult = await turso.execute({
      sql: 'SELECT id, slug, title FROM manga WHERE title LIKE ? LIMIT ? OFFSET ?',
      args: [`%${query}%`, limit, offset]
    });

    const mangaRows = mangaResult.rows as unknown as MangaRow[];

    // Get feature images
    const comics = await Promise.all(
      mangaRows.map(async (manga) => ({
        id: manga.id.toString(),
        title: manga.title,
        slug: manga.slug,
        featureImage: await getFeatureImage(manga.id) || '/placeholder.svg',
        author: { name: 'Unknown' }
      }))
    );

    const meta = {
      title: page > 1
        ? `Search results for "${query}" – Page ${page} | nhentai.pics`
        : `Search results for "${query}" | nhentai.pics`,
      description: `Discover hentai results for "${query}" on nhentai.pics. Page ${page} of ${totalPages}.`,
      prev: page > 1 ? `/search?q=${encodeURIComponent(query)}&page=${page - 1}` : null,
      next: page < totalPages ? `/search?q=${encodeURIComponent(query)}&page=${page + 1}` : null
    };

    return {
      query,
      comics,
      page,
      totalPages,
      meta
    };
  } catch (err) {
    console.error('Search error:', err);
    throw error(500, 'Failed to search hentai');
  }
};