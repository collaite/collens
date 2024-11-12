<script lang="ts">
	import SettingsBar from '../SettingsBar.svelte';
	import { onMount } from 'svelte';

	let xmlString = '';
	let jsonData = '';
	let alignmentData: any = null;

	async function fetchCollation() {
		const payload = {
			algorithm: 'dekker',
			witnesses: [
				{
					id: '1',
					content: 'The black cat'
				},
				{
					id: '2',
					content: 'The black and white cat'
				},
				{
					id: '3',
					content: 'The black and green cats'
				},
				{
					id: '4',
					content: 'The black very special cat'
				},
				{
					id: '5',
					content: 'The black not very special cat'
				}
			]
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

			alignmentData = jsonResult;
		} catch (error) {
			console.error('Error fetching collation:', error);
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

<div class="relative">
	<!-- Content -->
	<div class="flex h-full gap-8 overflow-x-auto pl-[350px] pr-10">
		<div class="mt-20 text-xl">collaite x</div>

		<div class="flex flex-col gap-8">
			{#if alignmentData}
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
			{/if}

			<div class="rounded-lg bg-base-200 p-4">
				<h3 class="mb-2 text-lg font-medium">Raw JSON Response:</h3>
				<pre class="whitespace-pre-wrap rounded bg-base-300 p-4 font-mono text-sm">{jsonData}</pre>
			</div>
		</div>
	</div>

	<div class="absolute bottom-4 left-4 top-4 flex gap-8 overflow-x-auto pr-10">
		<SettingsBar />
	</div>
</div>

<style>
	.variant {
		background-color: rgba(255, 0, 0, 0.1);
	}
	.invariant {
		background-color: rgba(0, 255, 0, 0.1);
	}
	.gap {
		background-color: rgba(128, 128, 128, 0.1);
	}
</style>
