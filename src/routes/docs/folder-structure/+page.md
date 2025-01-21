<script lang="ts">
	import { base } from '$app/paths';
	import EditOnGithub from '$lib/components/EditOnGithub.svelte';
</script>
# Folder Structure Documentation

## Overview
This document describes the required folder structure and file organization for document projects that you want to upload to COLLaiTE Collens.

## Project Structure

```
project_name/
├── project_details.json
├── [witness_folder_1]/      # Can be "witness_1" or custom name like "Author 1"
│   ├── images (*.png, *.jpg)
│   └── [prefix].xml        # XML transcription file
└── [witness_folder_2]/      # Can be "witness_2" or custom name like "Review 2"
    ├── images (*.png, *.jpg)
    └── [prefix].xml
```

## Components Description

### 1. Project Root Directory
- **Name**: Any valid directory name (e.g., "example1", "sheherazade")
- **Required Files**:
  - `project_details.json`: Contains project metadata
    ```json
    {
      "title": "Project Title",
      "description": "Project description"
    }
    ```

### 2. Witness Directories
- **Naming Options**:
  - Sequential: `witness_1`, `witness_2`, etc.
  - Custom names: `Author 1`, `Review 2`, etc.
- Each witness represents a different version or copy of the document
- Multiple witnesses can exist in a project

### 3. Witness Contents

#### 3.1 Images
- **Format**: PNG or JPG files
- **Naming Options**:
  - Sequential numbers: `1.png`, `2.png`, `3.png`, etc.
  - Descriptive names: `Sheherazade-tsfolio-01r.jpg`, `Sheherazade-tsfolio-02r.jpg`, etc.
- Images should be ordered according to the document's page sequence

#### 3.2 Transcription Files
Each witness directory must contain:

1. **XML Source File**
   - Contains the TEI-encoded transcription
   - Naming options:
     - Descriptive name with .xml extension (e.g., `ms-aladin-simplified.xml`, `Sheherazade-tsfolio.xml`)
   - See [XML Parser Documentation]({base}/docs/parser-documentation) for XML structure details


## Example Projects

### Basic Example
```
example1/
├── project_details.json
├── witness_1/
│   ├── 1.png
│   ├── 2.png
│   ├── 3.png
│   └── ms-aladin-simplified.xml
└── witness_2/
    ├── 1.png
    ├── 2.png
    ├── 3.png
    └── ts-aladin-simplified.xml
```

### Custom Named Witnesses Example
```
sheherazade2/
├── project_details.json
├── Author 1/
│   ├── Sheherazade-tsfolio-01r.jpg
│   ├── Sheherazade-tsfolio-02r.jpg
│   └── Sheherazade-tsfolio.xml
└── Review 2/
    ├── Sheherazade-tsq-01r.jpg
    ├── Sheherazade-tsq-02r.jpg
    └── Sheherazade-tsq.xml
```

## Important Notes

1. **Consistency**
   - Maintain consistent naming conventions within each project
   - Use meaningful prefixes for related files
   - Keep image numbering sequential

2. **File Requirements**
   - Each witness must have at least one image
   - Each witness must have an XML transcription file

3. **Image Formats**
   - Supported formats: PNG, JPG
   - Images should be high quality but optimized for web viewing
   - Consistent image dimensions recommended within each witness

4. **Project Details**
   - `project_details.json` is required at the project root
   - Must contain at least `title` and `description` fields

5. **Witness Naming**
   - While custom witness folder names are supported, they should be meaningful and consistent
   - Custom names should reflect the nature or source of the witness (e.g., "Author 1", "Review 2")
   - If using sequential naming, start with "witness_1"


<EditOnGithub />
