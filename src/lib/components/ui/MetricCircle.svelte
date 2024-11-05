<script lang="ts">
	export let value: number;
	export let maxValue: number = 10;
	export let color: string;
</script>

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
			stroke={color}
			stroke-width="3"
			fill="none"
			stroke-dasharray={2 * Math.PI * 8}
			stroke-dashoffset={2 * Math.PI * 8 * (1 - value / maxValue)}
			class="transform origin-center"
		/>
	</svg>
	<span class="absolute inset-0 flex items-center justify-center text-xs">
		{value}
	</span>
</div>
