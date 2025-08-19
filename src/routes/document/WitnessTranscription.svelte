<script lang="ts">
	import type { FileData } from '$lib/stores/indexeddb-store';
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';
	import HeaderEntry from './HeaderEntry.svelte';
	import MdiDocumentEditOutline from '~icons/mdi/edit';
	import IcOutlineCenterFocusStrong from '~icons/ic/outline-center-focus-strong';
	import MdiFileCheckOutline from '~icons/mdi/file-check-outline';
	import IcBaselineArrowDropDown from '~icons/ic/baseline-arrow-drop-down';
	import MdiPalette from '~icons/mdi/palette';

	import {
		getWitnessLabel,
		getPageNumber,
		WITNESS_VIEWS,
		type WitnessView,
		parseTEIXML,
		loadXMLContent,
		cleanTextForComparison
	} from '$lib/utils/witness';
	import { calculateDifferencePercentage } from '$lib/utils/witness/diff-calculator';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let selectedFile: FileData | undefined;
	export let witnessId: string;
	export let xmlContent: string | null;
	export let parsedContent: string | null;
	export let headerEntries: any[] = [];
	export let showParsedText = true;
	export let allWitnesses: any[] = [];

	let currentView: WitnessView = 'transcription';
	let transcriptionContainer: HTMLElement;
	let contentContainer: HTMLElement;
	let isScrolling = false;
	let witnessType: '1a' | '1b' | '1c' | '1c-heatmap' = '1c';
	let showHeatmap = false;
	let selectedWord: { text: string; variations: any[] } | null = null;
	let popoverPosition = { x: 0, y: 0 };
	let popoverPlacement: 'above' | 'below' = 'above';
	let showPopover = false;

	// Handle click on heatmap word
	function handleWordClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('heatmap-word')) {
			event.stopPropagation();
			
			const rect = target.getBoundingClientRect();
			
			// Calculate initial position
			let x = rect.left + rect.width / 2;
			let y = rect.top - 10;
			
			// Popover dimensions (approximate)
			const popoverWidth = 320; // w-80 = 20rem = 320px
			const popoverHeight = 350; // approximate max height
			
			// Viewport dimensions
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			
			// Adjust horizontal position if popover would go off-screen
			if (x - popoverWidth / 2 < 10) {
				// Too far left - align left edge with viewport
				x = popoverWidth / 2 + 10;
			} else if (x + popoverWidth / 2 > viewportWidth - 10) {
				// Too far right - align right edge with viewport
				x = viewportWidth - popoverWidth / 2 - 10;
			}
			
			// Adjust vertical position if popover would go off-screen
			if (y - popoverHeight < 10) {
				// Not enough space above - show below instead
				y = rect.bottom + 10;
				popoverPlacement = 'below';
			} else {
				popoverPlacement = 'above';
			}
			
			popoverPosition = { x, y };
			
			const word = target.textContent || '';
			const wordPosition = parseInt(target.dataset.position || '0');
			
			console.log('Clicked word:', word, 'at display position:', wordPosition);
			
			// Get actual variations from witness data
			selectedWord = {
				text: word,
				variations: getActualVariations(word, wordPosition)
			};
			
			showPopover = true;
		}
	}
	
	// Load witness texts for comparison
	let witnessTexts: Map<string, string> = new Map();
	let witnessTextsLoaded = false;
	
	// Load all witness texts when component mounts or witnesses change
	$: if (allWitnesses.length > 0 && witnessType === '1c-heatmap') {
		loadAllWitnessTexts();
	}
	
	async function loadAllWitnessTexts() {
		console.log('Loading witness texts for heatmap...', allWitnesses);
		witnessTexts.clear();
		witnessTextsLoaded = false;
		
		for (const witness of allWitnesses) {
			if (witness.enabled && witness.folder) {
				try {
					const xmlContent = await loadXMLContent(witness.folder);
					if (xmlContent) {
						const parsed = parseTEIXML(xmlContent, '1c'); // Use final version for comparison
						const cleaned = cleanTextForComparison(parsed);
						witnessTexts.set(witness.folder.id, cleaned);
						console.log(`Loaded witness ${witness.folder.id}:`, cleaned.substring(0, 100));
					}
				} catch (err) {
					console.error(`Failed to load witness ${witness.folder.id}:`, err);
				}
			}
		}
		
		witnessTextsLoaded = true;
		console.log('Witness texts loaded:', witnessTexts.size, 'witnesses');
	}
	
	// Get actual variations from real witness data
	function getActualVariations(word: string, position: number) {
		console.log('Getting variations for word:', word, 'at position:', position);
		const variations = [];
		
		// Get the current witness text for comparison
		const currentWitnessText = witnessTexts.get(witnessId) || '';
		
		// Clean and split text consistently for all witnesses
		const cleanAndSplit = (text: string) => {
			// Remove page markers and notes for word alignment
			let cleaned = text
				.replace(/\[Page \d+\]/g, '') // Remove page markers
				.replace(/\(\([^)]+\)\)/g, '') // Remove notes
				.replace(/\s+/g, ' ') // Normalize whitespace
				.trim();
			return cleaned.split(/\s+/);
		};
		
		const currentWords = cleanAndSplit(currentWitnessText);
		const targetWord = currentWords[position] || word;
		console.log('Target word from current witness:', targetWord);
		
		for (const [witnessKey, witnessText] of witnessTexts) {
			const witnessNumber = witnessKey.split('_')[1];
			const witnessWords = cleanAndSplit(witnessText);
			const compareWord = witnessWords[position] || '[missing]';
			
			const difference = calculateDifferencePercentage(targetWord, compareWord);
			
			variations.push({
				witnessId: `W${witnessNumber}`,
				text: compareWord,
				difference: Math.round(difference)
			});
		}
		
		console.log('Variations:', variations);
		return variations;
	}
	
	function closePopover() {
		showPopover = false;
		selectedWord = null;
	}
	

	// Apply heatmap colors to plain text before HTML formatting using actual witness data
	function applyHeatmapColorsToPlainText(text: string): string {
		console.log('applyHeatmapColorsToPlainText called', { showHeatmap, witnessType, textLength: text.length });
		if (!showHeatmap || witnessType !== '1c-heatmap') return text;
		
		// Wait for witnesses to load before applying any coloring
		if (!witnessTextsLoaded || witnessTexts.size === 0) {
			console.log('Witness texts not loaded yet, returning plain text');
			return text; // Return plain text while loading
		}
		
		return applyRealHeatmapColors(text);
	}
	
	// Simple heatmap coloring for when witness data isn't loaded
	function applySimpleHeatmapColors(text: string): string {
		// Track both display position and clean position
		let displayText = text;
		let cleanPosition = 0;
		
		// Apply colors to actual words, skipping page markers and notes
		displayText = displayText.replace(/(\[Page \d+\])|(\(\([^)]+\)\))|(\S+)/g, (match, pageMarker, note, word) => {
			if (pageMarker || note) {
				// Don't color page markers or notes, return as is
				return match;
			}
			
			// This is a regular word, apply coloring
			let colorName = 'green';
			let variationType = 'identical';
			
			if (/^(de|het|een|van|en|in|te|is|die|met|op|aan|voor|dat)$/i.test(word)) {
				colorName = 'green';
				variationType = 'identical';
			} else if (word.length <= 3) {
				colorName = 'blue';
				variationType = 'minor';
			} else if (word.length <= 6) {
				colorName = 'yellow';
				variationType = 'moderate';
			} else {
				const rand = word.length % 3;
				colorName = rand === 0 ? 'orange' : rand === 1 ? 'blue' : 'yellow';
				variationType = rand === 0 ? 'major' : rand === 1 ? 'minor' : 'moderate';
			}
			
			const pos = cleanPosition++;
			return `__HEATMAP_START_${variationType}_${colorName}_${pos}__${word}__HEATMAP_END__`;
		});
		
		return displayText;
	}
	
	// Apply real heatmap colors based on witness comparisons
	function applyRealHeatmapColors(text: string): string {
		// Get current witness text for comparison
		const currentCleanText = witnessTexts.get(witnessId);
		if (!currentCleanText) {
			console.log('No witness text found for:', witnessId);
			return applySimpleHeatmapColors(text);
		}
		
		let displayText = text;
		let cleanPosition = 0;
		
		// Apply colors to actual words, skipping page markers and notes
		displayText = displayText.replace(/(\[Page \d+\])|(\(\([^)]+\)\))|(\S+)/g, (match, pageMarker, note, word) => {
			if (pageMarker || note) {
				// Don't color page markers or notes, return as is
				return match;
			}
			
			// This is a regular word - get variations for this position
			const variations = getActualVariations(word, cleanPosition);
			
			// Calculate average difference
			let avgDifference = 0;
			if (variations.length > 1) {
				const otherWitnesses = variations.filter(v => v.witnessId !== `W${witnessId.split('_')[1]}`);
				if (otherWitnesses.length > 0) {
					avgDifference = otherWitnesses.reduce((sum, v) => sum + v.difference, 0) / otherWitnesses.length;
				}
			}
			
			// Determine color based on average difference
			let colorName = 'green';
			let variationType = 'identical';
			
			if (avgDifference === 0) {
				colorName = 'green';
				variationType = 'identical';
			} else if (avgDifference <= 25) {
				colorName = 'blue';
				variationType = 'minor';
			} else if (avgDifference <= 50) {
				colorName = 'yellow';
				variationType = 'moderate';
			} else if (avgDifference <= 75) {
				colorName = 'orange';
				variationType = 'major';
			} else {
				colorName = 'red';
				variationType = 'complete';
			}
			
			const pos = cleanPosition++;
			return `__HEATMAP_START_${variationType}_${colorName}_${pos}__${word}__HEATMAP_END__`;
		});
		
		return displayText;
	}

	// Function to format special markup patterns in the parsed content
	$: formattedContent = (() => {
		console.log('Formatting content, witnessType:', witnessType);
		if (!parsedContent) return parsedContent;
		
		// Check for heatmap placeholders before formatting
		const hasPlaceholdersBeforeFormat = parsedContent.includes('__HEATMAP_START_');
		console.log('Placeholders before formatting:', hasPlaceholdersBeforeFormat);
		
		let result = parsedContent
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
		
		// Check for heatmap placeholders after formatting
		const hasPlaceholdersAfterFormat = result?.includes('__HEATMAP_START_');
		console.log('Placeholders after formatting:', hasPlaceholdersAfterFormat);
		
		return result;
	})();
	
	// Convert heatmap placeholders to HTML spans
	function convertHeatmapPlaceholders(html: string): string {
		console.log('convertHeatmapPlaceholders called', { witnessType, htmlLength: html?.length });
		if (!html || witnessType !== '1c-heatmap') return html;
		
		const colors = {
			green: 'rgba(34, 197, 94, 0.3)',
			blue: 'rgba(59, 130, 246, 0.3)',
			yellow: 'rgba(234, 179, 8, 0.3)',
			orange: 'rgba(249, 115, 22, 0.3)',
			red: 'rgba(239, 68, 68, 0.3)'
		};
		
		const labels = {
			identical: 'Identical across witnesses',
			minor: 'Minor variation: click to compare',
			moderate: 'Moderate variation: click to compare',
			major: 'Major variation: click to compare',
			complete: 'Significant rewrite: click to compare'
		};
		
		// Replace heatmap placeholders with actual HTML
		let result = html;
		// Check if placeholders exist
		const hasPlaceholders = result.includes('__HEATMAP_START_');
		console.log('Has heatmap placeholders:', hasPlaceholders);
		
		// Updated regex to capture position data
		result = result.replace(/__HEATMAP_START_([^_]+)_([^_]+)_(\d+)__([\s\S]*?)__HEATMAP_END__/g, 
			(match, variationType, colorName, position, text) => {
				const color = colors[colorName] || colors.green;
				const label = labels[variationType] || 'Click to compare';
				console.log('Replacing placeholder:', { variationType, colorName, position, text: text.substring(0, 20) });
				return `<span class="heatmap-word" data-variation="${variationType}" data-position="${position}" style="background-color: ${color}; padding: 2px 4px; border-radius: 3px; cursor: pointer;" title="${label}">${text}</span>`;
			}
		);
		
		// Clean up any remaining placeholders that might have been missed
		result = result.replace(/__HEATMAP_START_[^_]+_[^_]+_\d+__/g, '');
		result = result.replace(/__HEATMAP_END__/g, '');
		
		return result;
	}
	
	// Apply heatmap colors if enabled
	$: finalContent = witnessType === '1c-heatmap' ? convertHeatmapPlaceholders(formattedContent || '') : formattedContent;

	// Parse XML content when needed
	// Use a key that changes when witness texts are loaded for heatmap mode
	$: parseKey = witnessType + (witnessType === '1c-heatmap' ? '_' + witnessTextsLoaded : '');
	
	$: if (xmlContent && showParsedText && parseKey) {
		// For heatmap, use the base '1c' type for parsing
		const parseType = witnessType === '1c-heatmap' ? '1c' : witnessType;
		let parsed = parseTEIXML(xmlContent, parseType as '1a' | '1b' | '1c');
		
		// Apply heatmap colors to plain text if in heatmap mode
		if (witnessType === '1c-heatmap') {
			console.log('Applying heatmap colors once, witnesses loaded:', witnessTextsLoaded, 'witness count:', witnessTexts.size);
			parsed = applyHeatmapColorsToPlainText(parsed);
		}
		
		parsedContent = parsed;
	}

	function handleViewChange(view: WitnessView) {
		currentView = view;
	}

	function handleWitnessTypeChange(type: '1a' | '1b' | '1c' | '1c-heatmap') {
		witnessType = type;
		showHeatmap = type === '1c-heatmap';
		// The reactive statement will handle parsing and applying heatmap colors
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
		{#if witnessType === '1c-heatmap' && currentView === 'transcription'}
			<!-- Compact Legend Bar for Heatmap Mode -->
			<div class="mb-2 flex flex-wrap items-center gap-2 rounded bg-base-100 px-3 py-1.5 text-xs">
				{#if !witnessTextsLoaded}
					<span class="loading loading-spinner loading-xs"></span>
					<span class="text-base-content/70">Loading witness comparisons...</span>
				{:else}
				<span class="font-semibold">Colors:</span>
				<span class="flex items-center gap-1">
					<span class="inline-block h-2.5 w-2.5 rounded" style="background-color: rgba(34, 197, 94, 0.6);"></span>
					<span class="text-base-content/70">Identical</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="inline-block h-2.5 w-2.5 rounded" style="background-color: rgba(59, 130, 246, 0.6);"></span>
					<span class="text-base-content/70">Minor</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="inline-block h-2.5 w-2.5 rounded" style="background-color: rgba(234, 179, 8, 0.6);"></span>
					<span class="text-base-content/70">Moderate</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="inline-block h-2.5 w-2.5 rounded" style="background-color: rgba(249, 115, 22, 0.6);"></span>
					<span class="text-base-content/70">Major</span>
				</span>
				<span class="flex items-center gap-1">
					<span class="inline-block h-2.5 w-2.5 rounded" style="background-color: rgba(239, 68, 68, 0.6);"></span>
					<span class="text-base-content/70">Complete</span>
				</span>
				{/if}
			</div>
		{/if}
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
										{:else if witnessType === '1c-heatmap'}
											<MdiPalette class="h-3.5 w-3.5" />
											<span>Final + Heatmap</span>
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
									<li class="divider my-1"></li>
									<li>
										<button
											class="btn btn-sm flex h-auto min-h-0 w-full items-center justify-start gap-2 bg-base-200/50 px-3 py-2 text-left text-sm font-normal text-base-content/60 hover:bg-base-200 hover:text-base-content {witnessType ===
											'1c-heatmap'
												? '!bg-primary/10 font-medium !text-primary hover:!bg-primary/20'
												: ''}"
											on:click={() => handleWitnessTypeChange('1c-heatmap')}
										>
											<MdiPalette class="h-4 w-4" />
											Final + Heatmap
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
			on:click={handleWordClick}
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
						{@html finalContent}
					</div>
					{#if witnessType === '1c-heatmap'}
						<!-- Color Legend -->
						<div class="mt-6 border-t border-base-300 pt-4">
							<div class="flex flex-wrap items-center gap-3 text-xs">
								<span class="font-semibold text-base-content/70">Legend:</span>
								<div class="flex items-center gap-1">
									<div class="h-3 w-3 rounded" style="background-color: rgba(34, 197, 94, 0.5);"></div>
									<span class="text-base-content/60">Identical</span>
								</div>
								<div class="flex items-center gap-1">
									<div class="h-3 w-3 rounded" style="background-color: rgba(59, 130, 246, 0.5);"></div>
									<span class="text-base-content/60">Minor (1-25%)</span>
								</div>
								<div class="flex items-center gap-1">
									<div class="h-3 w-3 rounded" style="background-color: rgba(234, 179, 8, 0.5);"></div>
									<span class="text-base-content/60">Moderate (26-50%)</span>
								</div>
								<div class="flex items-center gap-1">
									<div class="h-3 w-3 rounded" style="background-color: rgba(249, 115, 22, 0.5);"></div>
									<span class="text-base-content/60">Major (51-75%)</span>
								</div>
								<div class="flex items-center gap-1">
									<div class="h-3 w-3 rounded" style="background-color: rgba(239, 68, 68, 0.5);"></div>
									<span class="text-base-content/60">Complete (76-100%)</span>
								</div>
							</div>
							<div class="mt-2 text-xs text-base-content/50">
								Click on any colored word to compare with other witnesses
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="py-8 text-center text-base-content/60">Loading transcription...</div>
			{/if}
		</div>
	</div>
</div>

<!-- Popover for word comparison -->
{#if showPopover && selectedWord}
	<!-- Backdrop -->
	<button 
		class="fixed inset-0 z-40 bg-black/20" 
		on:click={closePopover}
		aria-label="Close popover"
	></button>
	
	<!-- Popover content -->
	<div 
		class="fixed z-50 w-80 rounded-lg bg-base-100 shadow-2xl border border-base-300"
		style="left: {popoverPosition.x}px; top: {popoverPosition.y}px; transform: translate(-50%, {popoverPlacement === 'above' ? '-100%' : '0'});"
	>
		<!-- Header -->
		<div class="border-b border-base-300 bg-base-200 px-4 py-3 rounded-t-lg">
			<div class="flex items-center justify-between">
				<h3 class="font-bold">Witness Variations</h3>
				<button 
					class="btn btn-circle btn-ghost btn-sm"
					on:click={closePopover}
				>
					✕
				</button>
			</div>
			<div class="text-sm text-base-content/70 mt-1">
				Word: <span class="font-semibold">"{selectedWord.text}"</span>
			</div>
		</div>
		
		<!-- Content -->
		<div class="max-h-64 overflow-y-auto p-4">
			<div class="space-y-2">
				{#each selectedWord.variations as variation}
					{@const diffColor = variation.difference === 0 ? '#22c55e' :
									   variation.difference <= 25 ? '#3b82f6' :
									   variation.difference <= 50 ? '#eab308' :
									   variation.difference <= 75 ? '#f97316' : '#ef4444'}
					
					<div 
						class="rounded-lg border p-2.5 text-sm"
						style="border-color: {diffColor}; background-color: {diffColor}15;"
					>
						<div class="flex items-center justify-between mb-1">
							<span class="font-semibold text-xs">{variation.witnessId}</span>
							{#if variation.difference > 0}
								<span 
									class="text-xs px-1.5 py-0.5 rounded text-white"
									style="background-color: {diffColor};"
								>
									{variation.difference}% diff
								</span>
							{/if}
						</div>
						<div class="font-serif">
							{#if variation.text === '[missing]'}
								<span class="italic text-base-content/50">{variation.text}</span>
							{:else}
								{variation.text}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

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
	
	/* Heatmap word hover effects */
	:global(.heatmap-word) {
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}
	
	:global(.heatmap-word:hover) {
		filter: brightness(1.1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		border-color: rgba(0, 0, 0, 0.2);
	}
</style>
