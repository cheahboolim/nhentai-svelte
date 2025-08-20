// src/lib/types.ts
export interface ComicItem {
  id: number;
  title: string;
  slug: string;
  featureImage: string;
  author: { name: string };
}
