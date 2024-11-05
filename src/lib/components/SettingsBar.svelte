<script lang="ts">
	import MetricCircle from './MetricCircle.svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import IcBaselineArrowBack from '~icons/ic/baseline-arrow-back';
	import PhLinkLight from '~icons/ph/link-light';
	import FluentDocumentBulletListMultiple20Filled from '~icons/fluent/document-bullet-list-multiple-20-filled';

	import Toggle from './Toggle.svelte';

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

	let witnesses: WitnessData[] = [
		{
			id: 'W1',
			title: 'Witness title',
			enabled: true,
			metrics: { red: 12, blue: 2, green: 12, yellow: 10 }
		},
		{
			id: 'W2',
			title: 'Witness title',
			enabled: false,
			metrics: { red: 5, blue: 10, green: 12, yellow: 0 }
		},
		{
			id: 'W3',
			title: 'Witness title',
			enabled: false,
			metrics: { red: 5, blue: 2, green: 12, yellow: 0 }
		},
		{
			id: 'W4',
			title: 'Witness title',
			enabled: true,
			metrics: { red: 5, blue: 2, green: 12, yellow: 0 }
		}
	];
</script>

<div
	class="bg-primary/70 backdrop-blur-xl w-72 h-full flex flex-col p-4 rounded-lg text-primary-content"
>
	<h2 class="text-xl font-semibold mb-4 text-content/80">Witnesses</h2>

	<div class="space-y-3">
		{#each witnesses as witness}
			<div class="bg-primary/80 p-3 rounded-lg">
				<div class="flex justify-between items-center mb-2">
					<div class="flex items-center gap-2">
						<span class="font-medium">{witness.id}-</span>
						<span class="text-content/70">{witness.title}</span>
					</div>

					<Toggle checked={witness.enabled} />
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
							class="btn btn-ghost btn-sm px-1 tooltip tooltip-bottom"
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
			<h3 class="text-base font-medium mb-2">Legend</h3>
			<div
				class="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
			></div>
		</div>
	{/if}

	<div class="mt-auto pt-4">
		<a
			href={isCollateX
				? `${base}/document?id=${$page.url.searchParams.get('id')}`
				: `${base}/document/x/?id=${$page.url.searchParams.get('id')}`}
		>
			<button class="btn btn-primary w-full gap-2 mb-20" class:btn-secondary={isCollateX}>
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
		</div>
	</div>
</div>
