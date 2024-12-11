# Folder Structure Documentation

## Overview
This document describes the required folder structure and file organization for document projects in COLLaiTE Collens.

## Project Structure

```
project_name/
├── project_details.json
├── witness_1/
│   ├── images (*.png, *.jpg)
│   ├── transcription_1a.txt
│   ├── transcription_1b.txt
│   └── transcription.xml
└── witness_2/
    ├── images (*.png, *.jpg)
    ├── transcription_1a.txt
    ├── transcription_1b.txt
    └── transcription.xml
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
- **Naming Convention**: `witness_1`, `witness_2`, etc.
- Each witness represents a different version or copy of the document
- Multiple witnesses can exist in a project (witness_1, witness_2, witness_3, etc.)

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
     - `transcription.xml`
     - Descriptive name (e.g., `ms-aladin-simplified.xml`, `Sheherazade-tsfolio.xml`)
   - See [XML Parser Documentation](./PARSER_DOCUMENTATION.md) for XML structure details

2. **Derived Text Files**
   - Generated from XML source with different processing rules
   - Required files:
     - `*_1a.txt`: Original text version
     - `*_1b.txt`: Intermediate version
   - Names should match the base XML filename
     - Example: If XML is `ms-aladin-simplified.xml`:
       - `ms-aladin-simplified_1a.txt`
       - `ms-aladin-simplified_1b.txt`

## Example Projects

### Basic Example
```
example1/
├── project_details.json
├── witness_1/
│   ├── 1.png
│   ├── 2.png
│   ├── 3.png
│   ├── ms-aladin-simplified_1a.txt
│   ├── ms-aladin-simplified_1b.txt
│   └── ms-aladin-simplified.xml
└── witness_2/
    ├── 1.png
    ├── 2.png
    ├── 3.png
    ├── ts-aladin-simplified_1a.txt
    ├── ts-aladin-simplified_1b.txt
    └── ts-aladin-simplified.xml
```

### Complex Example (Multiple Witnesses)
```
example2/
├── project_details.json
├── witness_1/
│   └── [witness files]
├── witness_2/
│   └── [witness files]
└── witness_3/
    └── [witness files]
```

### Custom Named Files Example
```
sheherazade/
├── project_details.json
├── witness_1/
│   ├── Sheherazade-tsfolio-01r.jpg
│   ├── Sheherazade-tsfolio-02r.jpg
│   └── Sheherazade-tsfolio.xml
└── witness_2/
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
   - Derived text files (1a, 1b) should be generated from the XML

3. **Image Formats**
   - Supported formats: PNG, JPG
   - Images should be high quality but optimized for web viewing
   - Consistent image dimensions recommended within each witness

4. **Project Details**
   - `project_details.json` is required at the project root
   - Must contain at least `title` and `description` fields
