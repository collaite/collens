<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="-mt-20 w-full overflow-auto break-words px-3">
	<div class="prose mx-auto py-20 sm:prose-lg">
		{@render children?.()}
	</div>
</div>
