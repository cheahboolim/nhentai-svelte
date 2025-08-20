// src/routes/+page.server.ts
import type { PageServerLoad } from "./$types";
import { createClient } from "@libsql/client";
import { env } from "$env/dynamic/private";

const turso = createClient({
  url: env.TURSO_DATABASE_URL!,
  authToken: env.TURSO_AUTH_TOKEN!,
});

export const load: PageServerLoad = async ({ url }) => {
  try {
    const page = Number(url.searchParams.get("page") ?? "1");
    const seed = Number(url.searchParams.get("seed") ?? Math.floor(Math.random() * 1000000));
    const PAGE_SIZE = 20;
    const offset = (page - 1) * PAGE_SIZE;

    // Count total rows
    const totalResult = await turso.execute("SELECT COUNT(*) as count FROM manga");
    const total = Number(totalResult.rows[0].count);

    // Fetch comics
    const result = await turso.execute({
      sql: `
        SELECT id, slug, title, image_url, author
        FROM manga
        ORDER BY (abs(random() % 1000000) + ?)
        LIMIT ? OFFSET ?
      `,
      args: [seed, PAGE_SIZE, offset],
    });

    const comics = result.rows.map((row: any) => ({
      id: Number(row.id) || 0,
      slug: String(row.slug) || "",
      title: String(row.title) || "Untitled",
      featureImage: String(row.image_url) || "",
      author: String(row.author) || "Unknown",
    }));

    return {
      comics,
      total,
      page,
      seed,
      success: true,
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      comics: [],
      total: 0,
      page: 1,
      seed: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
