<script lang="ts">
	import { foldersStore } from '$lib/stores/documents.store';
	import ImageSidebar from './ImageSidebar.svelte';
	import type { Folder, FileData } from '$lib/stores/indexeddb-store';
	import WitnessHeader from './WitnessHeader.svelte';
	import WitnessImageViewer from './WitnessImageViewer.svelte';
	import WitnessTranscription from './WitnessTranscription.svelte';
	import {
		getPageNumber,
		loadXMLContent,
		parseTEIXML,
		parseTEIHeader
	} from '$lib/utils/witness-utils';

	export let selectedFile: FileData | undefined = undefined;
	export let selectedFolder: Folder | undefined = undefined;
	export let getImageFiles: (folder: Folder) => FileData[];

	// Sort image files numerically by page number
	$: imageFiles = selectedFolder
		? getImageFiles(selectedFolder).sort((a, b) => {
				const pageA = parseInt(getPageNumber(a)) || 0;
				const pageB = parseInt(getPageNumber(b)) || 0;
				return pageA - pageB;
			})
		: [];

	$: witnessId = selectedFolder?.id?.replace('witness_', '') || '1';
	$: witnessTitle = selectedFolder?.title || 'Witness title';

	let showMiddleColumn = true;
	let xmlContent: string | null = null;
	let showParsedText = true;
	let transcriptionComponent: WitnessTranscription;

	$: if (selectedFolder) {
		loadXMLContent(selectedFolder).then((content) => {
			xmlContent = content;
		});
	}

	// Parse XML content with default witness type ('1c')
	$: parsedContent = xmlContent ? parseTEIXML(xmlContent) : null;
	$: headerEntries = xmlContent ? parseTEIHeader(xmlContent) : [];

	function handleImageSelect(event: CustomEvent<FileData>) {
		selectedFile = event.detail;
		const pageNumber = getPageNumber(event.detail);
		if (pageNumber && transcriptionComponent) {
			transcriptionComponent.scrollToPage(pageNumber);
		}
	}

	function handlePageScroll(event: CustomEvent<{ pageNumber: string }>) {
		const imageFile = imageFiles.find((file) => getPageNumber(file) === event.detail.pageNumber);
		if (imageFile && imageFile !== selectedFile) {
			selectedFile = imageFile;
		}
	}
</script>

<div class="flex h-full flex-shrink-0 flex-col gap-1">
	<WitnessHeader {witnessId} {witnessTitle} bind:showMiddleColumn />

	<div class="flex min-h-0 flex-1 gap-2">
		<div class="w-[160px] flex-shrink-0">
			<ImageSidebar
				{selectedFolder}
				{selectedFile}
				{getImageFiles}
				on:imageSelect={handleImageSelect}
			/>
		</div>

		{#if showMiddleColumn}
			<WitnessImageViewer {selectedFile} {witnessId} {witnessTitle} />
		{/if}

		<WitnessTranscription
			bind:this={transcriptionComponent}
			{selectedFile}
			{witnessId}
			{xmlContent}
			{parsedContent}
			{headerEntries}
			{showParsedText}
			on:pageScroll={handlePageScroll}
		/>
	</div>
</div>
