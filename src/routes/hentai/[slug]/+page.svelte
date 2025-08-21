<!-- src/routes/hentai/[slug]/+page.svelte -->
<script lang="ts">
	import ComicPreview from '$lib/components/ComicPreview.svelte';
	import SimilarManga from '$lib/components/SimilarManga.svelte';
	import MetaGroup from '$lib/components/MetaGroup.svelte';
	import RandomPost from '$lib/components/RandomPost.svelte';
	import TrafficStarsAd from '$lib/components/TrafficStarsAd.svelte';
	import ImageErrorRefreshButton from '$lib/components/ImageErrorRefreshButton.svelte';
	import { goto } from '$app/navigation';
	import AAdsMiddleBanner from '$lib/components/AAdsMiddleBanner.svelte';
	import AAdsBanner from '$lib/components/AAdsBanner.svelte';
	import NativeAds from '$lib/components/adsterra/NativeAds.svelte';

	export let data;
	const { slug, comic } = data;

	let featureImageError = false;

	function refreshFeatureImage() {
		goto(`/hentai/${slug}`, { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>{comic.title} | nhentai.pics | Read Hentai Free</title>
	<meta name="description" content={`Read ${comic.title} on nhentai.pics.`} />
	{#if comic.feature_image_url}
		<meta property="og:image" content={comic.feature_image_url} />
	{/if}
	<meta property="og:url" content="https://nhentai.pics/hentai/{slug}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="{comic.title} | nhentai.pics" />
	<meta property="og:site_name" content="nhentai.pics" />
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<div class="mx-auto max-w-6xl space-y-8">
		<!-- Main comic info section with side-by-side layout on desktop -->
		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
			<!-- Left side: Feature Image -->
			<div class="space-y-4">
				{#if comic.feature_image_url}
					<a href={`/hentai/${slug}/1`} class="block">
						<img
							src={comic.feature_image_url}
							alt={comic.title}
							class="w-full rounded-lg shadow-lg transition hover:opacity-90"
							width="600"
							height="900"
							on:error={() => (featureImageError = true)}
						/>
					</a>
					<ImageErrorRefreshButton show={featureImageError} onRefresh={refreshFeatureImage} />
				{/if}
			</div>

			<!-- Right side: Metadata and Actions - Sticky on desktop -->
			<div class="space-y-6 lg:sticky lg:top-8">
				<div>
					<h1 class="mb-4 text-3xl font-bold lg:text-4xl">{comic.title}</h1>

					{#if comic.artists.length}
						<div class="text-muted-foreground mb-4 flex flex-wrap items-center gap-2 text-sm">
							<span class="font-semibold">Artists:</span>
							{#each comic.artists as artist}
								<a href={`/browse/artists/${artist.slug}`} class="underline hover:text-pink-500">
									{artist.name}
								</a>
							{/each}
						</div>
					{/if}

					<MetaGroup type="tags" label="Tags" items={comic.tags} />
					<MetaGroup type="characters" label="Characters" items={comic.characters} />
				</div>

				<!-- Start Reading Button - Full width in meta column -->
				<a href={`/hentai/${slug}/1`} class="block">
					<button
						class="w-full rounded-xl border border-transparent bg-[#FF1493] px-6 py-3 text-center text-lg font-bold text-white shadow-lg transition hover:bg-[#e01382]"
					>
						Start Reading Hentai
					</button>
				</a>
			</div>
		</div>

		<div class="mt-10">
			<AAdsMiddleBanner />
		</div>

		<!-- Preview section -->
		{#if comic.previewImages.length > 0}
			<div>
				<h2 class="mb-4 text-2xl font-bold">Preview</h2>
				<ComicPreview images={comic.previewImages} comicSlug={slug} />
			</div>
		{/if}
	</div>

	<SimilarManga tagIds={comic.tags.map((tag) => Number(tag.id))} currentMangaId={comic.id} />
	<AAdsBanner />
	<RandomPost comics={data.randomComics} />
	<NativeAds />
</main>
