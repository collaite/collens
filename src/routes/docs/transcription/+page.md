# Transcription and XML Parsing Documentation

This document details how transcription and XML parsing works in the application.

## Overview

The application handles TEI (Text Encoding Initiative) XML documents that contain transcribed manuscripts. The system provides three different views of the transcription:

1. **Original Transcription (1a)** - Shows the text without any edits applied
2. **Intermediate Transcription (1b)** - Shows text with some edits applied (instant edits and edits up to nesting level 2)
3. **Final Transcription (1c)** - Shows text with all edits applied

## XML Structure

The XML documents follow the TEI format and contain two main sections:

### 1. TEI Header (`<teiHeader>`)
Contains metadata about the document including:
- Title information
- Author details
- Publication information
- Source description
- Encoding details
- Revision history

### 2. Text Body (`<body>`)
Contains the actual transcribed text with markup for:
- Pages (`<div type="page" n="1">`)
- Additions (`<add>`)
- Deletions (`<del>`)
- Unclear text (`<unclear>`)
- Line breaks (`<lb>`)
- Page breaks (`<pb>`)
- Notes (`<note>`)
- Supplied text (`<supplied>`)

## Parsing Process

The parsing is handled by the `parseTEIXML()` function in `witness-utils.ts`. Here's how it works:

### 1. Initial XML Parsing
```typescript
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
```

### 2. Edit Processing
The system processes edits differently based on the witness type:

- **1a (Original)**
  - Removes all `<add>` elements
  - Preserves content of `<del>` elements

- **1b (Intermediate)**
  - Applies "instant" edits (marked with instant="true")
  - Applies edits up to nesting level 2
  - Removes deeper nested edits

- **1c (Final)**
  - Applies all edits
  - Removes all `<del>` elements
  - Preserves content of `<add>` elements

### 3. Text Processing
The system processes various XML elements into formatted text:

```typescript
- <div type="page"> → [Page X]
- <del> → [deleted text]
- <add> → {added text}
- <unclear> → ⟨unclear text⟩
- <supplied> → <supplied text>
- <note> → (*note*)
- <lb> → line break
- <pb> → page break
```

## UI Implementation

The transcription UI (`WitnessTranscription.svelte`) provides:

1. **View Switching**
   - Transcription (with three witness types)
   - Metadata (from TEI header)
   - XML Source

2. **Page Navigation**
   - Automatic page marker highlighting
   - Smooth scrolling to specific pages
   - Page number tracking

3. **Statistics**
The system tracks various elements:
- Number of additions
- Number of deletions
- Number of highlights
- Number of line breaks

## Example

Original XML:
```xml
<p>Een mooie vrouwenhand, elegant <subst><del type="strike-through">trots</del>
<add place="above-line">niettegenstaande</add></subst> de <del
type="strike-through" instant="true">groote p</del> vergrooting van het close-up</p>
```

Parsed output (depending on witness type):
- 1a: "Een mooie vrouwenhand, elegant trots de groote p vergrooting van het close-up"
- 1b: "Een mooie vrouwenhand, elegant niettegenstaande de vergrooting van het close-up"
- 1c: "Een mooie vrouwenhand, elegant niettegenstaande de vergrooting van het close-up"

## Technical Implementation Details

### Loading XML Content
```typescript
async function loadXMLContent(folder: Folder): Promise<string | null> {
  const xmlFile = folder.files.find((f) => f.name.endsWith('.xml'));
  if (!xmlFile) return null;

  try {
    const response = await fetch(xmlFile.src);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error loading XML content:', error);
    return null;
  }
}
```

### Header Parsing
The system parses the TEI header into a hierarchical structure:
```typescript
interface HeaderEntry {
  tag: string;
  content: string;
  level: number;
  children: HeaderEntry[];
}
```

### Edit Processing Logic
```typescript
// Calculate nesting depth of edits
function getNestingDepth(node: Element): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  const depths = Array.from(node.children).map(child => 1 + getNestingDepth(child));
  return Math.max(...depths);
}

// Filter child edits
function filterChildEdits(edits: Element[]): Element[] {
  return edits.filter(edit =>
    !edits.some(otherEdit =>
      otherEdit !== edit && otherEdit.contains(edit)
    )
  );
}
```

## Best Practices

1. **XML Structure**
   - Use proper TEI structure
   - Include comprehensive metadata in the header
   - Mark edit types clearly (instant, strike-through, etc.)

2. **Parsing**
   - Handle parser errors gracefully
   - Maintain proper nesting of edits
   - Process edits in the correct order

3. **UI**
   - Provide clear view switching
   - Maintain smooth page navigation
   - Show loading states when processing

## Common Issues and Solutions

1. **Nested Edits**
   - Problem: Complex nested edits can be difficult to process
   - Solution: Use the `getNestingDepth()` function to properly handle nesting levels

2. **XML Validation**
   - Problem: Invalid XML structure
   - Solution: Check for parser errors before processing
   ```typescript
   const parserError = xmlDoc.querySelector('parsererror');
   if (parserError) {
     console.error('XML parsing error:', parserError.textContent);
     return [];
   }
   ```

3. **Performance**
   - Problem: Large XML documents can be slow to process
   - Solution: Process edits in batches and show loading states



<script>
	import EditOnGithub from '$lib/components/EditOnGithub.svelte';
</script>
<EditOnGithub />