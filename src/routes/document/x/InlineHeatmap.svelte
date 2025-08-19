<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		calculateDifferencePercentage,
		getDifferenceColor,
		DIFFERENCE_COLORS
	} from '$lib/utils/witness/diff-calculator';

	export let alignmentData: any;
	export let selectedWitnessIndex = 0; // Which witness to display as base text
	
	const dispatch = createEventDispatcher();

	let selectedSegment: {
		position: number;
		text: string;
		variations: Array<{ witnessId: string; text: string; difference: number }>;
	} | null = null;
	let popoverPosition = { x: 0, y: 0 };
	let popoverPlacement: 'above' | 'below' = 'above';
	let showPopover = false;

	// Calculate differences for each text segment
	$: processedSegments = alignmentData?.table?.map((column: string[], columnIndex: number) => {
		const baseText = column[selectedWitnessIndex] || '';
		const variations = alignmentData.witnesses.map((witnessId: string, idx: number) => {
			const text = column[idx] || '';
			const difference = idx === selectedWitnessIndex ? 0 : calculateDifferencePercentage(baseText, text);
			return { witnessId, text, difference };
		});

		// Calculate average difference for this segment
		const avgDifference = variations
			.filter((_, idx) => idx !== selectedWitnessIndex)
			.reduce((sum, v) => sum + v.difference, 0) / (variations.length - 1);

		return {
			position: columnIndex,
			baseText,
			variations,
			avgDifference,
			color: getDifferenceColor(avgDifference),
			isInvariant: new Set(column.filter(t => t.length > 0)).size <= 1
		};
	}) || [];

	// Get witness label
	$: currentWitnessLabel = alignmentData?.witnesses?.[selectedWitnessIndex] 
		? `W${alignmentData.witnesses[selectedWitnessIndex]}` 
		: '';

	function handleSegmentClick(event: MouseEvent, segment: any) {
		event.stopPropagation();
		
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		
		// Calculate initial position
		let x = rect.left + rect.width / 2;
		let y = rect.top - 10;
		
		// Popover dimensions (approximate)
		const popoverWidth = 384; // w-96 = 24rem = 384px
		const popoverHeight = 400; // approximate max height
		
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
		selectedSegment = segment;
		showPopover = true;
	}

	function closePopover() {
		showPopover = false;
		selectedSegment = null;
	}

	function selectWitness(index: number) {
		selectedWitnessIndex = index;
		dispatch('witnessChange', { index });
	}

	// Get background color with appropriate opacity
	function getSegmentStyle(segment: any): string {
		if (segment.isInvariant) {
			return `background-color: rgba(34, 197, 94, 0.2); padding: 2px 4px; border-radius: 3px; cursor: pointer; transition: all 0.2s;`;
		}
		
		const color = getDifferenceColor(segment.avgDifference);
		const opacity = 0.2 + (segment.avgDifference / 100) * 0.4;
		
		// Convert hex to rgba
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		
		return `background-color: rgba(${r}, ${g}, ${b}, ${opacity}); padding: 2px 4px; border-radius: 3px; cursor: pointer; transition: all 0.2s;`;
	}

	// Get hover style
	function getHoverStyle(segment: any): string {
		const baseStyle = getSegmentStyle(segment);
		return baseStyle.replace(/0\.\d+\)/, '0.6)'); // Increase opacity on hover
	}
</script>

