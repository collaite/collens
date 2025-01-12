<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import { getPageNumber } from '$lib/utils/witness-utils';
	import MaximizeIcon from '~icons/lucide/maximize-2';
	import ZoomInIcon from '~icons/lucide/zoom-in';
	import ZoomOutIcon from '~icons/lucide/zoom-out';
	import { onMount } from 'svelte';

	export let selectedFile: FileData | undefined;
	export let witnessId: string;

	let modalOpen = false;
	let zoomLevel = 1;
	let imageElement: HTMLImageElement;
	let containerElement: HTMLDivElement;

	function calculateFitZoom() {
		if (imageElement && containerElement) {
			const containerAspect = containerElement.clientWidth / containerElement.clientHeight;
			const imageAspect = imageElement.naturalWidth / imageElement.naturalHeight;

			if (imageAspect > containerAspect) {
				// Image is wider than container
				return containerElement.clientWidth / imageElement.naturalWidth;
			} else {
				// Image is taller than container
				return containerElement.clientHeight / imageElement.naturalHeight;
			}
		}
		return 1;
	}

	function handleImageLoad() {
		zoomLevel = calculateFitZoom();
	}

	function handleModalOpen() {
		modalOpen = true;
		// Wait for modal transition to complete before calculating zoom
		setTimeout(() => {
			zoomLevel = calculateFitZoom();
		}, 100);
	}

	function handleModalClose() {
		modalOpen = false;
		zoomLevel = 1;
	}

	onMount(() => {
		if (imageElement) {
			if (imageElement.complete) {
				handleImageLoad();
			} else {
				imageElement.addEventListener('load', handleImageLoad);
			}
		}
	});
</script>

<div class="relative flex-1 flex-shrink-0 transition-all duration-200">
	<!-- Modal for full screen view -->
	<dialog id="image_modal" class="modal" class:modal-open={modalOpen}>
		<div class="modal-box relative h-screen w-screen max-w-full overflow-hidden bg-base-200 p-0">
			<div class="absolute right-4 top-4 z-20 flex gap-2">
				<div class="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2 backdrop-blur">
					<ZoomOutIcon class="h-4 w-4" />
					<input
						type="range"
						min="1"
						max="4"
						step="0.1"
						class="range range-sm w-32"
						bind:value={zoomLevel}
					/>
					<ZoomInIcon class="h-4 w-4" />
					<span class="min-w-[3ch] text-sm">{Math.round(zoomLevel * 100)}%</span>
				</div>
				<button class="btn btn-circle btn-ghost" on:click={handleModalClose}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			{#if selectedFile}
				<div
					class="h-full w-full overflow-auto"
					style="scroll-behavior: smooth;"
					bind:this={containerElement}
				>
					<div
						class="flex min-h-full min-w-full items-center justify-center"
						style="min-width: {100 * zoomLevel}%; min-height: {100 * zoomLevel}%;"
					>
						<img
							draggable="false"
							class="h-auto w-full max-w-none object-contain transition-transform duration-200"
							bind:this={imageElement}
							src={selectedFile.src}
							alt="Page {getPageNumber(selectedFile)} of {witnessId}"
						/>
					</div>
				</div>
			{/if}
		</div>
		<form method="dialog" class="modal-backdrop">
			<button on:click={handleModalClose}>close</button>
		</form>
	</dialog>

	{#if selectedFile}
		<div class="group relative flex h-full w-full items-start justify-center">
			<button
				class="btn btn-circle btn-ghost absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
				on:click={handleModalOpen}
			>
				<MaximizeIcon class="h-5 w-5" />
			</button>
			<img
				draggable="false"
				class="h-full w-[500px] min-w-[500px] cursor-pointer rounded-lg object-contain object-top"
				src={selectedFile.src}
				alt="Page {selectedFile ? getPageNumber(selectedFile) : ''} of {witnessId}"
				style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));"
				on:click={() => (modalOpen = true)}
			/>
			<!-- <div class="absolute left-2 top-2 flex items-center gap-2">
				<span class="rounded bg-[#0f1419]/80 px-2 py-0.5 text-sm font-medium text-white">
					{witnessId} - Page {selectedFile ? getPageNumber(selectedFile) : ''}
				</span>
			</div> -->
		</div>
	{/if}
</div>
