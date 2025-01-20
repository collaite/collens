<script lang="ts">
	import { indexedDBStore } from '$lib/stores/indexeddb-store';
	import { witnessesStore } from '$lib/stores/witnesses.store';
	import { loadXMLContent, parseTEIXML } from '$lib/utils/witness-utils';
	import SettingsBar from '../SettingsBar.svelte';
	import VariantGraph from './VariantGraph.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Toggle from '$lib/components/Toggle.svelte';

	let xmlString = '';
	let jsonData = '';
	let alignmentData: any = null;
	let loading = true;
	let error = '';
	let isVerticalOrientation = true;

	async function fetchCollation() {
		loading = true;
		// Only include enabled witnesses in the payload
		const enabledWitnesses = $witnessesStore.filter((w) => w.enabled);

		try {
			// Get transcriptions for each witness
			const witnessTranscriptions = await Promise.all(
				enabledWitnesses.map(async (w) => {
					const xmlContent = await loadXMLContent(w.folder);
					if (!xmlContent) {
						console.error(`No XML content found for witness ${w.folder.id}`);
						return null;
					}
					// Parse the XML to get the final transcription
					const transcription = parseTEIXML(xmlContent, '1c'); // Using 1c to get final version
					return {
						id: w.folder.id.split('_')[1], // Extract the number from witness_X
						content: transcription
					};
				})
			);

			// Filter out any witnesses that failed to load
			const validWitnesses = witnessTranscriptions.filter(
				(w): w is { id: string; content: string } => w !== null
			);

			const payload = {
				algorithm: 'dekker',
				witnesses: validWitnesses
			};

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
				witnesses: validWitnesses.map((w) => w.id)
			};
		} catch (error) {
			console.error('Error fetching collation:', error);
		} finally {
			loading = false;
		}
	}

	// Handle witness toggle event
	function handleWitnessToggle(event: CustomEvent<{ id: string }>) {
		witnessesStore.toggleWitness(event.detail.id);
		// Refetch collation when witness visibility changes
		fetchCollation();
	}

	async function loadDocument(id: string) {
		try {
			await indexedDBStore.init();
			const selectedDocument = $indexedDBStore.find((folder) => folder.id === id);

			if (selectedDocument) {
				witnessesStore.getWitnessesFromDocument(selectedDocument);
				fetchCollation();
			} else {
				error = 'Document not found.';
			}
		} catch (e) {
			console.error('Error loading document:', e);
			error = 'An error occurred while loading the document.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const documentId = $page.url.searchParams.get('id');
		if (documentId) {
			loadDocument(documentId);
		}
	});

	// React to URL changes
	$: {
		const documentId = $page.url.searchParams.get('id');
		if (documentId) {
			loadDocument(documentId);
		}
	}

	// This function determines if a column contains identical text across all witnesses
	function isInvariant(column: string[]): boolean {
		// Filter out empty values
		const nonEmptyValues = column.filter((v) => v.length > 0);
		// Check if we have any values and if all values are the same
		return nonEmptyValues.length > 0 && new Set(nonEmptyValues).size === 1;
	}
</script>

<!-- <div class="h-[400px] overflow-auto whitespace-pre-wrap rounded p-4 font-mono text-sm">
	<pre>{JSON.stringify(
			$indexedDBStore,
			(key, value) => (key === 'src' ? undefined : value),
			2
		)}</pre>
</div> -->

<div class="relative overflow-hidden">
	<!-- Content -->
	<div class="grid h-full gap-8 overflow-x-auto pl-[350px] pr-10">
		<h2 class="mt-4 text-xl font-medium">Witness alignment - CollateX integration</h2>
		<div class="flex flex-col gap-8">
			{#if !alignmentData}
				<div class="flex h-[200px] items-center justify-center">
					<span class="loading loading-spinner loading-lg mr-3 text-primary"></span>
					Loading witness alignment...
				</div>
			{:else if alignmentData}
				<div class="mb-4 flex items-center">
					<Toggle
						label="Vertical orientation"
						checked={isVerticalOrientation}
						on:change={({ detail }) => (isVerticalOrientation = detail.checked)}
					/>
				</div>
				<div class="overflow-x-auto">
					<table class="border-separate border-spacing-[2px]">
						<tbody>
							{#if !isVerticalOrientation}
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
							{:else}
								<!-- Vertical orientation -->
								{#each alignmentData.table as column, columnIndex}
									<tr>
										<td
											class="w-16 border border-gray-300 bg-base-100 px-2 py-1 text-center font-bold"
										>
											{columnIndex + 1}
										</td>
										{#each alignmentData.witnesses as witness, witnessIndex}
											{#if column[witnessIndex].length > 0}
												<td
													class="border-2 {isInvariant(column)
														? 'border-green-500'
														: 'border-base-content'} px-2 py-1 text-sm"
												>
													<div class="flex items-center gap-2">
														<span class="text-xs font-semibold text-base-content/50">
															W{witness}:
														</span>
														{column[witnessIndex]}
													</div>
												</td>
											{:else}
												<td class="px-2 py-1" />
											{/if}
										{/each}
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>

				<div class="mt-8 w-full overflow-x-scroll rounded-lg bg-gray-200/50 p-4">
					<h3 class="mb-4 text-lg font-medium">Variant Graph</h3>
					<VariantGraph {alignmentData} />
				</div>

				<!-- <div class=" rounded-lg bg-gray-200/50 p-4">
					<h3 class="mb-2 text-lg font-medium">Raw JSON Response:</h3>
					<pre class="h-[300px] overflow-auto whitespace-pre-wrap rounded p-4 font-mono text-sm">
						{jsonData}
					</pre>
				</div> -->
			{/if}
		</div>
	</div>

	<div class="absolute bottom-4 left-4 top-4 flex gap-8 overflow-x-auto pr-10">
		<SettingsBar on:toggleWitness={handleWitnessToggle} />
	</div>
</div>
