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

<div class="group h-[500px] transition-all duration-500 hover:scale-105">
	<a href="{base}/document?id={folder.id}" class="block">
		<div class="mb-8 w-full">
			<div class="relative mb-4 flex h-64 w-full items-center justify-center">
				{#each getVisibleImages(folder).reverse() as file, i}
					<div
						class="card-item absolute h-auto w-48 transition-all duration-500 ease-in-out"
						style="--index: {i};"
					>
						<img
							src={file.src}
							alt={file.name}
							class="h-full w-full rounded object-cover"
							style="filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));"
						/>
					</div>
				{/each}
			</div>
		</div>
		<div class="px-4 text-center">
			<h2 class="mb-2 text-2xl font-bold">{folder.title}</h2>
			<p class="line-clamp-3 opacity-70">{folder.description || 'Description...'}</p>

			{#if folder.files}
				{@const stats = getFileStats(folder)}
				<div class="mt-4 flex items-center gap-4 text-sm text-base-content/70">
					<p>Files: {stats.total}</p>
					<p>Images: {stats.images}</p>
					<p>Other: {stats.other}</p>
				</div>
			{/if}
			<button class="btn btn-outline btn-sm mt-4" on:click={() => onRemove(folder.id)}>
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
