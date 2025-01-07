<script lang="ts">
	import { getWitnessLabel } from '$lib/utils/witness-utils';
	import MdiEyeOffOutline from '~icons/mdi/eye-off-outline';
	import PhEyeBold from '~icons/ph/eye-bold';

	export let witnessId: string;
	export let witnessTitle: string;
	export let showMiddleColumn: boolean;

	function toggleMiddleColumn() {
		showMiddleColumn = !showMiddleColumn;
	}
</script>

<div
	class="flex items-center justify-between rounded-lg bg-[#0f1419] px-3 py-1.5 text-white shadow-md"
>
	<h1 class="truncate text-base font-bold">{getWitnessLabel(witnessId)} - {witnessTitle}</h1>
	<div class="ml-2 flex items-center gap-1.5">
		<!-- Stats -->
		<!-- <div class="mr-4 flex gap-2">
			<button
				class="size-5 rounded-full bg-error opacity-90 transition-all hover:opacity-100"
				title="Delete witness"
				aria-label="Delete witness"
			> -->
		<!-- 2 -->
		<!-- </button>
			<button
				class="size-5 rounded-full bg-info opacity-90 transition-all hover:opacity-100"
				title="Compare witnesses"
				aria-label="Compare witnesses"
			> -->
		<!-- 2 -->
		<!-- </button>
			<button
				class="size-5 rounded-full bg-success opacity-90 transition-all hover:opacity-100"
				title="Add annotation"
				aria-label="Add annotation"
			> -->
		<!-- 2 -->
		<!-- </button> -->
		<!-- </div> -->

		<button
			class="h-4 w-4 rounded-full bg-base-content/20 transition-all hover:bg-base-content/30"
			title="Toggle image view"
			aria-label="Toggle image view"
			on:click={toggleMiddleColumn}
		>
			{#if showMiddleColumn}
				<PhEyeBold />
			{:else}
				<MdiEyeOffOutline />
			{/if}
		</button>
	</div>
</div>
