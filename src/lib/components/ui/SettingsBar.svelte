<script lang="ts">
	import MetricCircle from './MetricCircle.svelte';

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
					<input
						type="checkbox"
						class="toggle toggle-primary hover:bg-base-300"
						checked={witness.enabled}
					/>
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

					<a href="/x">
						<button class="btn btn-ghost btn-sm px-1">
							<svg
								width="18"
								height="21"
								viewBox="0 0 18 21"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M1.18619 1.9816C0.0444335 3.12238 0.0444336 4.95971 0.0444336 8.6334V12.5302C0.0444336 16.2039 0.0444335 18.0412 1.18619 19.182C2.32794 20.3228 4.1643 20.3237 7.83799 20.3237H9.78638C13.4601 20.3237 15.2974 20.3237 16.4382 19.182C17.579 18.0402 17.5799 16.2039 17.5799 12.5302V8.6334C17.5799 4.95971 17.5799 3.12238 16.4382 1.9816C15.2964 0.840818 13.4601 0.839844 9.78638 0.839844H7.83799C4.1643 0.839844 2.32697 0.839844 1.18619 1.9816ZM4.18476 6.68501C4.18476 6.49123 4.26174 6.30539 4.39876 6.16837C4.53578 6.03134 4.72163 5.95436 4.91541 5.95436H12.709C12.9027 5.95436 13.0886 6.03134 13.2256 6.16837C13.3626 6.30539 13.4396 6.49123 13.4396 6.68501C13.4396 6.87879 13.3626 7.06463 13.2256 7.20165C13.0886 7.33868 12.9027 7.41566 12.709 7.41566H4.91541C4.72163 7.41566 4.53578 7.33868 4.39876 7.20165C4.26174 7.06463 4.18476 6.87879 4.18476 6.68501ZM4.18476 10.5818C4.18476 10.388 4.26174 10.2022 4.39876 10.0651C4.53578 9.92812 4.72163 9.85114 4.91541 9.85114H12.709C12.9027 9.85114 13.0886 9.92812 13.2256 10.0651C13.3626 10.2022 13.4396 10.388 13.4396 10.5818C13.4396 10.7756 13.3626 10.9614 13.2256 11.0984C13.0886 11.2355 12.9027 11.3124 12.709 11.3124H4.91541C4.72163 11.3124 4.53578 11.2355 4.39876 11.0984C4.26174 10.9614 4.18476 10.7756 4.18476 10.5818ZM4.91541 13.7479C4.72163 13.7479 4.53578 13.8249 4.39876 13.9619C4.26174 14.0989 4.18476 14.2848 4.18476 14.4786C4.18476 14.6723 4.26174 14.8582 4.39876 14.9952C4.53578 15.1322 4.72163 15.2092 4.91541 15.2092H9.78638C9.98016 15.2092 10.166 15.1322 10.303 14.9952C10.44 14.8582 10.517 14.6723 10.517 14.4786C10.517 14.2848 10.44 14.0989 10.303 13.9619C10.166 13.8249 9.98016 13.7479 9.78638 13.7479H4.91541Z"
									fill="#F2EDD8"
								/>
							</svg>
						</button>
					</a>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-4">
		<h3 class="text-base font-medium mb-2">Legend</h3>
		<div
			class="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
		></div>
	</div>

	<div class="mt-auto pt-4">
		<button class="btn btn-primary w-full gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
				/>
			</svg>
			Collate X
		</button>
	</div>
</div>
