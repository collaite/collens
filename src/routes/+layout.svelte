<script lang="ts">
	import '$lib/assets/css/app.css';
	import '$lib/assets/css/code-highlighted-prisma.css';
	import Header from '$lib/components/Header.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import GlobalToast from '$lib/components/GlobalToast.svelte';
	import { env } from '$env/dynamic/public';
</script>

<Analytics />
<GlobalToast />

<div class="grid h-dvh w-dvw grid-rows-[auto_auto_1fr] overflow-hidden relative">
	<Header />
	<SideMenu />
	<slot>
		<!-- Content here -->
	</slot>
	{#if env.PUBLIC_LOCALHOST}
		<div class="bg-warning text-warning-content fixed bottom-0 left-0 w-full pl-4 text-xs">
			dev database
		</div>
	{/if}
</div>
