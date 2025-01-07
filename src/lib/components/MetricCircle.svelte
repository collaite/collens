<script lang="ts">
	export let value: number;
	export let maxValue: number = 10;
	export let color: string;
	export let tooltip: string;
</script>

<div class="tooltip" data-tip={tooltip} data-place="bottom">
	<div class="relative h-8 w-8">
		<svg class="h-8 w-8 -rotate-90 transform text-primary">
			<circle
				cx="16"
				cy="16"
				r="12"
				stroke="currentColor"
				stroke-width="3"
				fill="none"
				class="text-content/10"
			/>
			<circle
				cx="16"
				cy="16"
				r="12"
				stroke={color}
				stroke-width="3"
				fill="none"
				stroke-dasharray={2 * Math.PI * 12}
				stroke-dashoffset={2 * Math.PI * 12 * (1 - value / maxValue)}
				class="origin-center transform"
			/>
		</svg>
		<span class="absolute inset-0 flex items-center justify-center text-[11px] font-medium">
			{value}
		</span>
	</div>
</div>
