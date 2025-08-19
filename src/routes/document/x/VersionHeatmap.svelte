<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		prepareHeatmapData,
		getDifferenceColor,
		calculateDifferencePercentage,
		type HeatmapCell
	} from '$lib/utils/witness/diff-calculator';

	export let alignmentData: any;
	export let isVerticalOrientation = true;

	const dispatch = createEventDispatcher();

	let selectedCell: { row: number; col: number; cell: HeatmapCell } | null = null;
	let popoverPosition = { x: 0, y: 0 };
	let popoverPlacement: 'above' | 'below' = 'above';
	let popoverWidth = 512; // Default width
	let popoverMaxHeight = 400; // Default max height
	let showPopover = false;
	let hoveredCell: { row: number; col: number } | null = null;

	// Prepare heatmap data for all columns
	$: heatmapColumns = alignmentData?.table?.map((column: string[], columnIndex: number) => {
		return prepareHeatmapData(alignmentData, columnIndex);
	}) || [];

	// Calculate overall difference score for each witness pair
	$: witnessPairDifferences = calculateWitnessPairDifferences();

	function calculateWitnessPairDifferences() {
		if (!alignmentData) return new Map();

		const pairDiffs = new Map<string, number>();
		const witnesses = alignmentData.witnesses;

		for (let i = 0; i < witnesses.length; i++) {
			for (let j = i + 1; j < witnesses.length; j++) {
				const w1 = witnesses[i];
				const w2 = witnesses[j];
				let totalDiff = 0;
				let count = 0;

				alignmentData.table.forEach((column: string[]) => {
					if (column[i] && column[j]) {
						totalDiff += calculateDifferencePercentage(column[i], column[j]);
						count++;
					}
				});

				const avgDiff = count > 0 ? totalDiff / count : 0;
				pairDiffs.set(`${w1}-${w2}`, avgDiff);
			}
		}

		return pairDiffs;
	}

	function handleCellClick(event: MouseEvent, row: number, col: number, cell: HeatmapCell) {
		event.stopPropagation();
		
		// Get cell position for popover
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		
		// Calculate initial position
		let x = rect.left + rect.width / 2;
		let y = rect.top - 10;
		
		// Viewport dimensions
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		
		// Calculate available space
		const spaceLeft = x;
		const spaceRight = viewportWidth - x;
		const spaceAbove = rect.top;
		const spaceBelow = viewportHeight - rect.bottom;
		
		// Calculate optimal popover width based on available horizontal space
		const minWidth = 400; // Minimum width for readability
		const maxWidth = Math.min(900, viewportWidth - 40); // Max width with padding
		const availableWidth = Math.min(spaceLeft, spaceRight) * 2 - 20; // Total width available
		popoverWidth = Math.max(minWidth, Math.min(maxWidth, availableWidth));
		
		// Calculate optimal height based on available vertical space
		const minHeight = 250;
		const preferredMaxHeight = 700;
		
		// Determine placement and height
		if (spaceAbove > spaceBelow && spaceAbove > minHeight) {
			// Place above
			popoverPlacement = 'above';
			popoverMaxHeight = Math.min(preferredMaxHeight, spaceAbove - 20);
		} else if (spaceBelow > minHeight) {
			// Place below
			y = rect.bottom + 10;
			popoverPlacement = 'below';
			popoverMaxHeight = Math.min(preferredMaxHeight, spaceBelow - 20);
		} else {
			// Use whichever has more space
			if (spaceAbove > spaceBelow) {
				popoverPlacement = 'above';
				popoverMaxHeight = Math.max(minHeight, spaceAbove - 20);
			} else {
				y = rect.bottom + 10;
				popoverPlacement = 'below';
				popoverMaxHeight = Math.max(minHeight, spaceBelow - 20);
			}
		}
		
		// Adjust horizontal position if popover would go off-screen
		if (x - popoverWidth / 2 < 10) {
			// Too far left - align left edge with viewport
			x = popoverWidth / 2 + 10;
		} else if (x + popoverWidth / 2 > viewportWidth - 10) {
			// Too far right - align right edge with viewport
			x = viewportWidth - popoverWidth / 2 - 10;
		}
		
		popoverPosition = { x, y };
		selectedCell = { row, col, cell };
		showPopover = true;
	}

	function closePopover() {
		showPopover = false;
		selectedCell = null;
	}

	function handleCellHover(row: number, col: number) {
		hoveredCell = { row, col };
	}

	function handleCellLeave() {
		hoveredCell = null;
	}

	function getCellTooltip(cell: HeatmapCell): string {
		const differences = Array.from(cell.differenceScores.entries())
			.map(([witness, score]) => `W${witness}: ${score}%`)
			.join(', ');
		return `W${cell.witnessId} - Avg diff: ${Math.round(cell.averageDifference)}%\n${differences}`;
	}

	// Determine if a column contains identical text across all witnesses
	function isInvariant(columnIndex: number): boolean {
		const column = alignmentData.table[columnIndex];
		const nonEmptyValues = column.filter((v: string) => v.length > 0);
		return nonEmptyValues.length > 0 && new Set(nonEmptyValues).size === 1;
	}

	// Get color intensity based on average difference
	function getCellColor(cell: HeatmapCell, columnIndex: number): string {
		if (isInvariant(columnIndex)) {
			return 'rgba(34, 197, 94, 0.3)'; // Green for invariant
		}
		return cell.color;
	}
