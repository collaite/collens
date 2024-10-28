<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { indexedDBStore, type Folder, type FileData } from '$lib/stores/indexeddb-store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let selectedFolder: Folder | undefined;
	let selectedFile: FileData | undefined;
	let loading = true;
	let error = '';

	function isImageFile(file: FileData): boolean {
		const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'image/avif'];
		return imageTypes.includes(file.type);
	}

	// Function to handle wheel event and transform vertical scroll to horizontal
	function handleWheel(event: WheelEvent) {
		event.preventDefault(); // Prevent the default vertical scroll
		const container = event.currentTarget as HTMLElement;
		container.scrollLeft += event.deltaY;
	}

	onMount(async () => {
		try {
			await indexedDBStore.init();
			const folderId = $page.url.searchParams.get('id');
			if (folderId) {
				selectedFolder = $indexedDBStore.find((folder) => folder.id === folderId);
				if (selectedFolder && selectedFolder.files) {
					const imageFiles = selectedFolder.files.filter(isImageFile);
					if (imageFiles.length > 0) {
						selectedFile = imageFiles[0];
					} else {
						error = 'No image files found in the folder.';
					}
				} else {
					error = 'Folder not found or empty.';
				}
			} else {
				error = 'No folder ID provided.';
			}
		} catch (e) {
			error = 'An error occurred while loading the folder.';
			console.error(e);
		} finally {
			loading = false;
		}
	});

	function goBack() {
		goto(`${base}/`);
	}

	function getImageFiles(folder: Folder): FileData[] {
		return (folder.files || []).filter(isImageFile);
	}
</script>

<div class="relative">
	{#if loading}
		<div class="flex items-center justify-center h-full">
			<p class="text-2xl">Loading...</p>
		</div>
	{:else if error}
		<div class="flex items-center justify-center h-full">
			<p class="text-2xl text-red-500">{error}</p>
		</div>
	{:else if selectedFolder}
		<!-- Back button -->
		<!-- <button
			class="absolute top-4 left-4 z-10 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-focus"
			on:click={goBack}
		>
			Back
		</button> -->

		<!-- Content -->
		<div
			class="absolute top-0 right-0 bottom-0 left-0 pl-[230px] flex gap-8 overflow-x-auto pr-10"
			on:wheel={handleWheel}
		>
			<div class="my-4 flex-shrink-0">
				{#if selectedFile}
					<img
						draggable="false"
						class="w-[500px] h-auto drop-shadow-custom"
						src={selectedFile.src}
						alt={selectedFile.name}
					/>
				{/if}
			</div>
			<div class="bg-blue-300 w-[500px] my-6 rounded p-4 flex-shrink-0">w1</div>
			<div class="bg-blue-400 w-[500px] my-6 rounded p-4 flex-shrink-0">w2</div>
			<div class="bg-blue-500 w-[500px] my-6 rounded p-4 flex-shrink-0">w3</div>
		</div>

		<!-- Page selector -->
		<div
			class="w-[200px] bg-primary/60 rounded-lg backdrop-blur-xl grid grid-rows-[1fr_auto] overflow-hidden absolute top-4 left-4 bottom-4 p-4"
		>
			<!-- Pages -->
			<div class="overflow-auto">
				{#each getImageFiles(selectedFolder) as file, index}
					<button class="mb-4 w-full" on:click={() => (selectedFile = file)}>
						<img
							draggable="false"
							class="w-full h-auto drop-shadow-custom rounded-lg border-4 border-transparent select-none hover:border-white transition"
							class:!border-secondary={selectedFile === file}
							src={file.src}
							alt={file.name}
						/>
						<span class="text-white">{index + 1}</span>
					</button>
				{/each}
			</div>
			<!-- Logos -->
			<div class="mt-4 flex gap-4">
				<a href="https://www.huygens.knaw.nl/en/" target="_blank">
					<img class="h-6" src="{base}/images/huygens-light.png" alt="Huygens" />
				</a>
				<a href="https://www.esciencecenter.nl/" target="_blank">
					<img class="h-6" src="{base}/images/escience-light.png" alt="eScience Center" />
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Add any additional styles here if needed */
</style>
