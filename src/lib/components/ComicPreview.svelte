<!-- src/lib/components/ComicPreview.svelte -->
<script lang="ts">
	export let images: string[] = [];
	export let comicSlug: string;

	let visibleCount = 8;

	$: visibleImages = images.slice(0, visibleCount);
	$: hasMore = visibleCount < images.length;

	function loadMore() {
		visibleCount = Math.min(visibleCount + 8, images.length);
	}
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	{#each visibleImages as imgUrl, i}
		<a href={`/hentai/${comicSlug}/${i + 1}`} title={`Page ${i + 1}`}>
			<img
				src={imgUrl}
				alt={`Preview page ${i + 1}`}
				class="w-full rounded transition hover:opacity-80"
				loading="lazy"
			/>
		</a>
	{/each}
</div>

{#if hasMore}
	<div class="mt-6 flex justify-center">
		<button
			on:click={loadMore}
			class="rounded-lg bg-pink-600 px-6 py-2 font-medium text-white transition-colors hover:bg-pink-700"
		>
			Load More Pages
		</button>
	</div>
{/if}