<div class="inline-heatmap-container">
	<!-- Witness Selector -->
	<div class="mb-4 flex items-center gap-2 rounded-lg bg-base-200 p-3">
		<span class="text-sm font-semibold">Viewing witness:</span>
		<div class="btn-group">
			{#each alignmentData?.witnesses || [] as witnessId, idx}
				<button
					class="btn btn-xs {idx === selectedWitnessIndex ? 'btn-primary' : 'btn-outline'}"
					on:click={() => selectWitness(idx)}
				>
					W{witnessId}
				</button>
			{/each}
		</div>
	</div>

	<!-- Inline Text with Heatmap -->
	<div class="prose max-w-none rounded-lg bg-base-100 p-6 shadow-sm">
		<div class="text-lg leading-relaxed">
			{#each processedSegments as segment, i}
				{#if segment.baseText}
					<span
						role="button"
						tabindex="0"
						class="inline-segment"
						style={getSegmentStyle(segment)}
						on:click={(e) => handleSegmentClick(e, segment)}
						on:keypress={(e) => e.key === 'Enter' && handleSegmentClick(e, segment)}
						on:mouseenter={(e) => {
							e.currentTarget.style.cssText = getHoverStyle(segment);
						}}
						on:mouseleave={(e) => {
							e.currentTarget.style.cssText = getSegmentStyle(segment);
						}}
						title="Position {segment.position + 1}: {Math.round(segment.avgDifference)}% average difference"
					>
						{segment.baseText}
					</span>
					{#if i < processedSegments.length - 1}
						{' '}
					{/if}
				{/if}
			{/each}
		</div>
	</div>

	<!-- Statistics Bar -->
	<div class="mt-4 flex items-center justify-between rounded-lg bg-base-200 p-3 text-sm">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded" style="background-color: {DIFFERENCE_COLORS.none};"></div>
				<span>Invariant: {processedSegments.filter(s => s.isInvariant).length}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded" style="background-color: {DIFFERENCE_COLORS.minor};"></div>
				<span>Minor: {processedSegments.filter(s => !s.isInvariant && s.avgDifference <= 25).length}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded" style="background-color: {DIFFERENCE_COLORS.moderate};"></div>
				<span>Moderate: {processedSegments.filter(s => s.avgDifference > 25 && s.avgDifference <= 50).length}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded" style="background-color: {DIFFERENCE_COLORS.major};"></div>
				<span>Major: {processedSegments.filter(s => s.avgDifference > 50 && s.avgDifference <= 75).length}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded" style="background-color: {DIFFERENCE_COLORS.complete};"></div>
				<span>Complete: {processedSegments.filter(s => s.avgDifference > 75).length}</span>
			</div>
		</div>
		<div class="text-xs text-base-content/60">
			Total segments: {processedSegments.length}
		</div>
	</div>

	<!-- Popover for detailed comparison -->
	{#if showPopover && selectedSegment}
		<!-- Backdrop -->
		<button 
			class="fixed inset-0 z-40 bg-black/20" 
			on:click={closePopover}
			aria-label="Close popover"
		></button>
		
		<!-- Popover content -->
		<div 
			class="fixed z-50 w-96 rounded-lg bg-base-100 shadow-2xl border border-base-300"
			style="left: {popoverPosition.x}px; top: {popoverPosition.y}px; transform: translate(-50%, {popoverPlacement === 'above' ? '-100%' : '0'});"
		>
			<!-- Header -->
			<div class="border-b border-base-300 bg-base-200 px-4 py-3 rounded-t-lg">
				<div class="flex items-center justify-between">
					<h3 class="font-bold">Position {selectedSegment.position + 1} Variations</h3>
					<button 
						class="btn btn-circle btn-ghost btn-sm"
						on:click={closePopover}
					>
						✕
					</button>
				</div>
			</div>
			
			<!-- Content -->
			<div class="max-h-96 overflow-y-auto p-4">
				<div class="space-y-3">
					{#each selectedSegment.variations as variation}
						{@const isCurrentWitness = alignmentData.witnesses[selectedWitnessIndex] === variation.witnessId}
						{@const diffColor = getDifferenceColor(variation.difference)}
						
						<div 
							class="rounded-lg border-2 p-3 transition-all"
							style="border-color: {isCurrentWitness ? '#3b82f6' : diffColor}; {isCurrentWitness ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}"
						>
							<div class="mb-2 flex items-center justify-between">
								<span class="text-xs font-bold {isCurrentWitness ? 'text-primary' : ''}">
									W{variation.witnessId}
									{#if isCurrentWitness}
										<span class="ml-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-content">Current</span>
									{/if}
								</span>
								{#if !isCurrentWitness && variation.text}
									<span 
										class="rounded px-2 py-0.5 text-xs font-semibold text-white"
										style="background-color: {diffColor};"
									>
										{variation.difference}% different
									</span>
								{/if}
							</div>
							<div class="text-sm">
								{#if variation.text}
									{variation.text}
								{:else}
									<span class="italic text-base-content/50">(no text at this position)</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.inline-segment {
		display: inline;
		border: 1px solid transparent;
	}
	
	.inline-segment:hover {
		border-color: rgba(0, 0, 0, 0.2);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	
	.inline-segment:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}
</style>