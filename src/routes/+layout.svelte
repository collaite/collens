<script lang="ts">
	import '$lib/assets/css/app.css';
	import '$lib/assets/css/code-highlighted-prisma.css';
	import Header from '$lib/components/Header.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import GlobalToast from '$lib/components/GlobalToast.svelte';
</script>

<GlobalToast />

<div
	class="grid h-dvh w-dvw grid-rows-[auto_auto_1fr] sm:grid-rows-[auto_1fr] overflow-hidden relative"
>
	<Header />
	<SideMenu />
	<slot>
		<!-- Content here -->
	</slot>
</div>
