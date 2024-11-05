<script lang="ts">
	import { foldersStore } from '$lib/stores/documents.store';
	import ImageSidebar from './ImageSidebar.svelte';

	export let selectedFile: any = {};
	export let selectedFolder: any = {};
	export let getImageFiles: (folder: any) => any[];
</script>

<!-- <pre>{JSON.stringify($foldersStore, null, 2)}</pre> -->
<!-- <ImageSidebar {selectedFolder} {selectedFile} {getImageFiles} /> -->
<ImageSidebar />

<div class="my-4 flex-shrink-0 bg-red-400">
	{#if selectedFile}
		<img
			draggable="false"
			class="h-auto w-[500px] drop-shadow-custom"
			src={selectedFile.src}
			alt={selectedFile.name}
		/>
	{/if}
</div>
<div class="my-6 w-[500px] flex-shrink-0 rounded bg-blue-300 p-4">w1</div>
