<script lang="ts">
	import { base } from '$app/paths';
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
	<div class="relative mx-auto px-4 py-2">
		<!--Desktop Header-->
		<header class="flex items-center gap-3 px-2 sm:px-0">
			<button
				class="rounded-md p-2 transition-colors duration-200 hover:bg-base-200 sm:hidden"
				on:click={toggleMenu}
				aria-label="Open menu"
			>
				<IconamoonMenuBurgerHorizontalBold class="size-6" />
			</button>
			<a
				class="no-drag mr-3 h-auto max-w-[140px] flex-initial flex-shrink-0 select-none sm:max-w-[160px]"
				href="{base}/"
			>
				<Logo />
			</a>

			<!-- Desktop menu -->
			<div class="z-10 hidden w-full flex-1 justify-end space-x-4 sm:flex lg:space-x-8">
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
			<a class="menu-link mr-3" href="{base}/about">About Collens</a>
			<FeedbackButton showButton={isDesktop} />

			<!-- <DaisyUIThemeSwitcher class="z-50 ml-auto sm:ml-14 " /> -->

			<!-- <Login /> -->
		</header>
	</div>
</nav>

<style>
	.menu-link {
		@apply cursor-pointer font-medium text-base-100 text-opacity-80 transition hover:text-secondary hover:text-opacity-100;
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
