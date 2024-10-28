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

<div class="h-[500px] group hover:scale-105 transition-all duration-500">
	<a href="{base}/document?id={folder.id}" class="block">
		<div class=" w-full mb-8">
			<div class="relative flex items-center justify-center h-64 w-full mb-4">
				{#each getVisibleImages(folder).reverse() as file, i}
					<div
						class="card-item absolute w-48 h-auto transition-all duration-500 ease-in-out"
						style="--index: {i};"
					>
						<img
							src={file.src}
							alt={file.name}
							class="w-full h-full object-cover rounded"
							style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));"
						/>
					</div>
				{/each}
			</div>
		</div>
		<div class="text-center px-4">
			<h2 class="text-2xl font-bold mb-2">{folder.title}</h2>
			<p class="opacity-70 line-clamp-3">{folder.description || 'Description...'}</p>

			{#if folder.files}
				{@const stats = getFileStats(folder)}
				<div class="mt-4 text-sm text-base-content/70">
					<p>Total files: {stats.total}</p>
					<p>Images: {stats.images}</p>
					<p>Other files: {stats.other}</p>
				</div>
			{/if}
			<button class="btn btn-sm btn-outline mt-4" on:click={() => onRemove(folder.id)}>
				Remove
			</button>
		</div>
	</a>
</div>

<style>
	.card-item {
		transform: rotate(calc(var(--index) * -8deg))
			translate(calc(var(--index) * 12px), calc(var(--index) * 8px));
		will-change: transform;
	}

	.group:hover .card-item:nth-child(1) {
		transform: translate(-40px, 20px) rotate(-15deg);
	}

	.group:hover .card-item:nth-child(2) {
		transform: translate(0, -30px) rotate(0deg);
	}

	.group:hover .card-item:nth-child(3) {
		transform: translate(40px, 20px) rotate(15deg);
	}
</style>
