<!-- src/lib/components/ComicGrid.svelte -->
<script lang="ts">
	interface Comic {
		id: string;
		title: string;
		slug: string;
		featureImage: string;
		author: {
			name: string;
		};
	}

	export let comics: Comic[] = [];
</script>

<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
	{#each comics as comic (comic.id)}
		<div
			class="bg-card group overflow-hidden rounded-lg shadow transition-shadow duration-200 hover:shadow-lg"
		>
			<a href={`/hentai/${comic.slug}`}>
				<div class="relative aspect-[3/4] overflow-hidden">
					<img
						src={comic.featureImage || '/placeholder.svg'}
						alt={comic.title}
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</div>
			</a>
			<div class="p-4">
				<a href={`/hentai/${comic.slug}`} class="hover:underline">
					<h3 class="text-foreground truncate font-bold">{comic.title}</h3>
				</a>
			</div>
		</div>
	{/each}
</div>
