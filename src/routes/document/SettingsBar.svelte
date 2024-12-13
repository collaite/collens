<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import Toggle from '../../lib/components/Toggle.svelte';
	import { createEventDispatcher } from 'svelte';

	import MetricCircle from '../../lib/components/MetricCircle.svelte';

	import IcBaselineArrowBack from '~icons/ic/baseline-arrow-back';
	import PhLinkLight from '~icons/ph/link-light';
	import FluentDocumentBulletListMultiple20Filled from '~icons/fluent/document-bullet-list-multiple-20-filled';
	import PhGithubLogo from '~icons/ph/github-logo';

	const dispatch = createEventDispatcher();

	$: isCollateX = $page.route.id === '/document/x';

	interface WitnessData {
		id: string;
		title: string;
		enabled: boolean;
		metrics: {
			red: number;
			blue: number;
			green: number;
			yellow: number;
		};
	}

	export let witnesses: WitnessData[] = [];

	function handleToggle(witness: WitnessData, event: CustomEvent<{ checked: boolean }>) {
		witness.enabled = event.detail.checked;
		dispatch('toggleWitness', { id: witness.id });
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
						<span class="font-medium">{witness.id}-</span>
						<span class="text-content/70">{witness.title}</span>
					</div>

					<Toggle checked={witness.enabled} on:change={(e) => handleToggle(witness, e)} />
				</div>

				<div class="flex items-center justify-between">
					<div class="flex gap-2">
						<!-- Red metric -->
						<MetricCircle value={witness.metrics.red} maxValue={10} color="rgb(239, 68, 68)" />

						<!-- Blue metric -->
						<MetricCircle value={witness.metrics.blue} maxValue={10} color="rgb(59, 130, 246)" />

						<!-- Green metric -->
						<MetricCircle value={witness.metrics.green} maxValue={15} color="rgb(34, 197, 94)" />

						<!-- Yellow metric -->
						<MetricCircle value={witness.metrics.yellow} maxValue={15} color="rgb(238, 197, 94)" />
					</div>

					<!-- Internal review button -->
					<a href={`${base}/document/internal/?id=${$page.url.searchParams.get('id')}`}>
						<button
							class="btn btn-ghost btn-sm tooltip tooltip-bottom px-1"
							data-tip="Open Internal review"
						>
							<FluentDocumentBulletListMultiple20Filled class="size-6" />
						</button>
					</a>
				</div>
			</div>
		{/each}
	</div>

	{#if !isCollateX}
		<div class="mt-4">
			<h3 class="mb-2 text-base font-medium">Legend</h3>
			<div
				class="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
			></div>
		</div>
	{/if}

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
					Collate X
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
			<a href="https://github.com/collaite/collens" target="_blank" class="text-white">
				<PhGithubLogo class="h-6 w-6" />
			</a>
		</div>
	</div>
</div>
