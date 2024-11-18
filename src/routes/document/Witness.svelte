<script lang="ts">
	import { foldersStore } from '$lib/stores/documents.store';
	import ImageSidebar from './ImageSidebar.svelte';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';
	import Toggle from '$lib/components/Toggle.svelte';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import {
		getWitnessLabel,
		getPageNumber,
		loadXMLContent,
		parseTEIXML,
		WITNESS_VIEWS,
		type WitnessView
	} from '$lib/utils/witness-utils';

	import MdiEyeOffOutline from '~icons/mdi/eye-off-outline';
	import PhEyeBold from '~icons/ph/eye-bold';

	export let selectedFile: FileData | undefined = undefined;
	export let selectedFolder: Folder | undefined = undefined;
	export let getImageFiles: (folder: Folder) => FileData[];

	$: imageFiles = selectedFolder ? getImageFiles(selectedFolder) : [];
	$: witnessId = selectedFolder?.id?.replace('witness_', '') || '1';
	$: witnessTitle = selectedFolder?.title || 'Witness title';

	let currentView: WitnessView = 'transcription';
	let showMiddleColumn = true;
	let xmlContent: string | null = null;
	let showParsedText = true;

	$: if (selectedFolder) {
		loadXMLContent(selectedFolder).then((content) => {
			xmlContent = content;
		});
	}

	$: parsedContent = xmlContent ? parseTEIXML(xmlContent, showParsedText) : null;

	function handleImageSelect(event: CustomEvent<FileData>) {
		selectedFile = event.detail;
	}

	function handleViewChange(view: WitnessView) {
		currentView = view;
	}

	function toggleMiddleColumn() {
		showMiddleColumn = !showMiddleColumn;
	}
</script>

<div class="flex h-full flex-shrink-0 flex-col gap-1">
	<!-- Header -->
	<div
		class="flex items-center justify-between rounded-lg bg-[#0f1419] px-3 py-1.5 text-white shadow-md"
	>
		<h1 class="truncate text-base font-bold">{getWitnessLabel(witnessId)} - {witnessTitle}</h1>
		<div class="ml-2 flex items-center gap-1.5">
			<!-- Stats -->
			<div class="mr-4 flex gap-2">
				<button
					class="h-4 w-4 rounded-full bg-error opacity-90 transition-all hover:opacity-100"
					title="Delete witness"
					aria-label="Delete witness"
				/>
				<button
					class="h-4 w-4 rounded-full bg-info opacity-90 transition-all hover:opacity-100"
					title="Compare witnesses"
					aria-label="Compare witnesses"
				/>
				<button
					class="h-4 w-4 rounded-full bg-success opacity-90 transition-all hover:opacity-100"
					title="Add annotation"
					aria-label="Add annotation"
				/>
			</div>

			<button
				class="h-4 w-4 rounded-full bg-base-content/20 transition-all hover:bg-base-content/30"
				title="Toggle image view"
				aria-label="Toggle image view"
				on:click={toggleMiddleColumn}
			>
				{#if showMiddleColumn}
					<PhEyeBold />
				{:else}
					<MdiEyeOffOutline />
				{/if}
			</button>
		</div>
	</div>

	<!-- Main content -->
	<div class="flex min-h-0 flex-1 gap-2">
		<!-- Left sidebar with thumbnails -->
		<div class="w-[160px] flex-shrink-0">
			<ImageSidebar
				{selectedFolder}
				{selectedFile}
				{getImageFiles}
				on:imageSelect={handleImageSelect}
			/>
		</div>

		<!-- Middle section with selected image -->
		{#if showMiddleColumn}
			<div class="relative flex-1 flex-shrink-0 transition-all duration-200">
				{#if selectedFile}
					<div class="relative flex h-full w-full items-start justify-center">
						<img
							draggable="false"
							class="h-full w-[500px] min-w-[500px] rounded-lg object-contain object-top"
							src={selectedFile.src}
							alt="Page {selectedFile ? getPageNumber(selectedFile) : ''} of {witnessTitle}"
							style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));"
						/>
						<div class="absolute left-2 top-2 flex items-center gap-2">
							<span class="rounded bg-[#0f1419]/80 px-2 py-0.5 text-sm font-medium text-white">
								{getWitnessLabel(witnessId)} - Page {selectedFile
									? getPageNumber(selectedFile)
									: ''}
							</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Right section with text -->
		<div
			class="flex w-[650px] flex-shrink-0 flex-col overflow-hidden rounded-lg bg-[#E6E2CF]"
			style="filter: drop-shadow(rgba(0, 0, 0, 0.2) 0px 10px 14px)"
		>
			<div class="sticky top-0 z-10 border-b border-base-300 bg-base-200 px-4 py-2">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-base font-bold">
							{getWitnessLabel(witnessId)} - Page {selectedFile ? getPageNumber(selectedFile) : ''}
						</h2>
						<div class="mt-0.5 flex items-center gap-2 text-xs">
							{#each WITNESS_VIEWS as view, i}
								{#if i > 0}
									<span class="text-base-content/30" aria-hidden="true">•</span>
								{/if}
								<button
									class="text-base-content/60 transition-colors hover:text-base-content {currentView ===
									view.id
										? 'font-medium !text-primary'
										: ''}"
									on:click={() => handleViewChange(view.id)}
									aria-current={currentView === view.id}
								>
									{view.label}
								</button>
							{/each}
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Toggle label="Show TEI" class="scale-75" bind:checked={showParsedText} />
					</div>
				</div>
			</div>
			<div class="flex-1 overflow-y-auto" role="region" aria-label={currentView}>
				<div class="p-4">
					{#if currentView === 'xml'}
						{#if xmlContent}
							<CodeHighlight code={xmlContent} language="xml" />
						{:else}
							<div class="py-8 text-center text-base-content/60">Loading XML content...</div>
						{/if}
					{:else if xmlContent && !showParsedText}
						<CodeHighlight code={xmlContent} language="xml" />
					{:else if parsedContent}
						<div class="prose max-w-none">
							<div class="whitespace-pre-wrap font-serif leading-relaxed text-base-content">
								{parsedContent}
							</div>
						</div>
					{:else}
						<div class="py-8 text-center text-base-content/60">Loading transcription...</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.prose) {
		max-width: none;
	}
	:global(.prose p) {
		margin: 0;
	}
</style>
