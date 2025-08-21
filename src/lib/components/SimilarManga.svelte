<script lang="ts">
	import { onMount } from 'svelte';
	import { turso } from '$lib/tursoClient';

	export let tagIds: number[] = [];
	export let currentMangaId: string;

	type SimilarManga = {
		id: string;
		title: string;
		slug: string;
		feature_image_url: string | null;
		commonTags: number;
	};

	let similarManga: SimilarManga[] = [];
	let loading = true;
	let error = '';

	async function loadSimilarManga() {
		if (!tagIds.length) {
			loading = false;
			return;
		}

		try {
			// Get manga that share tags with current manga
			const tagIdsStr = tagIds.join(',');
			const sharedTagResult = await turso.execute({
				sql: `
          SELECT 
            mt.manga_id,
            m.id,
            m.title,
            m.feature_image_url,
            sm.slug
          FROM manga_tags mt
          INNER JOIN manga m ON mt.manga_id = m.id
          LEFT JOIN slug_map sm ON m.id = sm.manga_id
          WHERE mt.tag_id IN (${tagIds.map(() => '?').join(',')})
            AND mt.manga_id != ?
        `,
				args: [...tagIds, currentMangaId]
			});

			if (sharedTagResult.rows.length === 0) {
				// Fallback: get random manga if no similar found
				const randomResult = await turso.execute({
					sql: `
            SELECT 
              m.id,
              m.title,
              m.feature_image_url,
              sm.slug
            FROM manga m
            LEFT JOIN slug_map sm ON m.id = sm.manga_id
            WHERE m.id != ?
            ORDER BY RANDOM()
            LIMIT 8
          `,
					args: [currentMangaId]
				});

				similarManga = randomResult.rows.map((row) => ({
					id: String(row.id),
					title: String(row.title),
					slug: String(row.slug || ''),
					feature_image_url: row.feature_image_url as string | null,
					commonTags: 0
				}));

				loading = false;
				return;
			}

			// Count common tags and group by manga
			const mangaTagCount = new Map<
				string,
				{
					manga: { id: string; title: string; feature_image_url: string | null; slug: string };
					count: number;
				}
			>();

			sharedTagResult.rows.forEach((row) => {
				const mangaId = String(row.manga_id);
				const manga = {
					id: String(row.id),
					title: String(row.title),
					feature_image_url: row.feature_image_url as string | null,
					slug: String(row.slug || '')
				};

				if (mangaTagCount.has(mangaId)) {
					mangaTagCount.get(mangaId)!.count++;
				} else {
					mangaTagCount.set(mangaId, {
						manga,
						count: 1
					});
				}
			});

			// Convert to array and sort by common tag count, then add some randomness
			const sortedManga = Array.from(mangaTagCount.values())
				.sort((a, b) => {
					// Primary sort by common tags
					if (b.count !== a.count) {
						return b.count - a.count;
					}
					// Secondary sort by random for variety
					return Math.random() - 0.5;
				})
				.slice(0, 8); // Limit to 8 similar manga

			similarManga = sortedManga.map((item) => ({
				id: item.manga.id,
				title: item.manga.title,
				slug: item.manga.slug,
				feature_image_url: item.manga.feature_image_url,
				commonTags: item.count
			}));
		} catch (err) {
			console.error('Error loading similar manga:', err);
			error = 'Failed to load similar manga';
		} finally {
			loading = false;
		}
	}

	function navigateToManga(slug: string) {
		window.location.href = `/comic/${slug}`;
	}

	onMount(() => {
		loadSimilarManga();
	});
</script>

{#if !loading && similarManga.length > 0}
	<section class="mt-12 px-4">
		<h2 class="mb-6 text-2xl font-bold">Similar Manga</h2>

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
			{#each similarManga as manga (manga.id)}
				<div class="group">
					<div
						class="bg-card block transform cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
						on:click={() => navigateToManga(manga.slug)}
						on:keydown={(e) => e.key === 'Enter' && navigateToManga(manga.slug)}
						tabindex="0"
						role="button"
					>
						<div class="relative aspect-[3/4] overflow-hidden">
							{#if manga.feature_image_url}
								<img
									src={manga.feature_image_url}
									alt={manga.title}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									loading="lazy"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center bg-gray-200">
									<span class="text-sm text-gray-500">No Image</span>
								</div>
							{/if}

							<!-- Overlay with tag count -->
							{#if manga.commonTags > 0}
								<div
									class="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white"
								>
									{manga.commonTags} shared {manga.commonTags === 1 ? 'tag' : 'tags'}
								</div>
							{:else}
								<div
									class="absolute right-2 top-2 rounded bg-pink-600/80 px-2 py-1 text-xs text-white"
								>
									Random
								</div>
							{/if}

							<!-- Hover overlay -->
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							></div>
						</div>

						<div class="p-3">
							<h3
								class="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-pink-500"
							>
								{manga.title}
							</h3>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Refresh button -->
		<div class="mt-6 text-center">
			<button
				on:click={loadSimilarManga}
				class="rounded-lg bg-pink-600 px-4 py-2 text-sm text-white transition-colors hover:bg-pink-700"
				disabled={loading}
			>
				{loading ? 'Loading...' : 'Refresh Recommendations'}
			</button>
		</div>
	</section>
{:else if loading}
	<section class="mt-12 px-4">
		<h2 class="mb-6 text-2xl font-bold">Similar Manga</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
			{#each Array(8) as _}
				<div class="bg-card animate-pulse overflow-hidden rounded-lg shadow">
					<div class="aspect-[3/4] bg-gray-300"></div>
					<div class="p-3">
						<div class="mb-2 h-4 rounded bg-gray-300"></div>
						<div class="h-3 w-2/3 rounded bg-gray-300"></div>
					</div>
				</div>
			{/each}
		</div>
	</section>
{:else if error}
	<section class="mt-12 px-4">
		<h2 class="mb-6 text-2xl font-bold">Similar Manga</h2>
		<div class="py-8 text-center">
			<p class="mb-4 text-red-500">{error}</p>
			<button
				on:click={loadSimilarManga}
				class="rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
			>
				Try Again
			</button>
		</div>
	</section>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
