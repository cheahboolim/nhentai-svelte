<!-- src/routes/search/+page.svelte -->
<script lang="ts">
	export let data: {
		query: string;
		comics: {
			id: string;
			title: string;
			slug: string;
			featureImage: string;
			author: { name: string };
		}[];
		page: number;
		totalPages: number;
		meta: {
			title: string;
			description: string;
			prev: string | null;
			next: string | null;
		};
	};
	import NativeAds from '$lib/components/adsterra/NativeAds.svelte';
	import TrafficStarsAd from '$lib/components/TrafficStarsAd.svelte';
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	{#if data.meta.prev}
		<link rel="prev" href={data.meta.prev} />
	{/if}
	{#if data.meta.next}
		<link rel="next" href={data.meta.next} />
	{/if}
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<main class="container mx-auto px-4 py-12">
	<h1 class="mb-6 text-3xl font-bold">
		Search results for: <span class="text-pink-500">{data.query}</span>
	</h1>

	{#if data.comics.length === 0}
		<p class="text-muted-foreground">No hentai found.</p>
	{:else}
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each data.comics as comic}
				<a href={`/hentai/${comic.slug}`} class="block hover:opacity-90">
					<img
						src={comic.featureImage}
						alt={comic.title}
						class="h-auto w-full rounded shadow"
						loading="lazy"
					/>
					<p class="mt-2 text-center text-sm font-medium text-white">
						{comic.title}
					</p>
				</a>
			{/each}
		</div>

		<div class="mt-10 flex flex-wrap justify-center gap-2">
			{#each Array(data.totalPages) as _, i}
				{#if data.query}
					<a
						href={`/search?q=${encodeURIComponent(data.query)}&page=${i + 1}`}
						class="rounded border border-white px-4 py-2 text-white transition hover:bg-white hover:text-black"
						class:selected={data.page === i + 1}
					>
						{i + 1}
					</a>
				{/if}
			{/each}
		</div>
	{/if}
	<NativeAds />
	<TrafficStarsAd />
</main>

<style>
	.selected {
		background-color: white;
		color: black;
	}
</style>
