<script lang="ts">
	interface Manga {
		id: number;
		title: string;
		slug: string;
		description?: string;
		totalViews: number;
	}

	export let comics: Manga[] = [];
</script>

<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
	{#each comics as comic (comic.id)}
		<div
			class="bg-card group overflow-hidden rounded-lg shadow transition-shadow duration-200 hover:shadow-lg"
		>
			<a href={`/manga/${comic.slug}`}>
				<div class="relative flex aspect-[3/4] items-center justify-center bg-gray-100">
					<!-- Placeholder since Turso has no images -->
					<span class="text-sm text-gray-500">No Image</span>
				</div>
			</a>
			<div class="p-4">
				<a href={`/manga/${comic.slug}`} class="hover:underline">
					<h3 class="text-foreground truncate font-bold">{comic.title}</h3>
				</a>
				<p class="text-xs text-gray-500">{comic.totalViews} views</p>
			</div>
		</div>
	{/each}
</div>
