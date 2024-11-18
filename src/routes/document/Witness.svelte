<script lang="ts">
	import { foldersStore } from '$lib/stores/documents.store';
	import ImageSidebar from './ImageSidebar.svelte';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';
	import Toggle from '$lib/components/Toggle.svelte';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import HeaderEntry from './HeaderEntry.svelte';
	import {
		getWitnessLabel,
		getPageNumber,
		loadXMLContent,
		parseTEIXML,
		parseTEIHeader,
		WITNESS_VIEWS,
		type WitnessView
	} from '$lib/utils/witness-utils';

	import MdiEyeOffOutline from '~icons/mdi/eye-off-outline';
	import PhEyeBold from '~icons/ph/eye-bold';

	export let selectedFile: FileData | undefined = undefined;
	export let selectedFolder: Folder | undefined = undefined;
	export let getImageFiles: (folder: Folder) => FileData[];

	// Sort image files numerically by page number
	$: imageFiles = selectedFolder
		? getImageFiles(selectedFolder).sort((a, b) => {
				const pageA = parseInt(getPageNumber(a)) || 0;
				const pageB = parseInt(getPageNumber(b)) || 0;
				return pageA - pageB;
			})
		: [];

	$: witnessId = selectedFolder?.id?.replace('witness_', '') || '1';
	$: witnessTitle = selectedFolder?.title || 'Witness title';

	let currentView: WitnessView = 'transcription';
	let showMiddleColumn = true;
	let xmlContent: string | null = null;
	let showParsedText = true;
	let transcriptionContainer: HTMLElement;
	let isScrolling = false; // Flag to prevent scroll handler during programmatic scrolling

	$: if (selectedFolder) {
		loadXMLContent(selectedFolder).then((content) => {
			xmlContent = content;
		});
	}

	$: parsedContent = xmlContent ? parseTEIXML(xmlContent, showParsedText) : null;
	$: headerEntries = xmlContent ? parseTEIHeader(xmlContent) : [];

	// Function to scroll to a specific page in the transcription
	function scrollToPage(pageNumber: string) {
		if (!transcriptionContainer) return;

		isScrolling = true; // Set flag to prevent scroll handler
		const text = transcriptionContainer.innerText;
		const pageMarker = `[Page ${pageNumber}]`;
		const pageIndex = text.indexOf(pageMarker);

		if (pageIndex !== -1) {
			// Calculate approximate scroll position based on text position
			const textBeforePage = text.substring(0, pageIndex);
			const lineHeight = 24; // Approximate line height in pixels
			const linesBeforePage = textBeforePage.split('\n').length;
			const scrollPosition = linesBeforePage * lineHeight;

			transcriptionContainer.scrollTo({
				top: scrollPosition - 100, // Offset by 100px to show some context above
				behavior: 'smooth'
			});

			// Reset scroll flag after animation
			setTimeout(() => {
				isScrolling = false;
			}, 1000); // Adjust timeout based on scroll animation duration
		}
	}

	function handleImageSelect(event: CustomEvent<FileData>) {
		selectedFile = event.detail;
		const pageNumber = getPageNumber(event.detail);
		if (pageNumber) {
			scrollToPage(pageNumber);
		}
	}

	function handleViewChange(view: WitnessView) {
		currentView = view;
	}

	function toggleMiddleColumn() {
		showMiddleColumn = !showMiddleColumn;
	}

	// Function to find the current visible page number based on scroll position
	function handleScroll(event: Event) {
		if (!transcriptionContainer || !imageFiles.length || isScrolling) return;

		const text = transcriptionContainer.innerText;
		const scrollTop = transcriptionContainer.scrollTop;
		const scrollHeight = transcriptionContainer.scrollHeight;
		const clientHeight = transcriptionContainer.clientHeight;
		const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

		// Find all page markers in the text
		const pageMarkers = text.match(/\[Page (\d+)\]/g);
		if (!pageMarkers) return;

		// Calculate approximate visible page based on scroll percentage
		const totalPages = pageMarkers.length;
		const visiblePageIndex = Math.floor(scrollPercentage * totalPages);
		const pageMatch = pageMarkers[visiblePageIndex]?.match(/\[Page (\d+)\]/);

		if (pageMatch) {
			const pageNumber = pageMatch[1];
			// Find the corresponding image file
			const imageFile = imageFiles.find((file) => getPageNumber(file) === pageNumber);
			if (imageFile && imageFile !== selectedFile) {
				selectedFile = imageFile;
			}
		}
	}

	// Function to highlight page markers in the parsed content
	$: formattedContent = parsedContent?.replace(
		/\[Page (\d+)\]/g,
		'<span class="bg-primary text-primary-content px-1 rounded">[Page $1]</span>'
	);
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
					class="size-5 rounded-full bg-error opacity-90 transition-all hover:opacity-100"
					title="Delete witness"
					aria-label="Delete witness"
				>
					<!-- 2 -->
				</button>
				<button
					class="size-5 rounded-full bg-info opacity-90 transition-all hover:opacity-100"
					title="Compare witnesses"
					aria-label="Compare witnesses"
				>
					<!-- 2 -->
				</button>
				<button
					class="size-5 rounded-full bg-success opacity-90 transition-all hover:opacity-100"
					title="Add annotation"
					aria-label="Add annotation"
				>
					<!-- 2 -->
				</button>
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
					</div>
					<div class="flex items-center gap-2">
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
				</div>
			</div>
			<div
				class="flex-1 overflow-y-auto"
				role="region"
				aria-label={currentView}
				bind:this={transcriptionContainer}
				on:scroll={handleScroll}
			>
				<div class="p-4">
					{#if currentView === 'xml'}
						{#if xmlContent}
							<CodeHighlight code={xmlContent} language="xml" />
						{:else}
							<div class="py-8 text-center text-base-content/60">Loading XML content...</div>
						{/if}
					{:else if currentView === 'notes'}
						{#if headerEntries.length}
							<div class="prose max-w-none">
								<div class="font-serif leading-relaxed">
									{#each headerEntries as entry}
										<HeaderEntry {entry} level={0} />
									{/each}
								</div>
							</div>
						{:else}
							<div class="py-8 text-center text-base-content/60">Loading notes...</div>
						{/if}
					{:else if xmlContent && !showParsedText}
						<CodeHighlight code={xmlContent} language="xml" />
					{:else if parsedContent}
						<div class="prose max-w-none">
							<div class="whitespace-pre-wrap font-serif leading-relaxed text-base-content">
								{@html formattedContent}
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
		margin: 0;
	}
</style>
