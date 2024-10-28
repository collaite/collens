<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		indexedDBStore,
		removeFolder,
		type FileData,
		type Folder
	} from '$lib/stores/indexeddb-store';
	import DragDropFolder from '$lib/components/DragDropFolder.svelte';

	onMount(() => {
		indexedDBStore.init();
	});

	async function handleFolderDropped(event: CustomEvent<{ files: FileData[] }>) {
		const { files } = event.detail;
		const newFolder: Folder = { id: Date.now().toString(), files };
		await indexedDBStore.addFolder(newFolder);
	}

	function isImageFile(file: FileData): boolean {
		const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'image/avif'];
		return imageTypes.includes(file.type);
	}

	function getVisibleImages(folder: Folder) {
		return (folder.files || []).filter(isImageFile).slice(0, 3);
	}

	function getFileStats(folder: Folder) {
		const files = folder.files || [];
		const imageCount = files.filter(isImageFile).length;
		return {
			total: files.length,
			images: imageCount,
			other: files.length - imageCount
		};
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen overflow-auto -mt-28">
	<div class="hero min-h-screen">
		<div class="hero-content text-neutral-content text-center">
			<div class="max-w-md text-primary">
				<h1 class="mb-5 text-5xl font-bold">COLLens</h1>
				<p class="mb-5">Visualization tool for COLLaiTE.</p>
				<a class="btn btn-primary btn-md" href="{base}/document">Open Document</a>

				<DragDropFolder on:folderDropped={handleFolderDropped} />

				<div class="mt-8">
					{#if $indexedDBStore.length === 0}
						<p class="text-gray-600">
							No files loaded yet. Drag and drop files or folders to get started.
						</p>
					{:else}
						{#each $indexedDBStore as folder, index}
							<div class="mb-8 p-4 bg-gray-100 rounded-lg relative">
								<h2 class="text-lg font-semibold mb-2">Folder {index + 1}</h2>
								<button
									class="absolute top-2 right-2 text-red-500 hover:text-red-700"
									on:click={() => removeFolder(folder.id)}
								>
									Remove
								</button>
								<a href="{base}/document?id={folder.id}" class="block">
									<div class="grid grid-cols-3 gap-4">
										{#each getVisibleImages(folder) as file}
											<img
												src={file.src}
												alt={file.name}
												class="w-full h-auto rounded-lg shadow-md"
											/>
										{/each}
									</div>
									{#if folder.files}
										{@const stats = getFileStats(folder)}
										<div class="mt-4 text-sm text-gray-600">
											<p>Total files: {stats.total}</p>
											<p>Images: {stats.images}</p>
											<p>Other files: {stats.other}</p>
										</div>
									{/if}
								</a>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
	<!-- Logos -->
	<div class="mt-4 flex gap-4">
		<a href="https://www.huygens.knaw.nl/en/" target="_blank">
			<img class="h-10" src="{base}/images/huygens-dark.png" alt="Huygens" />
		</a>
		<a href="https://www.esciencecenter.nl/" target="_blank">
			<img class="h-10" src="{base}/images/escience-dark.png" alt="Huygens" />
		</a>
	</div>
</div>

<style>
	/* Add any additional styles here if needed */
</style>
