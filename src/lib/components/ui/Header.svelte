<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import Logo from '$lib/assets/icons/Logo.svelte';
	import FeedbackButton from '$components/ui/feedback/FeedbackButton.svelte';
	// import DaisyUIThemeSwitcher from '$lib/components/themeChamge/DaisyUIThemeSwitcher.svelte';
	import { onMount } from 'svelte';
	import { toggleMenu } from '$lib/stores/menu.store';
	import IconamoonMenuBurgerHorizontalBold from '~icons/iconamoon/menu-burger-horizontal-bold';

	let activeCategory = '';
	let isDesktop = true;

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 640px)');
		isDesktop = mediaQuery.matches;

		const handleMediaQueryChange = (e: MediaQueryListEvent) => {
			isDesktop = e.matches;
		};

		mediaQuery.addEventListener('change', handleMediaQueryChange);

		return () => {
			mediaQuery.removeEventListener('change', handleMediaQueryChange);
		};
	});

	const links = [
		// Add your menu items here
	];
</script>

<nav class="bien-nav">
	<div class="relative container mx-auto py-2">
		<!--Desktop Header-->
		<header class="flex items-center gap-3 px-2 sm:px-0">
			<button
				class="sm:hidden p-2 rounded-md hover:bg-base-200 transition-colors duration-200"
				on:click={toggleMenu}
				aria-label="Open menu"
			>
				<IconamoonMenuBurgerHorizontalBold class="size-6" />
			</button>
			<a
				class="flex-initial flex-shrink-0 mr-3 max-w-[140px] sm:max-w-[160px] h-auto no-drag select-none"
				href="{base}/"
			>
				<Logo />
			</a>

			<!-- Desktop menu -->
			<div class="z-10 flex-1 space-x-4 lg:space-x-8 w-full justify-end hidden sm:flex">
				{#each links as link}
					<a
						class="menu-link"
						on:click={() => (active = link.title)}
						class:active={activeCategory === link.title}
						href={link.path}
					>
						{link.displayTitle}
					</a>
				{/each}
			</div>
			<a class="mr-3 menu-link" href="{base}/about">About Collens</a>
			<FeedbackButton showButton={isDesktop} />

			<!-- <DaisyUIThemeSwitcher class="z-50 ml-auto sm:ml-14 " /> -->

			<!-- <Login /> -->
		</header>
	</div>
</nav>

<style>
	.menu-link {
		@apply text-base-100 text-opacity-80 hover:text-opacity-100 font-medium transition hover:text-secondary cursor-pointer;
	}

	.menu-link.active {
		@apply text-primary;
	}

	/* Frosted navigation header */
	nav {
		z-index: 10000;
		position: sticky;
		left: 0;
		right: 0;
		top: 0;
		@apply bg-primary;
		--filter: blur(90px) saturate(160%) brightness(1.3);
		backdrop-filter: var(--filter);
		/* height: 100px; */
	}
</style>
