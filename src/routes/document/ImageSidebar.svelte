<script lang="ts">
	import { base } from '$app/paths';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';
	import { createEventDispatcher } from 'svelte';
	import { getPageNumber } from '$lib/utils/witness-utils';
	import PhEyeBold from '~icons/ph/eye-bold';
	import MdiEyeOffOutline from '~icons/mdi/eye-off-outline';

	const dispatch = createEventDispatcher<{
		imageSelect: FileData;
		toggleView: void;
	}>();

	export let selectedFolder: Folder | undefined;
	export let selectedFile: FileData | undefined;
	export let getImageFiles: (folder: Folder) => FileData[];
	export let showMiddleColumn: boolean;

	let imagesContainer: HTMLElement;
	let thumbnailElements: Record<string, HTMLElement> = {};

	$: imageFiles = selectedFolder
		? getImageFiles(selectedFolder).sort((a, b) => {
				const pageA = parseInt(getPageNumber(a)) || 0;
				const pageB = parseInt(getPageNumber(b)) || 0;
				return pageA - pageB;
			})
		: [];

	$: if (selectedFile && thumbnailElements[selectedFile.name]) {
		const thumbnailElement = thumbnailElements[selectedFile.name];
		thumbnailElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	function handleImageClick(file: FileData) {
		dispatch('imageSelect', file);
	}

	function toggleMiddleColumn() {
		dispatch('toggleView');
	}
</script>

<div class="flex h-full flex-col rounded-lg bg-base-200">
	<!-- Pages -->
	{#if selectedFolder && imageFiles.length > 0}
		<div class="flex-1 space-y-1 overflow-y-auto p-1" bind:this={imagesContainer}>
			{#each imageFiles as file, index}
				<div bind:this={thumbnailElements[file.name]} class="group relative aspect-[4/5] w-full">
					<div
						class="h-full w-full cursor-pointer"
						on:click={() => handleImageClick(file)}
						on:keydown={(e) => e.key === 'Enter' && handleImageClick(file)}
						role="button"
						tabindex="0"
						aria-label="Select image {index + 1}"
					>
						<img
							draggable="false"
							class="h-full w-full rounded border-2 object-contain transition-all duration-200 {selectedFile ===
							file
								? 'border-primary shadow-lg'
								: 'border-transparent hover:border-primary/50'}"
							src={file.src}
							alt={file.name}
						/>
					</div>
					<div class="absolute left-0 top-0">
						<div
							class="flex h-5 w-5 items-center justify-center rounded-br bg-base-300/90 text-xs font-medium"
						>
							{index + 1}
						</div>
					</div>
					<div class="absolute bottom-0 right-0">
						<button
							class="mb-1 mr-1 flex size-9 items-center justify-center rounded rounded-tl bg-base-300/60 transition-all hover:bg-base-300"
							title="Toggle image view"
							aria-label="Toggle image view"
							on:click={toggleMiddleColumn}
						>
							{#if showMiddleColumn}
								<PhEyeBold class="size-5" />
							{:else}
								<MdiEyeOffOutline class="size-5" />
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center p-4 text-center text-base-content/60">
			No images available
		</div>
	{/if}
</div>
