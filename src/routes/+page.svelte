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
	import FolderCard from '../lib/components/FolderCard.svelte';

	onMount(() => {
		indexedDBStore.init();
	});

	async function handleFolderDropped(event: CustomEvent<{ files: FileData[] }>) {
		const { files } = event.detail;
		const newFolder: Folder = { id: Date.now().toString(), files };
		await indexedDBStore.addFolder(newFolder);
	}
</script>

<div class="flex flex-col items-center justify-center overflow-auto">
	<div class="overflow-y-auto overflow-x-hidden px-10">
		<div class="mb-6 mt-20 flex flex-col items-center">
			<h1 class="mb-5 text-5xl font-bold">COLLens</h1>
			<p class="mb-5">Visualization tool for COLLaiTE.</p>
		</div>
		<div class=" text-center">
			<div class="text-primary">
				<div class="mt-8">
					{#if $indexedDBStore.length === 0}
						<p class="text-gray-600">
							No files loaded yet. Drag and drop files or folders to get started.
						</p>
					{:else}
						<div class="flex flex-wrap justify-center gap-20">
							{#each $indexedDBStore as folder}
								<div class=" w-72">
									<FolderCard {folder} onRemove={removeFolder} />
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="mx-auto mt-32 max-w-[350px]">
			<DragDropFolder on:folderDropped={handleFolderDropped} />
		</div>
	</div>

	<div class="flex-1"></div>
	<!-- Logos -->
	<div class="m-4 flex gap-4">
		<a href="https://www.huygens.knaw.nl/en/" target="_blank">
			<img class="h-10" src="{base}/images/huygens-dark.svg" alt="Huygens" />
		</a>
		<a href="https://www.esciencecenter.nl/" target="_blank">
			<img class="h-10" src="{base}/images/escience-dark.png" alt="Huygens" />
		</a>
	</div>
</div>

<style>
	/* Add any additional styles here if needed */
</style>
