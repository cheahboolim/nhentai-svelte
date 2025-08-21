<!-- src/lib/components/RandomPost.svelte -->
<script lang="ts">
	export let comics: any[] = [];

	// Limit to 8 comics for the widget
	$: displayComics = comics.slice(0, 8);

	function navigateToComic(slug: string) {
		window.location.href = `/hentai/${slug}`;
	}
</script>

{#if displayComics.length > 0}
	<div class="dark:bg-grey-800 mb-8 rounded-lg bg-black p-6 shadow-lg">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold text-gray-900 dark:text-white">🔥 Hot now on nhentai.pics</h3>
		</div>

		<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each displayComics as comic}
				<div
					class="group block cursor-pointer overflow-hidden rounded-lg bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md dark:bg-black"
					on:click={() => navigateToComic(comic.slug)}
					on:keydown={(e) => e.key === 'Enter' && navigateToComic(comic.slug)}
					tabindex="0"
					role="button"
				>
					<div class="relative aspect-[3/4]">
						{#if comic.featureImage}
							<img
								src={comic.featureImage}
								alt={comic.title}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-black">
								<span class="text-black-400 text-xs">No Image</span>
							</div>
						{/if}

						<div
							class="absolute inset-0 bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-20"
						></div>
					</div>

					<div class="p-2">
						<h4
							class="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400"
						>
							{comic.title}
						</h4>
					</div>
				</div>
			{/each}
		</div>

		<div class="text-center">
			<a
				href="/random"
				class="inline-flex transform items-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-pink-600 hover:to-red-600 hover:shadow-xl"
			>
				<span class="mr-2">🔥</span>
				Read What's Hot Now
				<span class="ml-2">→</span>
			</a>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
