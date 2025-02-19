<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import HeaderEntry from './HeaderEntry.svelte';
	import MdiDocumentEditOutline from '~icons/mdi/edit';
	import IcOutlineCenterFocusStrong from '~icons/ic/outline-center-focus-strong';
	import MdiFileCheckOutline from '~icons/mdi/file-check-outline';
	import IcBaselineArrowDropDown from '~icons/ic/baseline-arrow-drop-down';

	import {
		getWitnessLabel,
		getPageNumber,
		WITNESS_VIEWS,
		type WitnessView,
		parseTEIXML
	} from '$lib/utils/witness';
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

	// Function to format special markup patterns in the parsed content
	$: formattedContent = parsedContent
		?.replace(
			/\[Page (\d+)\]/g,
			'<span class="page-marker bg-primary text-primary-content px-1 rounded" data-page="$1">[Page $1]</span>'
		)
		?.replace(/<p>/g, witnessType === '1b' ? '<p class="mb-6 indent-8">' : '<p>')
		?.replace(/<del-instant>([^<]+)<\/del-instant>/g, '<span class="instant-deletion">$1</span>')
		?.replace(/<add-instant>([^<]+)<\/add-instant>/g, '<span class="instant-addition">$1</span>')
		?.replace(
			witnessType === '1b' ? /\[(?!Page \d+])([^\]]+)\]/g : /\[(?!Page \d+])([^\]]+)\]/g,
			witnessType === '1b' ? '<span class="deletion line-through opacity-60">$1</span>' : '[$1]'
		)
		?.replace(
			/\{([^}]+)\}/g,
			witnessType === '1b' ? '<span class="addition italic text-green-600">$1</span>' : '{$1}'
		)
		?.replace(
			/⟨([^⟩]+)⟩/g,
			witnessType === '1b' ? '<span class="unclear italic text-amber-600">$1</span>' : '⟨$1⟩'
		)
		?.replace(
			/\(([^()]+)\)/g,
			witnessType === '1b' ? '<span class="supplied text-blue-600">$1</span>' : '($1)'
		)
		?.replace(/\(\(([^)]+)\)\)/g, (match: string, content: string) => {
			return `<span class="note bg-primary text-primary-content px-1 rounded">${content}</span>`;
		})
		?.replace(/\(\)/g, witnessType === '1b' ? '<p class="mb-6 indent-8"></p>' : '<br/>')
		?.replace(
			/\[\]/g,
			witnessType === '1b' ? '<hr class="my-4 border-t-2 border-dashed border-base-300"/>' : '[]'
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
					Page {selectedFile ? getPageNumber(selectedFile) : ''}
				</h2>
			</div>
			<div class="flex items-center gap-2 text-sm">
				{#each WITNESS_VIEWS as view, i}
					{#if i > 0}
						<span class="text-base-content/30" aria-hidden="true">•</span>
					{/if}
					{#if view.id === 'transcription'}
						<div class="dropdown dropdown-end">
							<button
								tabindex="0"
								class="btn btn-sm flex h-auto min-h-0 items-center gap-1 bg-base-200/50 px-3 py-1.5 text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {currentView ===
								view.id
									? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
									: ''}"
								aria-current={currentView === view.id}
								on:click={() => handleViewChange(view.id)}
							>
								{#if view.id === 'transcription'}
									<span class="inline-flex items-center gap-1">
										{#if witnessType === '1a'}
											<MdiDocumentEditOutline class="h-3.5 w-3.5" />
											<span>First version</span>
											<!-- {:else if witnessType === '1b'}
											<IcOutlineCenterFocusStrong class="h-3.5 w-3.5" />
											<span>Intermediate Transcription</span> -->
										{:else}
											<MdiFileCheckOutline class="h-3.5 w-3.5" />
											<span>Final version</span>
										{/if}
									</span>
									<IcBaselineArrowDropDown class="size-6" />
								{/if}
							</button>
							{#if view.id === 'transcription' && currentView === 'transcription'}
								<ul
									tabindex="0"
									class="menu dropdown-content z-[1] w-44 gap-1 rounded-lg bg-base-200 p-1.5 shadow-lg"
								>
									<li>
										<button
											class="btn btn-sm flex h-auto min-h-0 w-full items-center justify-start gap-2 bg-base-200/50 px-3 py-2 text-left text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {witnessType ===
											'1a'
												? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
												: ''}"
											on:click={() => handleWitnessTypeChange('1a')}
										>
											<MdiDocumentEditOutline class="h-4 w-4" />
											First
										</button>
									</li>
									<!-- <li>
										<button
											class="btn btn-sm flex h-auto min-h-0 w-full items-center justify-start gap-2 bg-base-200/50 px-3 py-2 text-left text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {witnessType ===
											'1b'
												? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
												: ''}"
											on:click={() => handleWitnessTypeChange('1b')}
										>
											<IcOutlineCenterFocusStrong class="h-4 w-4" />
											Intermediate
										</button>
									</li> -->
									<li>
										<button
											class="btn btn-sm flex h-auto min-h-0 w-full items-center justify-start gap-2 bg-base-200/50 px-3 py-2 text-left text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {witnessType ===
											'1c'
												? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
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
							class="btn btn-sm h-auto min-h-0 bg-base-200/50 px-3 py-1.5 text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {currentView ===
							view.id
								? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
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
					<div class="m-[-1rem]">
						<CodeHighlight code={xmlContent} language="xml" />
					</div>
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
					<div class="whitespace-pre-line font-serif leading-relaxed text-base-content">
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

	:global(.prose p) {
		/* margin: 0; */
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

	/* Special markup styles */
	:global(.deletion) {
		text-decoration-thickness: 1px;
	}

	:global(.addition) {
		font-style: italic;
	}

	:global(.unclear) {
		font-style: italic;
	}

	:global(.note) {
		display: inline-block;
		margin: 0 0.25em;
		font-size: 0.9em;
	}

	:global(.instant-deletion) {
		text-decoration: line-through;
		text-decoration-thickness: 1px;
		opacity: 0.8;
		background: #bab9b9;
	}

	:global(.instant-addition) {
		vertical-align: super;
		font-size: 0.85em;
		color: var(--tw-prose-body);
	}
</style>
