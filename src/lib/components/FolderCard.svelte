<script lang="ts">
	import { base } from '$app/paths';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';

	export let folder: Folder;
	export let onRemove: (id: string) => void;

	function isImageFile(file: FileData): boolean {
		const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'image/avif'];
		return imageTypes.includes(file.type);
	}

	function getVisibleImages(folder: Folder) {
		return (folder.files || []).filter(isImageFile).slice(0, 3);
	}

	function getFileStats(folder: Folder) {
		const files = folder.files || [];
		const imageCount = files.filter(isImageFile).length;
		return {
			total: files.length,
			images: imageCount,
			other: files.length - imageCount
		};
	}
</script>

<div class="card w-full bg-base-100 shadow-xl mb-8">
	<div class="card-body">
		<div class="flex justify-between items-start">
			<div>
				<h2 class="card-title">{folder.title}</h2>
				<p class="text-base-content/70">{folder.description}</p>
			</div>
			<button class="btn btn-sm btn-error" on:click={() => onRemove(folder.id)}>Remove</button>
		</div>
		<a href="{base}/document?id={folder.id}" class="block mt-4">
			<div class="grid grid-cols-3 gap-4">
				{#each getVisibleImages(folder) as file}
					<img src={file.src} alt={file.name} class="w-full h-auto rounded-lg shadow-md" />
				{/each}
			</div>
			{#if folder.files}
				{@const stats = getFileStats(folder)}
				<div class="mt-4 text-sm text-base-content/70">
					<p>Total files: {stats.total}</p>
					<p>Images: {stats.images}</p>
					<p>Other files: {stats.other}</p>
				</div>
			{/if}
		</a>
	</div>
</div>
