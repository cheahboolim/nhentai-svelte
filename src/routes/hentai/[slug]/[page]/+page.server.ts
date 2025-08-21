// src/routes/hentai/[slug]/[page]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { turso, getFeatureImage } from '$lib/tursoClient';

interface MangaRow {
  id: number;
  slug: string;
  title: string;
}

interface PageRow {
  image_url: string;
}

interface TagRow {
  id: number;
  name: string;
}

export const load: PageServerLoad = async ({ params }) => {
  const { slug, page: pageParam } = params;
  const pageNum = Number(pageParam);

  if (isNaN(pageNum) || pageNum < 1) {
    throw error(404, 'Invalid page number');
  }

  try {
    // Get manga by slug
    const mangaResult = await turso.execute({
      sql: 'SELECT id, slug, title FROM manga WHERE slug = ?',
      args: [slug]
    });

    if (mangaResult.rows.length === 0) {
      throw error(404, 'Hentai not found');
    }

    const manga = mangaResult.rows[0] as unknown as MangaRow;

    // Get total pages count
    const countResult = await turso.execute({
      sql: `
        SELECT COUNT(*) as count 
        FROM pages p 
        JOIN chapters c ON p.chapter_id = c.id 
        WHERE c.manga_id = ?
      `,
      args: [manga.id]
    });
    const totalPages = countResult.rows[0]?.count as number || 0;

    if (pageNum > totalPages) {
      throw error(404, 'Page not found');
    }

    // Get current page image (1-based indexing)
    const pageResult = await turso.execute({
      sql: `
        SELECT p.image_url 
        FROM pages p 
        JOIN chapters c ON p.chapter_id = c.id 
        WHERE c.manga_id = ? 
        ORDER BY c.chapter_number, p.page_number 
        LIMIT 1 OFFSET ?
      `,
      args: [manga.id, pageNum - 1]
    });

    if (pageResult.rows.length === 0) {
      throw error(404, 'Page image not found');
    }

    const pageImages = pageResult.rows as unknown as PageRow[];

    // Get tags for the manga
    const tagsResult = await turso.execute({
      sql: `
        SELECT t.id, t.name 
        FROM tags t 
        JOIN manga_tags mt ON t.id = mt.tag_id 
        WHERE mt.manga_id = ?
      `,
      args: [manga.id]
    });
    const tags = tagsResult.rows as unknown as TagRow[];

    // Get random comics for recommendations
    const randomResult = await turso.execute({
      sql: `
        SELECT id, slug, title 
        FROM manga 
        WHERE id != ? 
        ORDER BY RANDOM() 
        LIMIT 8
      `,
      args: [manga.id]
    });

    const randomManga = randomResult.rows as unknown as MangaRow[];
    const randomComics = await Promise.all(
      randomManga.map(async (m) => ({
        id: m.id.toString(),
        title: m.title,
        slug: m.slug,
        featureImage: await getFeatureImage(m.id) || '/placeholder.svg',
        author: { name: 'nhentai.pics' }
      }))
    );

    // SEO metadata
    const baseTitle = manga.title;
    const siteTitle = "nhentai.pics";
    const separator = " | ";
    
    const seoTitle = pageNum === 1
      ? `Read ${baseTitle} Online Free - Chapter ${pageNum}${separator}${siteTitle}`
      : `${baseTitle} - Page ${pageNum} Online Reader${separator}${siteTitle}`;

    const tagNames = tags.map(t => t.name);
    const seoDescription = pageNum === 1
      ? `Read ${baseTitle} hentai online for free at nhentai.pics. High quality translated manga with fast updates.${tagNames.length > 0 ? ` Available genres: ${tagNames.slice(0, 3).join(', ')}.` : ''}`
      : `Continue reading ${baseTitle} - Page ${pageNum} at nhentai.pics. Free online hentai reader with high quality images and fast loading.`;

    const canonical = `https://nhentai.pics/hentai/${slug}/${pageNum}`;
    const ogImage = pageImages[0]?.image_url || '/default-manga-cover.jpg';

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ComicSeries",
      "name": manga.title,
      "description": seoDescription,
      "url": `https://nhentai.pics/hentai/${slug}`,
      "image": ogImage,
      "genre": tagNames,
      "numberOfEpisodes": totalPages,
      "publisher": {
        "@type": "Organization",
        "name": siteTitle,
        "url": "https://nhentai.pics"
      }
    };

    return {
      slug,
      manga: {
        id: manga.id.toString(),
        title: manga.title,
        tagIds: tags.map(t => t.id),
        tagNames
      },
      images: pageImages.map(p => p.image_url),
      currentPage: pageNum,
      totalPages,
      randomComics,
      seo: {
        title: seoTitle,
        description: seoDescription,
        canonical,
        prev: pageNum > 1 ? `/hentai/${slug}/${pageNum - 1}` : undefined,
        next: pageNum < totalPages ? `/hentai/${slug}/${pageNum + 1}` : undefined,
        keywords: [...tagNames, manga.title, 'hentai', 'read online', 'free manga'].join(', '),
        ogImage,
        jsonLd
      }
    };
  } catch (err) {
    console.error('Error loading hentai reader page:', err);
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    throw error(500, 'Failed to load hentai reader');
  }
};