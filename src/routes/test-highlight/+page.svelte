<script>
	import CodeHighlight from '$lib/components/ui/CodeHighlight.svelte';

	const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI>
   <teiHeader>
      <fileDesc>
         <titleStmt>
            <title>Transcription of the manuscript draft</title>
            <author>Raymond Brulez</author>
         </titleStmt>
      </fileDesc>
   </teiHeader>
</TEI>`;
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">XML Code Highlighting Test</h1>
	<div class="w-full">
		<CodeHighlight code={sampleXml} language="xml" />
	</div>
</div>
