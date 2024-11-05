<script lang="ts">
	import ImageSidebar from '$components/ImageSidebar.svelte';

	export let selectedFile: any = {};
	export let selectedFolder: any = {};
	export let getImageFiles: (folder: any) => any[];
</script>

<!-- <ImageSidebar {selectedFolder} {selectedFile} {getImageFiles} /> -->
<ImageSidebar />

<div class="my-4 flex-shrink-0 bg-red-400">
	{#if selectedFile}
		<img
			draggable="false"
			class="w-[500px] h-auto drop-shadow-custom"
			src={selectedFile.src}
			alt={selectedFile.name}
		/>
	{/if}
</div>
<div class="bg-blue-300 w-[500px] my-6 rounded p-4 flex-shrink-0">w1</div>
