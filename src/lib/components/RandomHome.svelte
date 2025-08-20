<script lang="ts">
	export let comics: any[]; // raw rows
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	{#each comics as comic}
		<div class="rounded bg-white shadow">
			<img src={comic.featureImage} alt={comic.title} class="h-48 w-full rounded-t object-cover" />
			<div class="p-2">
				<h3 class="font-bold">{comic.title}</h3>
				<p class="text-sm text-gray-500">{comic.author}</p>
			</div>
		</div>
	{/each}
</div>
