<script lang="ts">
	import { base } from '$app/paths';
	import { persisted } from 'svelte-persisted-store';

	interface ImageData {
		name: string;
		src: string;
	}

	interface FolderData {
		id: string;
		images: ImageData[];
	}

	const foldersStore = persisted<FolderData[]>('folders', []);
	let isDragging = false;
	let errorMessage = '';

	const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'avif'];

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		errorMessage = '';

		const items = Array.from(event.dataTransfer?.items || []);
		const imageFiles: File[] = [];

		for (const item of items) {
			if (item.kind === 'file') {
				const entry = item.webkitGetAsEntry();
				if (entry && entry.isDirectory) {
					await processDirectory(entry, imageFiles);
				}
			}
		}

		const filteredImageFiles = imageFiles.filter((file) => {
			const extension = file.name.split('.').pop()?.toLowerCase();
			return (
				allowedExtensions.includes(extension || '') &&
				['1', '2', '3'].includes(file.name.split('.')[0])
			);
		});

		if (filteredImageFiles.length < 3) {
			errorMessage =
				'Please drop a folder containing at least 3 image files named 1, 2, and 3 with extensions: png, jpg, webp, tiff, or avif.';
			return;
		}

		const imagePromises = filteredImageFiles.map((file) => {
			return new Promise<ImageData>((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const target = e.target as FileReader;
					resolve({ name: file.name, src: target.result as string });
				};
				reader.readAsDataURL(file);
			});
		});

		Promise.all(imagePromises).then((images) => {
			foldersStore.update((folders) => [...folders, { id: Date.now().toString(), images }]);
		});
	}

	function processDirectory(directoryEntry: any, imageFiles: File[]): Promise<void> {
		return new Promise((resolve) => {
			const reader = directoryEntry.createReader();
			reader.readEntries((entries: any[]) => {
				const promises = entries.map((entry) => {
					if (entry.isFile) {
						return new Promise<void>((fileResolve) => {
							entry.file((file: File) => {
								imageFiles.push(file);
								fileResolve();
							});
						});
					} else if (entry.isDirectory) {
						return processDirectory(entry, imageFiles);
					}
					return Promise.resolve();
				});
				Promise.all(promises).then(() => resolve());
			});
		});
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function removeFolder(id: string) {
		foldersStore.update((folders) => folders.filter((folder) => folder.id !== id));
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen overflow-auto -mt-28">
	<div class="hero min-h-screen">
		<div class="hero-content text-neutral-content text-center">
			<div class="max-w-md text-primary">
				<h1 class="mb-5 text-5xl font-bold">Collens</h1>
				<p class="mb-5">Web visualization tool for COLLaiTE.</p>
				<a class="btn btn-primary btn-md" href="{base}/document">Open Document</a>

				<div
					class="mt-8 border-4 border-dashed rounded-lg p-8 transition-colors duration-300 ease-in-out"
					class:border-blue-500={isDragging}
					class:border-gray-300={!isDragging}
					on:drop={handleDrop}
					on:dragover={handleDragOver}
					on:dragleave={handleDragLeave}
				>
					<p class="text-lg font-semibold mb-2">Drag and drop a folder with images here</p>
					<p class="text-sm text-gray-600">
						The folder should contain at least 3 image files named 1, 2, and 3 with extensions: png,
						jpg, webp, tiff, or avif.
					</p>
				</div>

				{#if errorMessage}
					<p class="text-red-500 mt-4">{errorMessage}</p>
				{/if}

				<div class="mt-8">
					{#if $foldersStore.length === 0}
						<p class="text-gray-600">
							No images loaded yet. Drag and drop a folder to get started.
						</p>
					{:else}
						{#each $foldersStore as folder, index}
							<div class="mb-8 p-4 bg-gray-100 rounded-lg relative">
								<h2 class="text-lg font-semibold mb-2">Folder {index + 1}</h2>
								<button
									class="absolute top-2 right-2 text-red-500 hover:text-red-700"
									on:click={() => removeFolder(folder.id)}
								>
									Remove
								</button>
								<a href="{base}/document?id={folder.id}" class="block">
									<div class="grid grid-cols-3 gap-4">
										{#each folder.images as image}
											<img
												src={image.src}
												alt={image.name}
												class="w-full h-auto rounded-lg shadow-md"
											/>
										{/each}
									</div>
								</a>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Add any additional styles here if needed */
</style>
