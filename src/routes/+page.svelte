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
	import FolderCard from '$lib/components/FolderCard.svelte';

	onMount(() => {
		indexedDBStore.init();
	});

	async function handleFolderDropped(event: CustomEvent<{ files: FileData[] }>) {
		const { files } = event.detail;
		const newFolder: Folder = { id: Date.now().toString(), files };
		await indexedDBStore.addFolder(newFolder);
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
						{#each $indexedDBStore as folder}
							<FolderCard {folder} onRemove={removeFolder} />
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
