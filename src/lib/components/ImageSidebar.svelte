<script lang="ts">
	import { base } from '$app/paths';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';

	export let selectedFolder: Folder | undefined;
	export let selectedFile: FileData | undefined;
	export let getImageFiles: (folder: Folder) => FileData[];
</script>

<div
	class="min-w-[200px] bg-primary/60 rounded-lg backdrop-blur-xl grid grid-rows-[1fr_auto] overflow-hidden p-4"
>
	hlaksjdhf kajsdhfl kashdfl kajshdf lkajhsdfl kjhasldk fjhakl sjdfh
	<!-- Pages -->
	{#if selectedFolder}
		<div class="overflow-auto">
			{#each getImageFiles(selectedFolder) as file, index}
				<button class="mb-4 w-full" on:click={() => (selectedFile = file)}>
					<img
						draggable="false"
						class="w-full h-auto drop-shadow-custom rounded-lg border-4 border-transparent select-none hover:border-white transition"
						class:!border-secondary={selectedFile === file}
						src={file.src}
						alt={file.name}
					/>
					<span class="text-white">{index + 1}</span>
				</button>
			{/each}
		</div>
	{/if}
	<!-- Logos -->
	<div class="mt-4 flex gap-4">
		<a href="https://www.huygens.knaw.nl/en/" target="_blank">
			<img class="h-6" src="{base}/images/huygens-light.png" alt="Huygens" />
		</a>
		<a href="https://www.esciencecenter.nl/" target="_blank">
			<img class="h-6" src="{base}/images/escience-light.png" alt="eScience Center" />
		</a>
	</div>
</div>
