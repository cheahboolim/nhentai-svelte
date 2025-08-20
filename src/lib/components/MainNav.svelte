<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Menu, X, Search } from 'lucide-svelte';
	import { writable, get } from 'svelte/store';

	let search = '';
	let isMobile = false;
	const mobileMenuOpen = writable(false);

	const navItems = [
		{ title: 'Random', href: '/random', special: true },
		{ title: 'Tags', href: '/p/tags', mobileTitle: 'Tags' },
		{ title: 'Parodies', href: '/p/parodies', mobileTitle: 'Parodies' },
		{ title: 'Characters', href: '/p/characters', mobileTitle: 'Characters' },
		{ title: 'Artists', href: '/p/artists', mobileTitle: 'Artists' },
		{ title: 'Groups', href: '/p/groups', mobileTitle: 'Groups' },
		{ title: 'Categories', href: '/p/categories', mobileTitle: 'Categories' },
		{ title: 'Languages', href: '/p/languages', mobileTitle: 'Languages' }
	];

	function handleSearch(event: Event) {
		event.preventDefault();
		if (search.trim()) {
			goto(`/search?q=${encodeURIComponent(search.trim())}`);
			mobileMenuOpen.set(false);
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen.set(false);
	}

	function navigateToRandom() {
		window.location.href = '/random';
		closeMobileMenu();
	}

	onMount(() => {
		const updateMobile = () => {
			isMobile = window.innerWidth < 1024; // Changed to lg breakpoint (1024px)
			// Auto-close mobile menu if switching to desktop
			if (!isMobile) {
				mobileMenuOpen.set(false);
			}
		};

		updateMobile();
		window.addEventListener('resize', updateMobile);

		const unsub = mobileMenuOpen.subscribe((open) => {
			if (typeof document !== 'undefined') {
				document.body.style.overflow = open ? 'hidden' : '';
			}
		});

		return () => {
			window.removeEventListener('resize', updateMobile);
			unsub();
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
			}
		};
	});
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container mx-auto px-3 sm:px-4 lg:px-8">
		<div class="flex h-14 items-center justify-between sm:h-16">
			{#if isMobile}
				<!-- MOBILE LAYOUT -->
				<div class="flex w-full items-center justify-between gap-2 sm:gap-3">
					<!-- Logo -->
					<div class="min-w-0 flex-shrink-0">
						<a href="/" class="text-foreground truncate text-base font-bold sm:text-lg">
							<span class="block sm:hidden">H.PICS</span>
							<span class="hidden sm:block">NHENTAI.PICS</span>
						</a>
					</div>

					<!-- Mobile Search -->
					<div class="mx-3 min-w-0 flex-1 sm:mx-4">
						<form on:submit={handleSearch} class="relative">
							<input
								type="search"
								bind:value={search}
								placeholder="Search..."
								class="w-full rounded-full border border-white/20 bg-[#343434] px-3 py-1.5 pr-8 text-xs text-white transition-colors placeholder:text-gray-400 focus:border-white/40 focus:outline-none sm:px-4 sm:py-2 sm:pr-10 sm:text-sm"
							/>
							<button
								type="submit"
								class="absolute right-0.5 top-1/2 -translate-y-1/2 transform rounded-full bg-transparent p-1 text-white transition-colors hover:bg-white/10 sm:right-1 sm:p-1.5"
								aria-label="Search"
							>
								<Search class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							</button>
						</form>
					</div>

					<!-- Mobile Menu Button -->
					<div class="flex-shrink-0">
						<button
							type="button"
							class="text-foreground hover:text-foreground/80 -m-1.5 p-1.5 transition-colors sm:-m-2 sm:p-2"
							on:click={() => mobileMenuOpen.update((v) => !v)}
							aria-label="Toggle menu"
						>
							<Menu class="h-4 w-4 sm:h-5 sm:w-5" />
						</button>
					</div>
				</div>
			{:else}
				<!-- DESKTOP LAYOUT -->
				<div class="flex w-full items-center justify-between">
					<!-- Logo -->
					<div class="flex-shrink-0">
						<a href="/" class="text-foreground text-xl font-bold lg:text-2xl"> NHENTAI.PICS </a>
					</div>

					<!-- Desktop Search -->
					<div class="mx-8 max-w-md flex-1">
						<form on:submit={handleSearch} class="relative">
							<input
								type="search"
								bind:value={search}
								placeholder="Search NHentai"
								class="w-full rounded-full border border-white/20 bg-[#343434] px-4 py-2 pr-12 text-sm text-white transition-colors placeholder:text-gray-400 focus:border-white/40 focus:outline-none"
							/>
							<button
								type="submit"
								class="absolute right-0.5 top-1/2 -translate-y-1/2 transform rounded-full bg-[#343434] p-2 text-white transition-colors hover:bg-[#e01382]"
								aria-label="Search"
							>
								<Search class="h-3 w-3" />
							</button>
						</form>
					</div>

					<!-- Desktop Navigation -->
					<nav class="flex items-center space-x-1 lg:space-x-2">
						{#each navItems as item}
							<a href={item.href} class="flex-shrink-0">
								<button
									class={`${
										item.special
											? 'bg-[#FF1493] text-white hover:bg-[#e01382]'
											: 'text-foreground/80 hover:text-foreground hover:bg-white/5'
									} whitespace-nowrap rounded px-3 py-2 text-sm transition-colors lg:px-4 lg:text-base`}
								>
									{item.title}
								</button>
							</a>
						{/each}
					</nav>
				</div>
			{/if}
		</div>
	</div>
</header>

<!-- MOBILE MENU OVERLAY -->
{#if isMobile && $mobileMenuOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
		on:click={closeMobileMenu}
		on:keydown={(e) => e.key === 'Escape' && closeMobileMenu()}
		tabindex="-1"
		role="button"
		aria-label="Close menu"
	></div>

	<!-- Mobile Menu Panel -->
	<div
		class="fixed bottom-0 right-0 top-0 z-[101] w-[280px] border-l border-white/10 bg-black/95 backdrop-blur-md sm:w-[320px]"
	>
		<div class="flex h-full flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 p-4">
				<span class="text-lg font-semibold text-white">Menu</span>
				<button
					on:click={closeMobileMenu}
					class="-m-2 p-2 text-white transition-colors hover:text-white/80"
					aria-label="Close menu"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Menu Content -->
			<div class="flex-1 overflow-y-auto p-4">
				<!-- Random Button -->
				<div class="mb-6">
					<button
						type="button"
						class="w-full rounded-lg bg-[#FF1493] px-6 py-3 text-center text-base font-medium text-white transition-colors hover:bg-[#e01382]"
						on:click={navigateToRandom}
					>
						Random
					</button>
				</div>

				<!-- Search Section -->
				<div class="mb-6">
					<form on:submit={handleSearch} class="relative">
						<input
							type="search"
							bind:value={search}
							placeholder="Search NHentai"
							class="w-full rounded-lg border border-white/20 bg-[#343434] px-4 py-3 pr-12 text-base text-white transition-colors placeholder:text-gray-400 focus:border-white/40 focus:outline-none"
						/>
						<button
							type="submit"
							class="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-transparent p-2 text-white transition-colors hover:bg-white/10"
							aria-label="Search"
						>
							<Search class="h-4 w-4" />
						</button>
					</form>
				</div>

				<!-- Navigation Links -->
				<nav class="space-y-1">
					{#each navItems.slice(1) as item}
						<button
							type="button"
							class="w-full rounded-lg text-left text-white/90 transition-colors hover:bg-white/5 hover:text-white {get(
								page
							).url.pathname === item.href
								? 'bg-white/10 text-white'
								: ''}"
							on:click={() => {
								window.location.href = item.href;
								closeMobileMenu();
							}}
						>
							<div class="px-4 py-3 text-base">
								{item.mobileTitle || item.title}
							</div>
						</button>
					{/each}
				</nav>
			</div>
		</div>
	</div>
{/if}
