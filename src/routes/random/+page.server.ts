// src/routes/random/+page.server.ts
import type { PageServerLoad } from './$types';
import { turso, getFeatureImage, paginate } from '$lib/tursoClient';

interface MangaRow {
  id: number;
  slug: string;
  title: string;
}

export const load: PageServerLoad = async ({ url }) => {
  const pageParam = parseInt(url.searchParams.get('page') ?? '1', 10);
  const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
  const refreshParam = url.searchParams.get('refresh');
  const seedParam = url.searchParams.get('seed');

  // Generate seed for consistent pagination
  let seed: number;
  if (refreshParam === 'true' || !seedParam) {
    seed = Math.floor(Math.random() * 1000000);
  } else {
    seed = parseInt(seedParam, 10) || Math.floor(Math.random() * 1000000);
  }

  const { limit, offset } = paginate(page, 20);

  try {
    // Get total count
    const countResult = await turso.execute('SELECT COUNT(*) as count FROM manga');
    const totalCount = countResult.rows[0]?.count as number || 0;

    // Get random manga
    // Note: SQLite RANDOM() function doesn't support seeding like PostgreSQL
    // This will be truly random each time, but still functional
    const mangaResult = await turso.execute({
      sql: `
        SELECT id, slug, title 
        FROM manga 
        ORDER BY RANDOM() 
        LIMIT ? OFFSET ?
      `,
      args: [limit, offset]
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

    const totalPages = Math.ceil(totalCount / 20);
    const isFirstPage = page === 1;

    return {
      comics,
      total: totalCount,
      page,
      seed,
      meta: {
        title: isFirstPage
          ? 'Random Hentai | Discover New Comics | nhentai.pics'
          : `Random Hentai | Page ${page} | nhentai.pics`,
        description: isFirstPage
          ? 'Discover random hentai and doujinshi on nhentai.pics. Find new comics you might have missed!'
          : `Browse page ${page} of random hentai selections. Discover new adult comics randomly.`,
        prev: page > 1 ? `/random?page=${page - 1}&seed=${seed}` : null,
        next: page < totalPages ? `/random?page=${page + 1}&seed=${seed}` : null
      }
    };
  } catch (error) {
    console.error('Error loading random page:', error);
    return {
      comics: [],
      total: 0,
      page: 1,
      seed: 0,
      meta: {
        title: 'Random Hentai | Discover New Comics | nhentai.pics',
        description: 'Discover random hentai and doujinshi.',
        prev: null,
        next: null
      }
    };
  }
};