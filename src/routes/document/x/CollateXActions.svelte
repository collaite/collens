<script lang="ts">
	import { toastStore } from '$lib/stores/toast.store';
	import LucideDownload from '~icons/lucide/download';
	import LucideCopy from '~icons/lucide/copy';

	export let jsonData: string;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(jsonData);
			toastStore.success('CollateX output copied to clipboard');
		} catch (error) {
			console.error('Failed to copy:', error);
			toastStore.error('Failed to copy to clipboard');
		}
	}

	function downloadJson() {
		try {
			const blob = new Blob([jsonData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'collatex-output.json';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toastStore.success('CollateX output downloaded');
		} catch (error) {
			console.error('Failed to download:', error);
			toastStore.error('Failed to download file');
		}
	}
</script>

<div class="flex gap-2">
	<button
		class="btn btn-sm gap-2"
		on:click={copyToClipboard}
		title="Copy CollateX output to clipboard"
	>
		<LucideCopy />
		Copy Output
	</button>

	<button class="btn btn-sm gap-2" on:click={downloadJson} title="Download CollateX output as JSON">
		<LucideDownload />
		Download JSON
	</button>
</div>