</script>

<div class="relative">
	<!-- Heatmap Grid -->
	<div class="overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-4">
		{#if !isVerticalOrientation}
			<!-- Horizontal Layout -->
			<div class="grid gap-1" style="grid-template-columns: auto repeat({alignmentData?.table?.length || 0}, 1fr);">
				<!-- Header row with column numbers -->
				<div class="font-bold text-xs text-base-content/50 p-2"></div>
				{#each alignmentData?.table || [] as _, colIndex}
					<div class="text-center text-xs text-base-content/50 p-1">
						{colIndex + 1}
					</div>
				{/each}

				<!-- Witness rows -->
				{#each alignmentData?.witnesses || [] as witness, witnessIndex}
					<!-- Witness label -->
					<div class="font-bold text-sm bg-base-200 p-2 rounded flex items-center justify-center">
						W{witness}
					</div>
					
					<!-- Cells for this witness -->
					{#each heatmapColumns as column, colIndex}
						{@const cell = column[witnessIndex]}
						{#if cell && cell.text}
							<button
								class="relative p-2 rounded transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
								style="background-color: {getCellColor(cell, colIndex)}; border: 2px solid {hoveredCell?.row === witnessIndex && hoveredCell?.col === colIndex ? getDifferenceColor(cell.averageDifference) : 'transparent'};"
								on:click={(e) => handleCellClick(e, witnessIndex, colIndex, cell)}
								on:mouseenter={() => handleCellHover(witnessIndex, colIndex)}
								on:mouseleave={handleCellLeave}
								title={getCellTooltip(cell)}
							>
								<div class="text-xs truncate">
									{cell.text.substring(0, 20)}{cell.text.length > 20 ? '...' : ''}
								</div>
							</button>
						{:else}
							<div class="p-2"></div>
						{/if}
					{/each}
				{/each}
			</div>
		{:else}
			<!-- Vertical Layout -->
			<div class="space-y-2">
				{#each alignmentData?.table || [] as _, colIndex}
					<div class="border rounded-lg p-2 {isInvariant(colIndex) ? 'border-green-500' : 'border-base-300'}">
						<div class="text-xs font-bold text-base-content/50 mb-2">Position {colIndex + 1}</div>
						<div class="grid gap-1" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));">
							{#each heatmapColumns[colIndex] || [] as cell, witnessIndex}
								{#if cell && cell.text}
									<button
										class="relative p-2 rounded transition-all cursor-pointer hover:scale-105 hover:shadow-lg"
										style="background-color: {getCellColor(cell, colIndex)}; border: 2px solid {hoveredCell?.row === witnessIndex && hoveredCell?.col === colIndex ? getDifferenceColor(cell.averageDifference) : 'transparent'};"
										on:click={(e) => handleCellClick(e, witnessIndex, colIndex, cell)}
										on:mouseenter={() => handleCellHover(witnessIndex, colIndex)}
										on:mouseleave={handleCellLeave}
										title={getCellTooltip(cell)}
									>
										<div class="text-xs font-semibold text-base-content/70">W{cell.witnessId}</div>
										<div class="text-xs truncate mt-1">
											{cell.text.substring(0, 15)}{cell.text.length > 15 ? '...' : ''}
										</div>
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Legend -->
	<div class="mt-4 flex items-center gap-4 text-xs">
		<span class="font-semibold">Difference Scale:</span>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1">
				<div class="w-4 h-4 rounded" style="background-color: #22c55e;"></div>
				<span>Identical</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-4 h-4 rounded" style="background-color: #3b82f6;"></div>
				<span>Minor (0-25%)</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-4 h-4 rounded" style="background-color: #eab308;"></div>
				<span>Moderate (25-50%)</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-4 h-4 rounded" style="background-color: #f97316;"></div>
				<span>Major (50-75%)</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-4 h-4 rounded" style="background-color: #ef4444;"></div>
				<span>Complete (75-100%)</span>
			</div>
		</div>
	</div>

	<!-- Popover for text comparison -->
	{#if showPopover && selectedCell}
		<!-- Backdrop -->
		<button 
			class="fixed inset-0 z-40 bg-black/20" 
			on:click={closePopover}
			aria-label="Close popover"
		></button>
		
		<!-- Popover content -->
		<div 
			class="fixed z-50 rounded-lg bg-base-100 shadow-2xl border border-base-300 flex flex-col"
			style="left: {popoverPosition.x}px; top: {popoverPosition.y}px; width: {popoverWidth}px; max-height: {popoverMaxHeight}px; transform: translate(-50%, {popoverPlacement === 'above' ? '-100%' : '0'});"
		>
			<div class="p-4 border-b border-base-300 flex items-center justify-between flex-shrink-0">
				<h3 class="font-bold text-lg">Text Comparison - Position {selectedCell.col + 1}</h3>
				<button 
					class="btn btn-circle btn-ghost btn-sm"
					on:click={closePopover}
				>
					✕
				</button>
			</div>
			
			<div class="p-4 space-y-3 overflow-y-auto flex-1">
				<!-- Current witness text -->
				<div class="rounded-lg bg-base-200 p-3">
					<div class="text-xs font-semibold text-primary mb-1">
						W{selectedCell.cell.witnessId} (Current)
					</div>
					<div class="text-sm">{selectedCell.cell.text || '(empty)'}</div>
				</div>
				
				<!-- Comparisons with other witnesses -->
				{#each Array.from(selectedCell.cell.differenceScores.entries()) as [witnessId, score]}
					{@const otherWitnessIndex = alignmentData.witnesses.indexOf(witnessId)}
					{@const otherText = alignmentData.table[selectedCell.col][otherWitnessIndex]}
					<div class="rounded-lg border p-3" style="border-color: {getDifferenceColor(score)};">
						<div class="flex items-center justify-between mb-1">
							<div class="text-xs font-semibold text-base-content/70">
								W{witnessId}
							</div>
							<div 
								class="text-xs px-2 py-0.5 rounded"
								style="background-color: {getDifferenceColor(score)}; color: white;"
							>
								{score}% different
							</div>
						</div>
						<div class="text-sm">{otherText || '(empty)'}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.heatmap-cell) {
		transition: all 0.2s ease;
	}
	
	:global(.heatmap-cell:hover) {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}
</style>