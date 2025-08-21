<!-- src/routes/hentai/[slug]/[page]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { seo } from '$lib/seo';
	import SimilarManga from '$lib/components/SimilarManga.svelte';
	import RandomPost from '$lib/components/RandomPost.svelte';
	import TrafficStarsAd from '$lib/components/TrafficStarsAd.svelte';
	import AAdsMiddleBanner from '$lib/components/AAdsMiddleBanner.svelte';
	import NativeAds from '$lib/components/adsterra/NativeAds.svelte';
	import AAdsBanner from '$lib/components/AAdsBanner.svelte';

	export let data: {
		slug: string;
		manga: { id: string; title: string; tagIds: number[]; tagNames: string[] };
		images: string[];
		currentPage: number;
		totalPages: number;
		randomComics: any[];
		seo: {
			title: string;
			description: string;
			canonical: string;
			prev?: string;
			next?: string;
			keywords: string;
			ogImage: string;
			jsonLd: any;
		};
	};

	const { slug, manga, totalPages } = data;
	const IMAGES_PER_PAGE = data.images.length;

	// Track current page from URL params
	let currentPage = data.currentPage;
	$: {
		const urlPage = Number($page.params.page);
		if (!isNaN(urlPage) && urlPage !== currentPage) {
			currentPage = urlPage;
			trackPageView();
		}
	}

	// Preload adjacent images for faster navigation
	let preloadedImages = new Set<string>();

	function preloadImage(url: string) {
		if (!preloadedImages.has(url)) {
			const img = new Image();
			img.src = url;
			preloadedImages.add(url);
		}
	}

	// GA4 Tracking Function
	function trackPageView() {
		if (typeof gtag !== 'undefined') {
			gtag('event', 'hentai_page_view', {
				event_category: 'engagement',
				event_label: slug,
				hentai_slug: slug,
				hentai_title: manga.title,
				page_number: currentPage,
				total_pages: totalPages,
				currency: 'USD',
				value: 0.001,
				custom_parameter_1: 'hentai_engagement'
			});

			gtag('event', 'view_item', {
				currency: 'USD',
				value: 0.001,
				items: [
					{
						item_id: `${slug}_page_${currentPage}`,
						item_name: `${manga.title} - Page ${currentPage}`,
						item_category: 'hentai',
						item_brand: 'nhentai.pics',
						item_variant: `page_${currentPage}`,
						quantity: 1,
						price: 0.001
					}
				]
			});
		}
	}

	onMount(() => {
		seo.set({
			title: data.seo.title,
			description: data.seo.description,
			canonical: data.seo.canonical,
			...(data.seo.prev && { prev: data.seo.prev }),
			...(data.seo.next && { next: data.seo.next })
		});

		trackPageView();

		// Preload adjacent pages
		const nextPageUrl = `/hentai/${slug}/${currentPage + 1}`;
		const prevPageUrl = `/hentai/${slug}/${currentPage - 1}`;

		if (currentPage < totalPages) {
			fetch(nextPageUrl).catch(() => {});
		}

		if (currentPage > 1) {
			fetch(prevPageUrl).catch(() => {});
		}

		// Keyboard navigation
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				goToPage(currentPage - 1);
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				goToPage(currentPage + 1);
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	function goToPage(n: number) {
		if (n >= 1 && n <= totalPages) {
			if (typeof gtag !== 'undefined') {
				gtag('event', 'hentai_navigation', {
					event_category: 'engagement',
					event_label: 'page_navigation',
					hentai_slug: slug,
					from_page: currentPage,
					to_page: n,
					navigation_type: 'manual'
				});
			}

			goto(`/hentai/${slug}/${n}`, {
				replaceState: false,
				keepFocus: true,
				invalidateAll: true
			});
		}
	}

	function handleImageClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const imageWidth = rect.width;

		if (clickX < imageWidth / 3) {
			if (typeof gtag !== 'undefined') {
				gtag('event', 'hentai_navigation', {
					event_category: 'engagement',
					event_label: 'image_click_prev',
					hentai_slug: slug,
					page_number: currentPage,
					navigation_type: 'image_click'
				});
			}
			goToPage(currentPage - 1);
		} else if (clickX > (imageWidth * 2) / 3) {
			if (typeof gtag !== 'undefined') {
				gtag('event', 'hentai_navigation', {
					event_category: 'engagement',
					event_label: 'image_click_next',
					hentai_slug: slug,
					page_number: currentPage,
					navigation_type: 'image_click'
				});
			}
			goToPage(currentPage + 1);
		}
	}

	let pageTitle: string;
	$: pageTitle =
		currentPage === 1
			? `Read ${manga.title} Online Free - Chapter ${currentPage} | nhentai.pics`
			: `${manga.title} - Page ${currentPage} Online Reader | nhentai.pics`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={data.seo.description} />
	<meta name="keywords" content={data.seo.keywords} />
	<link rel="canonical" href={data.seo.canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={data.seo.canonical} />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
	<meta property="og:image" content={data.seo.ogImage} />
	<meta property="og:site_name" content="nhentai.pics" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={data.seo.canonical} />
	<meta name="twitter:title" content={data.seo.title} />
	<meta name="twitter:description" content={data.seo.description} />
	<meta name="twitter:image" content={data.seo.ogImage} />

	{#if data.seo.prev}
		<link rel="prev" href={data.seo.prev} />
	{/if}
	{#if data.seo.next}
		<link rel="next" href={data.seo.next} />
	{/if}

	<script type="application/ld+json">
    {JSON.stringify(data.seo.jsonLd)}
	</script>
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<!-- Breadcrumb for SEO -->
	<nav class="mb-6" aria-label="Breadcrumb">
		<ol class="flex items-center space-x-2 text-sm text-gray-300">
			<li><a href="/" class="hover:text-white">Home</a></li>
			<li class="text-gray-500">›</li>
			<li><a href={`/hentai/${slug}`} class="hover:text-white">Gallery</a></li>
			<li class="text-gray-500">›</li>
			<li class="font-medium text-white">Read Online</li>
		</ol>
	</nav>

	<!-- Top navigation -->
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<a
			href={`/hentai/${slug}`}
			class="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-200"
		>
			← Back to Gallery
		</a>

		<div class="text-sm text-gray-300">
			Page {currentPage} of {totalPages}
		</div>
	</div>

	<header class="mb-6 text-center">
		<h1 class="mb-2 text-3xl font-bold text-white md:text-4xl">
			{manga.title}
		</h1>
		<p class="text-sm text-gray-400">
			Reading Page {currentPage}
			{#if manga.tagNames.length > 0}
				• {manga.tagNames.slice(0, 3).join(', ')}
			{/if}
		</p>
		<p class="mt-2 text-xs text-gray-500">
			💡 Click left/right sides of image to navigate • Use arrow keys
		</p>
	</header>

	<!-- Enhanced images with click navigation -->
	<section class="mb-8 space-y-4" aria-label="Hentai pages">
		{#each data.images as url, idx}
			<div class="group relative">
				<div
					class="relative cursor-pointer select-none"
					on:click={handleImageClick}
					role="button"
					tabindex="0"
					aria-label="Click left or right to navigate pages"
				>
					<img
						src={url}
						alt={`${manga.title} - Page ${(currentPage - 1) * IMAGES_PER_PAGE + idx + 1}`}
						class="w-full rounded-lg shadow-lg"
						loading="lazy"
						decoding="async"
					/>

					<!-- Click zones overlay -->
					<div
						class="absolute inset-0 flex opacity-0 transition-opacity duration-200 group-hover:opacity-100"
					>
						{#if currentPage > 1}
							<div
								class="flex h-full w-1/3 items-center justify-start rounded-l-lg bg-transparent pl-4"
							>
								<div class="rounded bg-black bg-opacity-30 px-2 py-1 text-xs text-white">
									← Previous
								</div>
							</div>
						{:else}
							<div class="h-full w-1/3"></div>
						{/if}

						<div class="h-full w-1/3"></div>

						{#if currentPage < totalPages}
							<div
								class="flex h-full w-1/3 items-center justify-end rounded-r-lg bg-transparent pr-4"
							>
								<div class="rounded bg-black bg-opacity-30 px-2 py-1 text-xs text-white">
									Next →
								</div>
							</div>
						{:else}
							<div class="h-full w-1/3"></div>
						{/if}
					</div>
				</div>

				<div
					class="absolute bottom-2 right-2 rounded bg-black bg-opacity-50 px-2 py-1 text-xs text-white"
				>
					Page {(currentPage - 1) * IMAGES_PER_PAGE + idx + 1}
				</div>
			</div>
		{/each}
	</section>

	<!-- Enhanced pagination -->
	<nav class="mb-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
		{#if currentPage > 1}
			<button
				class="rounded bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
				on:click={() => goToPage(currentPage - 1)}
				aria-label="Previous page"
			>
				← Previous
			</button>
		{/if}

		<!-- Smart pagination - show first, last, and surrounding pages -->
		{#each Array(totalPages) as _, i}
			{#if i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 2}
				<button
					class={i + 1 === currentPage
						? 'rounded bg-pink-600 px-3 py-2 font-bold text-white'
						: 'rounded border bg-white px-3 py-2 text-black transition-colors hover:bg-gray-100'}
					on:click={() => goToPage(i + 1)}
					aria-label={`Go to page ${i + 1}`}
					aria-current={i + 1 === currentPage ? 'page' : undefined}
				>
					{i + 1}
				</button>
			{:else if i + 1 === currentPage - 3 || i + 1 === currentPage + 3}
				<span class="px-2 text-gray-500">...</span>
			{/if}
		{/each}

		{#if currentPage < totalPages}
			<button
				class="rounded bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
				on:click={() => goToPage(currentPage + 1)}
				aria-label="Next page"
			>
				Next →
			</button>
		{/if}
	</nav>

	<!-- Bottom navigation -->
	<nav class="mb-8 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
		<a
			href={`/hentai/${slug}`}
			class="rounded bg-white px-6 py-2 text-black transition-colors hover:bg-gray-200"
		>
			📖 Back to Gallery
		</a>
		<a
			href="/"
			class="rounded bg-pink-600 px-6 py-2 text-white transition-colors hover:bg-pink-700"
		>
			🏠 Back to NHENTAI.PICS
		</a>
	</nav>

	<!-- Content sections -->
	<div class="space-y-8">
		<AAdsMiddleBanner />

		<section aria-label="Similar hentai recommendations">
			<SimilarManga tagIds={manga.tagIds} currentMangaId={manga.id} />
		</section>

		<AAdsBanner />

		<section aria-label="Popular hentai">
			<RandomPost comics={data.randomComics} />
		</section>

		<section aria-label="Advertisement">
			<NativeAds />
		</section>
	</div>
</main>

<style>
	main {
		background: linear-gradient(135deg, #000000 0%, #000000 100%);
		min-height: 100vh;
	}

	* {
		transition: all 0.2s ease;
	}
</style>
