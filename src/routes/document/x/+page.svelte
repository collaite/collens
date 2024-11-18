<script lang="ts">
	import SettingsBar from '../SettingsBar.svelte';
	import VariantGraph from './VariantGraph.svelte';
	import { onMount } from 'svelte';

	let xmlString = '';
	let jsonData = '';
	let alignmentData: any = null;

	// Define witnesses data structure
	let witnesses = [
		{
			id: '1',
			title: 'Witness 1',
			enabled: true,
			metrics: { red: 5, blue: 7, green: 10, yellow: 8 }
		},
		{
			id: '2',
			title: 'Witness 2',
			enabled: true,
			metrics: { red: 6, blue: 8, green: 9, yellow: 7 }
		},
		{
			id: '3',
			title: 'Witness 3',
			enabled: true,
			metrics: { red: 4, blue: 6, green: 11, yellow: 9 }
		},
		{
			id: '4',
			title: 'Witness 4',
			enabled: true,
			metrics: { red: 7, blue: 5, green: 8, yellow: 10 }
		},
		{
			id: '5',
			title: 'Witness 5',
			enabled: true,
			metrics: { red: 5, blue: 7, green: 12, yellow: 6 }
		}
	];

	async function fetchCollation() {
		// Only include enabled witnesses in the payload
		const enabledWitnesses = witnesses.filter((w) => w.enabled);

		const payload = {
			algorithm: 'dekker',
			witnesses: enabledWitnesses.map((w) => ({
				id: w.id,
				content: getWitnessContent(w.id) // Helper function to get content based on ID
			}))
		};

		try {
			const jsonResponse = await fetch('https://collatex.net/demo/collate', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!jsonResponse.ok) {
				throw new Error('JSON response was not ok');
			}

			const jsonResult = await jsonResponse.json();
			jsonData = JSON.stringify(jsonResult, null, 2);

			// Process the table data to remove commas
			if (jsonResult.table) {
				jsonResult.table = jsonResult.table.map((column: any[]) => {
					return column.map((cell) => {
						if (Array.isArray(cell)) {
							return cell.join(' ');
						}
						return cell;
					});
				});
			}

			// Update alignmentData with only the enabled witness IDs
			alignmentData = {
				...jsonResult,
				witnesses: enabledWitnesses.map((w) => w.id)
			};
		} catch (error) {
			console.error('Error fetching collation:', error);
		}
	}

	// Helper function to get witness content based on ID
	function getWitnessContent(id: string): string {
		const contents: { [key: string]: string } = {
			'1': 'The black cat',
			'2': 'The black and white cat',
			'3': 'The black and green cat',
			'4': 'The black very special cat',
			'5': 'The black not very special cat'
		};
		return contents[id] || '';
	}

	// Handle witness toggle event
	function handleWitnessToggle(event: CustomEvent) {
		const { id } = event.detail;
		const witness = witnesses.find((w) => w.id === id);
		if (witness) {
			// Trigger reactivity by reassigning the witnesses array
			witnesses = witnesses;
			// Refetch collation when witness visibility changes
			fetchCollation();
		}
	}

	onMount(() => {
		fetchCollation();
	});

	// This function determines if a column contains identical text across all witnesses
	// Returns true if all non-empty values in the column are the same
	// For example:
	// - ["The", "The", "The", "The", "The"] returns true (all identical)
	// - ["black", "black", "striped", "black"] returns false (has different values)
	// - ["cat", "cat", "cat", "", "cat"] returns true (all non-empty values are identical)
	function isInvariant(column: string[]): boolean {
		// Filter out empty values
		const nonEmptyValues = column.filter((v) => v.length > 0);
		// Check if we have any values and if all values are the same
		return nonEmptyValues.length > 0 && new Set(nonEmptyValues).size === 1;
	}
</script>

<div class="relative overflow-hidden">
	<!-- Content -->
	<div class="grid h-full gap-8 overflow-x-auto pl-[350px] pr-10">
		<div class="mt-4 text-xl">Collaite X integration</div>

		<div class="flex flex-col gap-8">
			{#if alignmentData}
				<h3 class="mb-4 text-lg font-medium">Alignment Data</h3>
				<div class="overflow-x-auto">
					<table class="border-separate border-spacing-[2px]">
						<tbody>
							{#each alignmentData.witnesses as witness, witnessIndex}
								<tr>
									<!-- Witness label -->
									<td
										class="w-16 border border-gray-300 bg-base-100 px-2 py-1 text-center font-bold"
									>
										W{witness}
									</td>
									{#each alignmentData.table as column}
										{#if column[witnessIndex].length > 0}
											<td
												class="border-2 {isInvariant(column)
													? 'border-green-500'
													: 'border-base-content'} px-2 py-1 text-sm"
											>
												{column[witnessIndex]}
											</td>
										{:else}
											<td class="px-2 py-1" />
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="mt-8 w-full overflow-x-scroll rounded-lg bg-gray-200/50 p-4">
					<h3 class="mb-4 text-lg font-medium">Variant Graph</h3>
					<VariantGraph {alignmentData} />
				</div>

				<div class=" rounded-lg bg-gray-200/50 p-4">
					<h3 class="mb-2 text-lg font-medium">Raw JSON Response:</h3>
					<pre class="h-[300px] overflow-auto whitespace-pre-wrap rounded p-4 font-mono text-sm">
						{jsonData}
					</pre>
				</div>
			{/if}
		</div>
	</div>

	<div class="absolute bottom-4 left-4 top-4 flex gap-8 overflow-x-auto pr-10">
		<SettingsBar {witnesses} on:toggleWitness={handleWitnessToggle} />
	</div>
</div>
