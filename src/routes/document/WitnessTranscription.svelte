<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import HeaderEntry from './HeaderEntry.svelte';
	import {
		getWitnessLabel,
		getPageNumber,
		WITNESS_VIEWS,
		type WitnessView
	} from '$lib/utils/witness-utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let selectedFile: FileData | undefined;
	export let witnessId: string;
	export let xmlContent: string | null;
	export let parsedContent: string | null;
	export let headerEntries: any[] = [];
	export let showParsedText = true;

	let currentView: WitnessView = 'transcription';
	let transcriptionContainer: HTMLElement;
	let isScrolling = false;

	// Function to highlight page markers in the parsed content
	$: formattedContent = parsedContent?.replace(
		/\[Page (\d+)\]/g,
		'<span class="bg-primary text-primary-content px-1 rounded">[Page $1]</span>'
	);

	function handleViewChange(view: WitnessView) {
		currentView = view;
	}

	export function scrollToPage(pageNumber: string) {
		if (!transcriptionContainer) return;

		isScrolling = true;
		const text = transcriptionContainer.innerText;
		const pageMarker = `[Page ${pageNumber}]`;
		const pageIndex = text.indexOf(pageMarker);

		if (pageIndex !== -1) {
			const textBeforePage = text.substring(0, pageIndex);
			const lineHeight = 24;
			const linesBeforePage = textBeforePage.split('\n').length;
			const scrollPosition = linesBeforePage * lineHeight;

			transcriptionContainer.scrollTo({
				top: scrollPosition - 100,
				behavior: 'smooth'
			});

			setTimeout(() => {
				isScrolling = false;
			}, 1000);
		}
	}

	function handleScroll(event: Event) {
		if (!transcriptionContainer || isScrolling) return;

		const text = transcriptionContainer.innerText;
		const scrollTop = transcriptionContainer.scrollTop;
		const scrollHeight = transcriptionContainer.scrollHeight;
		const clientHeight = transcriptionContainer.clientHeight;
		const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

		const pageMarkers = text.match(/\[Page (\d+)\]/g);
		if (!pageMarkers) return;

		const totalPages = pageMarkers.length;
		const visiblePageIndex = Math.floor(scrollPercentage * totalPages);
		const pageMatch = pageMarkers[visiblePageIndex]?.match(/\[Page (\d+)\]/);

		if (pageMatch) {
			const pageNumber = pageMatch[1];
			dispatch('pageScroll', { pageNumber });
		}
	}
</script>

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

<style>
	:global(.prose) {
		margin: 0;
	}
</style>
