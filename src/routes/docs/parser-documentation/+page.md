# XML Parser Documentation

## Overview
The XML parser in COLLaiTE Collens is responsible for processing TEI XML files containing witness transcriptions. It handles various text features including page breaks, additions, deletions, and other textual phenomena commonly found in manuscript transcriptions.

## Page Identification
Pages in the XML files are identified through two different mechanisms:

1. **Page Division Elements**
   ```xml
   <div type="page" n="1">
     <!-- page content -->
   </div>
   ```
   - Uses `<div>` elements with `type="page"`
   - The page number is specified in the `n` attribute
   - Rendered in the output as `[Page 1]`

2. **Page Break Elements**
   ```xml
   <pb n="1"/>
   ```
   - Uses `<pb>` (page break) elements
   - Page number specified in the `n` attribute
   - If `n` attribute is present: rendered as `[Page 1]`
   - If `n` attribute is absent: rendered as `[Page Break]`

## Text Processing Features

### 1. Witness Types
The parser supports three different witness types (`1a`, `1b`, `1c`), each handling editorial interventions differently:

- **1a**: Original text without any editorial changes
  - Removes all additions (`<add>`)
  - Preserves content of deletions (`<del>`)

- **1b**: Intermediate state (not displayed in the application.)
  - Applies "instant" edits
  - Applies edits up to nesting level 2
  - Reverts deeper nested edits

- **1c**: Final text with all editorial changes
  - Applies all additions
  - Removes all deletions

### 2. Editorial Markup Processing

The parser handles various TEI elements with specific rendering:

| XML Element | Example | Rendered Output |
|------------|---------|-----------------|
| `<del>` | `<del>text</del>` | `[text]` |
| `<add>` | `<add>text</add>` | `{text}` |
| `<unclear>` | `<unclear>text</unclear>` | `⟨text⟩` |
| `<supplied>` | `<supplied>text</supplied>` | `<text>` |
| `<note>` | `<note>text</note>` | `(*text*)` |
| `<lb/>` | `text<lb/>text` | Line break |

### 3. Special Processing

#### Substitution Elements
- `<subst>` elements are automatically unwrapped
- Their children (typically `<add>` and `<del>`) are preserved and processed according to witness type

#### Nested Edits
- The parser includes logic to handle nested editorial interventions
- Uses `filterChildEdits()` to prevent double-processing of nested elements
- Calculates nesting depth using `getNestingDepth()`

## TEI Header Processing

The parser includes functionality to process TEI headers:

1. **Header Entry Structure**
   ```typescript
   interface HeaderEntry {
     tag: string;
     content: string;
     level: number;
     children: HeaderEntry[];
   }
   ```

2. **Header Processing Features**
   - Formats tag names for readability
   - Maintains hierarchical structure
   - Extracts direct text content
   - Filters empty text nodes

## Usage

### Basic Parser Usage
```typescript
import { parseTEIXML } from '$lib/utils/witness';

// Parse XML with default witness type (1c)
const result = parseTEIXML(xmlContent);

// Parse XML with specific witness type
const witness1a = parseTEIXML(xmlContent, '1a');
const witness1b = parseTEIXML(xmlContent, '1b');
const witness1c = parseTEIXML(xmlContent, '1c');
```

### Loading XML Content
```typescript
import { loadXMLContent } from '$lib/utils/witness';

const xmlContent = await loadXMLContent(folder);
```

### Processing TEI Headers
```typescript
import { parseTEIHeader } from '$lib/utils/witness';

const headerEntries = parseTEIHeader(xmlContent);
```

## Error Handling

The parser includes comprehensive error handling:

1. **XML Parsing Errors**
   - Checks for parser errors during XML parsing
   - Returns original text if parsing fails

2. **Missing Elements**
   - Handles missing body elements gracefully
   - Provides warnings for missing TEI header

3. **Invalid Content**
   - Handles empty or invalid XML content
   - Returns empty arrays/strings for invalid input

## Implementation Details

The parser is implemented in TypeScript and uses the browser's native `DOMParser` for XML parsing. Key utility functions include:

- `getWitnessLabel()`: Generates witness labels
- `getPageNumber()`: Extracts page numbers from filenames
- `loadXMLContent()`: Loads and prepares XML content
- `parseTEIHeader()`: Processes TEI header information
- `parseTEIXML()`: Main parsing function for TEI XML content
- `processNode()`: Recursive function for processing XML nodes

<script>
	import EditOnGithub from '$lib/components/EditOnGithub.svelte';
</script>
<EditOnGithub />
