// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { turso, getFeatureImage, paginate } from '$lib/tursoClient';

interface MangaRow {
  id: number;
  slug: string;
  title: string;
  total_views: number;
}

interface ComicItem {
  id: string;
  title: string;
  slug: string;
  featureImage: string;
  author: { name: string };
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
    // Get total count for pagination
    const countResult = await turso.execute('SELECT COUNT(*) as count FROM manga');
    const totalCount = countResult.rows[0]?.count as number || 0;

    // Get manga ordered by total_views DESC with some randomness
    // Using ABS(RANDOM()) % for pseudo-random but deterministic ordering
    const mangaResult = await turso.execute({
      sql: `
        SELECT id, slug, title, total_views 
        FROM manga 
        ORDER BY total_views DESC, (ABS(RANDOM()) % 1000) 
        LIMIT ? OFFSET ?
      `,
      args: [limit, offset]
    });

    const mangaRows = mangaResult.rows as unknown as MangaRow[];
    
    // Get feature images for each manga
    const comics: ComicItem[] = await Promise.all(
      mangaRows.map(async (manga) => {
        const featureImage = await getFeatureImage(manga.id) || '/placeholder.svg';
        return {
          id: manga.id.toString(),
          title: manga.title,
          slug: manga.slug,
          featureImage,
          author: { name: 'Unknown' }
        };
      })
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
          ? 'nhentai.pics | Read Hentai, Doujinshi, and Latest Manga'
          : `Popular Manga | Page ${page} | nhentai.pics`,
        description: isFirstPage
          ? 'Discover popular manga, hentai, and doujinshi that others are reading on nhentai.pics. Find trending adult comics and community favorites!'
          : `Browse page ${page} of popular manga selections. Discover trending adult comics, hentai and doujinshi.`,
        prev: page > 1 ? `/?page=${page - 1}&seed=${seed}` : null,
        next: page < totalPages ? `/?page=${page + 1}&seed=${seed}` : null
      }
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      comics: [],
      total: 0,
      page: 1,
      seed: 0,
      meta: {
        title: 'nhentai.pics | Read Hentai, Doujinshi, and Latest Manga',
        description: 'Discover popular manga, hentai, and doujinshi.',
        prev: null,
        next: null
      }
    };
  }
};