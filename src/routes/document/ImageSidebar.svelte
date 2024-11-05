<script lang="ts">
	import { base } from '$app/paths';

	export let selectedFolder: any;
	export let selectedFile: any;
	export let getImageFiles: (folder: any) => any[];
</script>

<div
	class="w-[200px] bg-primary/60 rounded-lg backdrop-blur-xl grid grid-rows-[1fr_auto] overflow-hidden absolute top-4 left-4 bottom-4 p-4"
>
	<!-- Pages -->
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
