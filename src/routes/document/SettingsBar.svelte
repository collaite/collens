<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import Toggle from '../../lib/components/Toggle.svelte';
	import { witnessesStore } from '$lib/stores/witnesses.store';
	import MetricCircle from '../../lib/components/MetricCircle.svelte';

	import IcBaselineArrowBack from '~icons/ic/baseline-arrow-back';
	import PhLinkLight from '~icons/ph/link-light';

	$: isCollateX = $page.route.id === '/document/x';

	import type { WitnessStats } from '$lib/utils/witness-utils';

	// Subscribe to the witnesses store
	$: witnesses = $witnessesStore;

	// Calculate total changes for each witness
	function getTotalChanges(metrics: WitnessStats): number {
		return metrics.deletions + metrics.additions + metrics.substitutions + metrics.transpositions;
	}

	function handleToggle(witness: any, event: CustomEvent<{ checked: boolean }>) {
		witnessesStore.toggleWitness(witness.folder.id);
	}
</script>

<div
	class="flex h-full w-72 flex-col rounded-lg bg-primary/70 p-4 text-primary-content backdrop-blur-xl"
>
	<h2 class="text-content/80 mb-4 text-xl font-semibold">Witnesses</h2>

	<div class="space-y-3">
		{#each witnesses as witness}
			<div
				class="rounded-lg bg-primary/80 p-3 filter"
				class:opacity-60={!witness.enabled}
				class:grayscale={!witness.enabled}
			>
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<!-- <span class="font-medium">{witness.folder.id}-</span> -->
						<span class="text-content/70">{witness.folder.title}</span>
					</div>

					<div class="tooltip" data-tip="Hide/View Witness">
						<Toggle checked={witness.enabled} on:change={(e) => handleToggle(witness, e)} />
					</div>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex gap-2">
						<!-- Deletions (Red) -->
						<MetricCircle
							value={witness.metrics.deletions}
							maxValue={getTotalChanges(witness.metrics) || 1}
							color="rgb(239, 68, 68)"
							tooltip="Deletions"
						/>

						<!-- Additions (Green) -->
						<MetricCircle
							value={witness.metrics.additions}
							maxValue={getTotalChanges(witness.metrics) || 1}
							color="rgb(34, 197, 94)"
							tooltip="Additions"
						/>

						<!-- Substitutions (Purple) -->
						<MetricCircle
							value={witness.metrics.substitutions}
							maxValue={getTotalChanges(witness.metrics) || 1}
							color="rgb(147, 51, 234)"
							tooltip="Substitutions"
						/>

						<!-- Transpositions (Orange) -->
						<MetricCircle
							value={witness.metrics.transpositions}
							maxValue={getTotalChanges(witness.metrics) || 1}
							color="rgb(249, 115, 22)"
							tooltip="Transpositions"
						/>
					</div>

					<!-- Total changes -->
					<div class="tooltip tooltip-bottom" data-tip="Total changes">
						<span class="text-sm">Total:</span>
						<span class="text-sm font-medium">{getTotalChanges(witness.metrics)}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- TODO: Add legend when we have a proper heatmap -->
	<!-- {#if !isCollateX}
		<div class="mt-4">
			<h3 class="mb-2 text-base font-medium">Legend</h3>
			<div
				class="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
			></div>
		</div>
	{/if} -->

	<div class="mt-auto pt-4">
		<a
			href={isCollateX
				? `${base}/document?id=${$page.url.searchParams.get('id')}`
				: `${base}/document/x/?id=${$page.url.searchParams.get('id')}`}
		>
			<button class="btn btn-primary mb-20 w-full gap-2" class:btn-secondary={isCollateX}>
				{#if isCollateX}
					<IcBaselineArrowBack />
					Go back
				{:else}
					<PhLinkLight />
					CollateX
				{/if}
			</button>
		</a>

		<!-- Logos -->
		<div class="mt-4 flex items-center justify-center gap-8">
			<a href="https://www.huygens.knaw.nl/en/" target="_blank">
				<img class="h-6" src="{base}/images/huygens-light.png" alt="Huygens" />
			</a>
			<a href="https://www.esciencecenter.nl/" target="_blank">
				<img class="h-6" src="{base}/images/escience-light.png" alt="eScience Center" />
			</a>
		</div>
	</div>
</div>
