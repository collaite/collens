<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { indexedDBStore, type Folder, type FileData } from '$lib/stores/indexeddb-store';
	import { witnessesStore } from '$lib/stores/witnesses.store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SettingsBar from './SettingsBar.svelte';
	import Witness from './Witness.svelte';
	import DragDropFolder from '$lib/components/DragDropFolder.svelte';

	let selectedDocument: Folder | undefined;
	let witnesses = [];
	let loading = true;
	let error = '';

	// Function to handle wheel event and transform vertical scroll to horizontal
	function handleWheel(event: WheelEvent) {
		event.preventDefault(); // Prevent the default vertical scroll
		const container = event.currentTarget as HTMLElement;
		container.scrollLeft += event.deltaY;
	}

	async function loadDocument(id: string) {
		try {
			await indexedDBStore.init();
			selectedDocument = $indexedDBStore.find((folder) => folder.id === id);

			if (selectedDocument) {
				witnesses = await witnessesStore.getWitnessesFromDocument(selectedDocument);
			} else {
				error = 'Document not found.';
			}
		} catch (e) {
			console.error('Error loading document:', e);
			error = 'An error occurred while loading the document.';
		} finally {
			loading = false;
		}
	}

	// Load document on mount and when URL changes
	onMount(() => {
		const documentId = $page.url.searchParams.get('id');
		if (documentId) {
			loadDocument(documentId);
		}
	});

	// React to URL changes
	$: {
		const documentId = $page.url.searchParams.get('id');
		if (documentId && !selectedDocument) {
			loadDocument(documentId);
		}
	}

	function handleFolderDropped(event: CustomEvent) {
		const { files } = event.detail;
		const folder: Folder = {
			id: crypto.randomUUID(),
			files,
			title: 'Untitled Document',
			description: 'No description available'
		};
		indexedDBStore.addFolder(folder);
		goto(`${base}/document?id=${folder.id}`);
	}

	function handleFileSelect(witnessId: string, file: FileData) {
		witnessesStore.updateWitnessFile(witnessId, file);
	}

	function handleWitnessToggle(event: CustomEvent<{ id: string }>) {
		witnessesStore.toggleWitness(event.detail.id);
	}

	import type { WitnessStats } from '$lib/utils/witness-utils';

	interface WitnessData {
		id: string;
		title: string;
		enabled: boolean;
		metrics: WitnessStats;
	}

	$: settingsWitnesses = $witnessesStore.map((w) => ({
		id: w.folder.id.split('_')[1], // Just use the number part
		title: w.folder.title || '',
		enabled: w.enabled,
		metrics: w.metrics
	}));
</script>

<div class="relative overflow-x-auto">
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<p class="text-2xl">Loading...</p>
		</div>
	{:else if error}
		<div class="flex h-full items-center justify-center">
			<p class="text-2xl text-red-500">{error}</p>
		</div>
	{:else if !selectedDocument}
		<div class="flex h-full items-center justify-center">
			<DragDropFolder on:folderDropped={handleFolderDropped} />
		</div>
	{:else if $witnessesStore.length === 0}
		<div class="flex h-full items-center justify-center">
			<p class="text-2xl text-red-500">No witnesses found in this document.</p>
		</div>
	{:else}
		<!-- Content -->
		<div class="flex gap-8 overflow-x-auto py-4 pl-[340px] pr-10" style="height:calc(100vh - 63px)">
			<!-- on:wheel={handleWheel} -->
			{#each $witnessesStore.filter((w) => w.enabled) as { folder, selectedFile }, index (folder.id)}
				<Witness
					selectedFolder={folder}
					{selectedFile}
					getImageFiles={witnessesStore.getImageFiles}
					on:fileSelect={(e) => handleFileSelect(folder.id, e.detail)}
				/>
			{/each}
		</div>

		<div class="absolute bottom-4 left-4 top-4 flex gap-8 overflow-x-auto pr-10">
			<SettingsBar witnesses={settingsWitnesses} on:toggleWitness={handleWitnessToggle} />
		</div>
	{/if}
</div>

<style>
	/* Add any additional styles here if needed */
</style>
