<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import HeaderEntry from './HeaderEntry.svelte';
	import MdiDocumentEditOutline from '~icons/mdi/edit';
	import MdiFileDocumentEditOutline from '~icons/mdi/file-document-edit-outline';
	import IcOutlineCenterFocusStrong from '~icons/ic/outline-center-focus-strong';
	import MdiFileCheckOutline from '~icons/mdi/file-check-outline';
	import IcBaselineArrowDropDown from '~icons/ic/baseline-arrow-drop-down';

	import {
		getWitnessLabel,
		getPageNumber,
		WITNESS_VIEWS,
		type WitnessView,
		parseTEIXML
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
	let contentContainer: HTMLElement;
	let isScrolling = false;
	let witnessType: '1a' | '1b' | '1c' = '1c';

	// Function to highlight page markers in the parsed content
	$: formattedContent = parsedContent?.replace(
		/\[Page (\d+)\]/g,
		'<span class="page-marker bg-primary text-primary-content px-1 rounded" data-page="$1">[Page $1]</span>'
	);

	// Parse XML content when witness type changes
	$: if (xmlContent && showParsedText) {
		parsedContent = parseTEIXML(xmlContent, witnessType);
	}

	function handleViewChange(view: WitnessView) {
		currentView = view;
	}

	function handleWitnessTypeChange(type: '1a' | '1b' | '1c') {
		witnessType = type;
		if (xmlContent) {
			parsedContent = parseTEIXML(xmlContent, type);
		}
	}

	export function scrollToPage(pageNumber: string) {
		if (!contentContainer) return;

		isScrolling = true;
		const pageMarker = contentContainer.querySelector(`[data-page="${pageNumber}"]`);

		if (pageMarker) {
			const markerTop = pageMarker.getBoundingClientRect().top;
			const containerTop = contentContainer.getBoundingClientRect().top;
			const currentScroll = contentContainer.scrollTop;
			const targetScroll = currentScroll + (markerTop - containerTop) - 100;

			contentContainer.scrollTo({
				top: targetScroll,
				behavior: 'smooth'
			});

			setTimeout(() => {
				isScrolling = false;
			}, 1000);
		}
	}

	function handleScroll(event: Event) {
		if (!contentContainer || isScrolling) return;

		const pageMarkers = Array.from(contentContainer.querySelectorAll('.page-marker'));
		const containerTop = contentContainer.getBoundingClientRect().top;
		const containerHeight = contentContainer.clientHeight;
		const containerBottom = containerTop + containerHeight;

		// Find the first visible page marker
		const visibleMarker = pageMarkers.find((marker) => {
			const rect = marker.getBoundingClientRect();
			const markerMiddle = rect.top + rect.height / 2;
			return markerMiddle >= containerTop && markerMiddle <= containerBottom;
		});

		if (visibleMarker) {
			const pageNumber = (visibleMarker as HTMLElement).dataset.page;
			if (pageNumber) {
				dispatch('pageScroll', { pageNumber });
			}
		} else if (contentContainer.scrollTop + containerHeight >= contentContainer.scrollHeight) {
			// If we're at the bottom, dispatch the last page
			const lastMarker = pageMarkers[pageMarkers.length - 1] as HTMLElement;
			if (lastMarker) {
				const pageNumber = lastMarker.dataset.page;
				if (pageNumber) {
					dispatch('pageScroll', { pageNumber });
				}
			}
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
			<div class="flex items-center gap-2 text-xs">
				{#each WITNESS_VIEWS as view, i}
					{#if i > 0}
						<span class="text-base-content/30" aria-hidden="true">•</span>
					{/if}
					{#if view.id === 'transcription'}
						<div class="dropdown dropdown-end">
							<button
								tabindex="0"
								class="flex items-center gap-1 text-base-content/60 transition-colors hover:text-base-content {currentView ===
								view.id
									? 'font-medium !text-primary'
									: ''}"
								aria-current={currentView === view.id}
								on:click={() => handleViewChange(view.id)}
							>
								{view.label}
								{#if view.id === 'transcription'}
									<span class="ml-1.5">
										({witnessType === '1a'
											? 'Original'
											: witnessType === '1b'
												? 'Intermediate'
												: 'Final'})
									</span>
									<IcBaselineArrowDropDown class="size-6" />
								{/if}
							</button>
							{#if view.id === 'transcription' && currentView === 'transcription'}
								<ul
									tabindex="0"
									class="menu dropdown-content z-[1] w-40 rounded-lg bg-base-200 p-1 shadow-lg"
								>
									<li>
										<button
											class="flex items-center gap-2 text-left {witnessType === '1a'
												? 'active'
												: ''}"
											on:click={() => handleWitnessTypeChange('1a')}
										>
											<MdiDocumentEditOutline class="h-4 w-4" />
											Original
										</button>
									</li>
									<li>
										<button
											class="flex items-center gap-2 text-left {witnessType === '1b'
												? 'active'
												: ''}"
											on:click={() => handleWitnessTypeChange('1b')}
										>
											<IcOutlineCenterFocusStrong class="h-4 w-4" />
											Intermediate
										</button>
									</li>
									<li>
										<button
											class="flex items-center gap-2 text-left {witnessType === '1c'
												? 'active'
												: ''}"
											on:click={() => handleWitnessTypeChange('1c')}
										>
											<MdiFileCheckOutline class="h-4 w-4" />
											Final
										</button>
									</li>
								</ul>
							{/if}
						</div>
					{:else}
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
					{/if}
				{/each}
			</div>
		</div>
	</div>
	<div
		class="flex-1 overflow-hidden"
		role="region"
		aria-label={currentView}
		bind:this={transcriptionContainer}
	>
		<div
			class="scrollbar-thin h-full overflow-y-auto overflow-x-scroll p-4"
			bind:this={contentContainer}
			on:scroll={handleScroll}
		>
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

	.scrollbar-thin {
		scrollbar-width: auto;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
	}

	.scrollbar-thin::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}
</style>
