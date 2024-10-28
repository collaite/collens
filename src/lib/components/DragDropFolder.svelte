<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FileData } from '$lib/stores/indexeddb-store';

	const dispatch = createEventDispatcher();

	let isDragging = false;
	let errorMessage = '';

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		errorMessage = '';

		const items = Array.from(event.dataTransfer?.items || []);
		const files: { file: File; path: string }[] = [];

		try {
			for (const item of items) {
				if (item.kind === 'file') {
					const entry = item.webkitGetAsEntry();
					if (entry) {
						if (entry.isDirectory) {
							await processDirectory(entry, '', files);
						} else {
							const file = await getFileFromEntry(entry);
							if (file) {
								files.push({ file, path: file.name });
							}
						}
					}
				}
			}

			if (files.length === 0) {
				errorMessage = 'Please drop at least one file or folder.';
				return;
			}

			const filePromises = files.map(({ file, path }) => {
				return new Promise<FileData>((resolve) => {
					const reader = new FileReader();
					reader.onload = (e) => {
						const target = e.target as FileReader;
						resolve({
							name: file.name,
							size: file.size,
							type: file.type,
							lastModified: file.lastModified,
							src: target.result as string,
							path
						});
					};
					reader.readAsDataURL(file);
				});
			});

			const processedFiles = await Promise.all(filePromises);
			dispatch('folderDropped', { files: processedFiles });
		} catch (error) {
			console.error('Error processing files:', error);
			errorMessage = 'An error occurred while processing the files.';
		}
	}

	function getFileFromEntry(entry: any): Promise<File | null> {
		return new Promise((resolve) => {
			if (entry.isFile) {
				entry.file((file: File) => resolve(file));
			} else {
				resolve(null);
			}
		});
	}

	function processDirectory(
		directoryEntry: any,
		currentPath: string,
		files: { file: File; path: string }[]
	): Promise<void> {
		return new Promise((resolve) => {
			const reader = directoryEntry.createReader();
			const readEntries = () => {
				reader.readEntries(async (entries: any[]) => {
					if (entries.length === 0) {
						resolve();
						return;
					}

					const promises = entries.map((entry) => {
						const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;
						if (entry.isFile) {
							return new Promise<void>((fileResolve) => {
								entry.file((file: File) => {
									files.push({ file, path });
									fileResolve();
								});
							});
						} else if (entry.isDirectory) {
							return processDirectory(entry, path, files);
						}
						return Promise.resolve();
					});

					await Promise.all(promises);
					readEntries(); // Continue reading if there are more entries
				});
			};

			readEntries();
		});
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}
</script>

<div
	class="mt-8 border-gray-400 border-4 border-dashed rounded-lg p-8 transition-colors duration-300 ease-in-out"
	class:!border-blue-500={isDragging}
	on:drop={handleDrop}
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
>
	<p class="text-lg font-semibold mb-2">Drag and drop files or folders here</p>
	<p class="text-sm text-gray-600">
		You can drop any type of files or folders. The folder structure will be preserved.
	</p>
</div>

{#if errorMessage}
	<p class="text-red-500 mt-4">{errorMessage}</p>
{/if}
