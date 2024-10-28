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

<style lang="postcss">
	.menu-link {
		@apply text-base-content text-opacity-80 hover:text-opacity-100 font-medium transition hover:text-secondary cursor-pointer;
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

	/* Frosted Navigation bar */
	.bien-glass {
		position: absolute;
		inset: 0;
		/*   Extend the backdrop to the bottom for it to "collect the light" outside of the nav */
		--extended-by: 100px;
		bottom: calc(-1 * var(--extended-by));

		--filter: blur(30px);
		-webkit-backdrop-filter: var(--filter);
		backdrop-filter: var(--filter);
		pointer-events: none;

		/*   Cut the part of the backdrop that falls outside of <nav /> */
		--cutoff: calc(100% - var(--extended-by));
		-webkit-mask-image: linear-gradient(
			to bottom,
			black 0,
			black var(--cutoff),
			transparent var(--cutoff)
		);
	}

	.bien-glass-edge {
		position: absolute;
		z-index: -1;
		left: 0;
		right: 0;

		--extended-by: 80px;
		--offset: 20px;
		--thickness: 2px;
		height: calc(var(--extended-by) + var(--offset));
		/*   Offset is used to snuck the border backdrop slightly under the main backdrop for  smoother effect */
		top: calc(100% - var(--offset) + var(--thickness));

		/*   Make the blur bigger so that the light bleed effect spreads wider than blur on the first backdrop */
		/*   Increase saturation and brightness to fake smooth chamfered edge reflections */
		--filter: blur(90px) saturate(160%) brightness(1.3);
		-webkit-backdrop-filter: var(--filter);
		backdrop-filter: var(--filter);
		pointer-events: none;

		-webkit-mask-image: linear-gradient(
			to bottom,
			black 0,
			black var(--offset),
			transparent var(--offset)
		);
	}
</style>
