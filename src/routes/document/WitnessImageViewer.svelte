<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import { getPageNumber } from '$lib/utils/witness-utils';

	export let selectedFile: FileData | undefined;
	export let witnessId: string;
</script>

<div class="relative flex-1 flex-shrink-0 transition-all duration-200">
	{#if selectedFile}
		<div class="relative flex h-full w-full items-start justify-center">
			<img
				draggable="false"
				class="h-full w-[500px] min-w-[500px] rounded-lg object-contain object-top"
				src={selectedFile.src}
				alt="Page {selectedFile ? getPageNumber(selectedFile) : ''} of {witnessId}"
				style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));"
			/>
			<!-- <div class="absolute left-2 top-2 flex items-center gap-2">
				<span class="rounded bg-[#0f1419]/80 px-2 py-0.5 text-sm font-medium text-white">
					{witnessId} - Page {selectedFile ? getPageNumber(selectedFile) : ''}
				</span>
			</div> -->
		</div>
	{/if}
</div>
