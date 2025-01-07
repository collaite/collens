<script lang="ts">
	import { getWitnessLabel } from '$lib/utils/witness-utils';

	export let witnessId: string;
	export let witnessTitle: string;
	export let showMiddleColumn: boolean;
</script>

<div
	class="flex items-center justify-between rounded-lg bg-[#0f1419] px-3 py-1.5 text-white shadow-md"
>
	<h1 class="truncate text-base font-bold">{getWitnessLabel(witnessId)} - {witnessTitle}</h1>
</div>
