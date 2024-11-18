<script lang="ts">
	export let entry: {
		tag: string;
		content: string;
		level: number;
		children: any[];
	};
	export let level: number;

	// Function to get styles based on nesting level
	function getLevelStyles(level: number) {
		const baseClasses = 'mb-2';
		const levelSpecificClasses = {
			0: 'bg-primary/5 p-2 rounded-lg border border-primary/10',
			1: 'bg-secondary/5 p-2 rounded-md border border-secondary/10 ml-2',
			2: 'bg-accent/5 p-2 rounded border border-accent/10 ml-6',
			3: 'bg-neutral/5 p-2 rounded border border-neutral/10 ml-10'
		};

		return `${baseClasses} ${levelSpecificClasses[Math.min(level, 3) as keyof typeof levelSpecificClasses]}`;
	}

	// Function to get tag styles based on nesting level
	function getTagStyles(level: number) {
		const baseClasses = 'font-bold px-2 py-1 rounded-lg';
		const levelSpecificClasses = {
			0: ' bg-primary/20',
			1: ' bg-secondary/20',
			2: ' bg-accent/20',
			3: ' bg-neutral/20'
		};

		return `${baseClasses} ${levelSpecificClasses[Math.min(level, 3) as keyof typeof levelSpecificClasses]}`;
	}
</script>

<div class={getLevelStyles(level)}>
	<span class={getTagStyles(level)}>{entry.tag}</span>
	{#if entry.content}
		<div class="mt-2 text-base-content/90">{entry.content}</div>
	{/if}
	{#if entry.children.length > 0}
		<div class="mt-2">
			{#each entry.children as child}
				<svelte:self entry={child} level={level + 1} />
			{/each}
		</div>
	{/if}
</div>
