<script lang="ts">
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
						<div class="relative w-6 h-6">
							<svg class="w-6 h-6 transform -rotate-90 text-primary">
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="currentColor"
									stroke-width="3"
									fill="none"
									class="text-content/10"
								/>
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="rgb(239, 68, 68)"
									stroke-width="3"
									fill="none"
									stroke-dasharray={2 * Math.PI * 8}
									stroke-dashoffset={2 * Math.PI * 8 * (1 - witness.metrics.red / 10)}
									class="transform origin-center"
								/>
							</svg>
							<span class="absolute inset-0 flex items-center justify-center text-xs">
								{witness.metrics.red}
							</span>
						</div>

						<!-- Blue metric -->
						<div class="relative w-6 h-6">
							<svg class="w-6 h-6 transform -rotate-90 text-primary">
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="currentColor"
									stroke-width="3"
									fill="none"
									class="text-content/10"
								/>
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="rgb(59, 130, 246)"
									stroke-width="3"
									fill="none"
									stroke-dasharray={2 * Math.PI * 8}
									stroke-dashoffset={2 * Math.PI * 8 * (1 - witness.metrics.blue / 10)}
									class="transform origin-center"
								/>
							</svg>
							<span class="absolute inset-0 flex items-center justify-center text-xs">
								{witness.metrics.blue}
							</span>
						</div>

						<!-- Green metric -->
						<div class="relative w-6 h-6">
							<svg class="w-6 h-6 transform -rotate-90 text-primary">
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="currentColor"
									stroke-width="3"
									fill="none"
									class="text-content/10"
								/>
								<circle
									cx="12"
									cy="12"
									r="8"
									stroke="rgb(34, 197, 94)"
									stroke-width="3"
									fill="none"
									stroke-dasharray={2 * Math.PI * 8}
									stroke-dashoffset={2 * Math.PI * 8 * (1 - witness.metrics.green / 15)}
									class="transform origin-center"
								/>
							</svg>
							<span class="absolute inset-0 flex items-center justify-center text-xs">
								{witness.metrics.green}
							</span>
						</div>
					</div>

					<!-- Yellow metric -->
					<div class="relative w-6 h-6">
						<svg class="w-6 h-6 transform -rotate-90 text-primary">
							<circle
								cx="12"
								cy="12"
								r="8"
								stroke="currentColor"
								stroke-width="3"
								fill="none"
								class="text-content/10"
							/>
							<circle
								cx="12"
								cy="12"
								r="8"
								stroke="rgb(238, 197, 94)"
								stroke-width="3"
								fill="none"
								stroke-dasharray={2 * Math.PI * 8}
								stroke-dashoffset={2 * Math.PI * 8 * (1 - witness.metrics.yellow / 15)}
								class="transform origin-center"
							/>
						</svg>
						<span class="absolute inset-0 flex items-center justify-center text-xs">
							{witness.metrics.green}
						</span>
					</div>

					<button class="btn btn-ghost btn-sm px-1">
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
								d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
							/>
						</svg>
					</button>
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
