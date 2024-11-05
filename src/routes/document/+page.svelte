<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { indexedDBStore, type Folder, type FileData } from '$lib/stores/indexeddb-store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SettingsBar from '$components/SettingsBar.svelte';
	// import ImageSidebar from '$lib/components/ImageSidebar.svelte';
	import Witness from './Witness.svelte';

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
		<!-- Content -->
		<div class="h-full pl-[350px] flex gap-8 overflow-x-auto pr-10" on:wheel={handleWheel}>
			<Witness />
			<!-- <div class="bg-blue-400 w-[500px] my-6 rounded p-4 flex-shrink-0">w2</div>
			<div class="bg-blue-500 w-[500px] my-6 rounded p-4 flex-shrink-0">w3</div> -->
		</div>

		<div class="absolute top-4 bottom-4 left-4 flex gap-8 overflow-x-auto pr-10">
			<SettingsBar />
		</div>
	{/if}
</div>

<style>
	/* Add any additional styles here if needed */
</style>
