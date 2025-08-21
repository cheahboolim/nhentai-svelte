<!-- src/lib/components/RandomHome.svelte -->
<script lang="ts">
	import ComicGrid from './ComicGrid.svelte';

	export let comics: any[] = [];
	export let total: number;
	export let page: number;
	export let seed: number;

	const PAGE_SIZE = 20;
	const totalPages = Math.ceil(total / PAGE_SIZE);

	function goToPage(p: number) {
		if (p >= 1 && p <= totalPages) {
			window.location.href = `/?page=${p}&seed=${seed}`;
		}
	}

	function loadMoreManga() {
		goToPage(page + 1);
	}
</script>

<div class="bg-background text-foreground min-h-screen px-4 py-10">
	<div class="mb-6 text-center">
		<h2 class="mb-2 text-2xl font-bold">For You</h2>
		<p class="text-foreground/70 text-sm">Popular picks from our community 🔥</p>
	</div>

	{#if comics.length === 0}
		<p class="text-foreground/70 text-center">No hentai found.</p>
	{:else}
		<ComicGrid {comics} />

		<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
			<!-- Previous Button -->
			<button
				on:click={() => goToPage(page - 1)}
				class="rounded border bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
				disabled={page === 1}
			>
				← Previous
			</button>

			<!-- Load More Button -->
			<button
				on:click={loadMoreManga}
				class="rounded border bg-pink-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
				disabled={page >= totalPages}
			>
				LOAD MORE HENTAI
			</button>
		</div>
	{/if}
</div>
