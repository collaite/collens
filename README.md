# COLLaiTE Collens

[![License](https://img.shields.io/github/license/collaite/collens)](LICENSE)
[![CITATION.cff](https://img.shields.io/badge/citation-CFF-blue)](CITATION.cff)
[![Metadata checks](https://github.com/collaite/collens/actions/workflows/metadata.yml/badge.svg)](https://github.com/collaite/collens/actions/workflows/metadata.yml)
[![Deploy to GitHub Pages](https://github.com/collaite/collens/actions/workflows/deploy.yml/badge.svg)](https://github.com/collaite/collens/actions/workflows/deploy.yml)

![COLLaiTE prototype v1](https://github.com/user-attachments/assets/fa9e8479-3229-4658-b357-41abad9218ce)

## Overview

COLLaiTE Collens is a sophisticated web-based tool for digital manuscript collation and visualization, designed specifically for digital humanities scholars working with TEI XML transcriptions. It enables side-by-side comparison of multiple witnesses, advanced text processing, and integration with CollateX for automated collation.

### Key Highlights
- 📚 **Multi-witness Comparison** - View and compare multiple manuscript witnesses simultaneously
- 🔍 **Advanced TEI XML Processing** - Sophisticated parsing of complex editorial markup
- 🖼️ **Image Synchronization** - Connect transcriptions with manuscript images
- 🔄 **CollateX Integration** - Automated text collation and variant analysis
- 💾 **Offline Support** - Local storage using IndexedDB for offline access
- 📊 **Editorial Statistics** - Track additions, deletions, substitutions, and transpositions

## Features

### Core Functionality

#### Document Management
- **Drag-and-drop upload** for documents and folders
- **Automatic project loading** with example datasets (Infinito, Sheherazade)
- **IndexedDB storage** for persistent, offline-capable document access
- **Batch file processing** for handling multiple witnesses simultaneously
- **Smart folder structure recognition** for organized document import

#### Multi-Witness Visualization
- **Side-by-side comparison** view for multiple witnesses
- **Dynamic witness management** with real-time toggle controls
- **Individual witness metrics** showing editorial statistics
- **Synchronized scrolling** across witness panels
- **Customizable witness display** with show/hide controls

#### TEI XML Processing

##### Advanced Parser Features
- **Three-stage transcription support:**
  - `Stage 1a`: Original text (preserves deletions, excludes additions)
  - `Stage 1b`: Intermediate state (applies instant edits and nested changes)
  - `Stage 1c`: Final text (includes all additions, removes deletions)

##### TEI Element Support
- `<add>` additions rendered with `{}`
- `<del>` deletions rendered with `[]`
- `<unclear>` text rendered with `⟨⟩`
- `<supplied>` text rendered with `<>`
- `<note>` editorial notes rendered with `(())`
- `<subst>` substitutions with proper unwrapping
- `<lb>` line breaks and `<pb>` page breaks
- Nested editorial interventions handling
- Instant revision processing

#### Image Visualization
- **Multi-format support** (PNG, JPG, JPEG, WebP, TIFF, AVIF)
- **Thumbnail sidebar** for easy navigation
- **Page synchronization** between text and images
- **Smart numerical sorting** of manuscript pages
- **Full-screen image viewer** with zoom capabilities

#### CollateX Integration
- **Real-time collation** using CollateX.net web service
- **Dekker algorithm** for optimal text alignment
- **Interactive variant table** with horizontal/vertical orientation
- **Invariant highlighting** for identical text sections
- **JSON export** of collation results
- **Dynamic updates** when witnesses are toggled

### User Interface

#### Components & Design
- **Responsive layout** optimized for desktop and mobile
- **Toast notifications** for user feedback
- **Settings bar** with witness controls and statistics
- **Metric circles** for visual representation of changes
- **CodeMirror integration** for XML syntax highlighting
- **Dark mode support** via DaisyUI themes

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- Modern web browser with JavaScript enabled
- (Optional) Git for cloning the repository

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/collaite/collens.git
cd collens
```

2. **Install dependencies:**
```bash
bun install
```

3. **Run the development server:**
```bash
bun dev
```

4. **Open in browser:**
Navigate to `http://localhost:5173`

### Building for Production

```bash
bun build
```

The application will be built to the `build` directory, ready for deployment.

### Running Tests

The project includes a comprehensive test suite using Bun's built-in test runner.

**Run all tests:**
```bash
bun test
```

**Run tests in watch mode:**
```bash
bun test:watch
```

**Run tests with coverage:**
```bash
bun test:coverage
```

**Test Structure:**
```
tests/
└── utils/          # Tests for utility functions
    ├── xml-parser.test.ts      # TEI XML parsing tests
    ├── text-cleaner.test.ts    # Text cleaning tests
    ├── stats-utils.test.ts     # Editorial statistics tests
    ├── label-utils.test.ts     # Witness label utilities tests
    ├── file-utils.test.ts      # File handling tests
    └── header-parser.test.ts   # TEI header parsing tests
```

**What's Tested:**
- TEI XML parsing with different witness types (1a, 1b, 1c)
- Editorial element handling (additions, deletions, substitutions)
- Text cleaning and normalization
- Witness statistics calculation
- File name pattern matching and page number extraction
- TEI header metadata extraction
- Label generation and type determination

## Usage Guide

### Loading Documents

1. **Using Example Projects:**
   - Click on the Infinito or Sheherazade cards on the homepage
   - Documents will be automatically loaded and displayed

2. **Uploading Custom Documents:**
   - Drag and drop a folder containing your TEI XML files
   - Ensure your folder follows the required structure (see documentation)
   - Files will be processed and stored locally

### Working with Witnesses

1. **Toggle Witnesses:**
   - Use the checkboxes in the settings bar to show/hide witnesses
   - View editorial statistics for each witness

2. **Compare Texts:**
   - Witnesses appear side-by-side for easy comparison
   - Scroll synchronization helps maintain alignment

3. **View Images:**
   - Click on image thumbnails in the sidebar
   - Images sync with the corresponding text sections

### Using CollateX

1. **Generate Collation:**
   - Select witnesses to include in collation
   - Click "Generate CollateX" button
   - View results in the collation table

2. **Export Results:**
   - Copy JSON output for further analysis
   - Toggle between horizontal/vertical table views

## Documentation

### User Documentation
- [Folder Structure Guide](https://github.com/collaite/collens/blob/main/src/routes/docs/folder-structure/+page.md) - Required folder organization and file naming conventions
- [Transcription Guide](https://github.com/collaite/collens/blob/main/src/routes/docs/transcription/+page.md) - Understanding the transcription and XML parsing process

### Technical Documentation
- [XML Parser Documentation](https://github.com/collaite/collens/blob/main/src/routes/docs/parser-documentation/+page.md) - Detailed parser functionality and TEI element handling
- [Parser Improvements Proposal](https://github.com/collaite/collens/blob/main/src/routes/docs/parser-improvements/+page.md) - Proposed enhancements and optimizations

> Documentation is also accessible through the application interface after running locally.

## Example Projects

### Infinito Project
A comprehensive 4-witness manuscript comparison showcasing:
- Multiple manuscript versions of the same text
- Complex editorial interventions
- Full image sets for each witness
- Extensive TEI markup examples

### Sheherazade Project
A focused 2-witness comparison demonstrating:
- Direct manuscript comparison
- Clear visualization of textual variants
- Simplified witness management

## Technical Stack

### Core Technologies
- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** - Component library for Tailwind

### Key Libraries
- **MDSvex** - Markdown processing with Svelte components
- **CodeMirror** - Code editor for XML display
- **Prism.js** - Syntax highlighting
- **IndexedDB** - Client-side storage

### Build Tools
- **Vite** - Fast build tool and dev server
- **Bun** - JavaScript runtime and package manager

## Development

### Project Structure
```
collens/
├── src/
│   ├── routes/          # SvelteKit routes and pages
│   ├── lib/
│   │   ├── components/  # Reusable Svelte components
│   │   ├── stores/      # Svelte stores for state management
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript type definitions
│   └── app.html         # HTML template
├── static/              # Static assets
└── package.json         # Project configuration
```

### Local Development

The development server includes:
- Hot module replacement for instant updates
- TypeScript checking
- Automatic error reporting
- Development-specific debugging tools

### Deployment

Changes pushed to the `main` branch are built by GitHub Actions for GitHub Pages. The public URL is `https://collaite.github.io/collens/` when GitHub Pages is enabled for the repository.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## Citation

If you use Collens in research, teaching, or software work, please cite it using the metadata in [CITATION.cff](CITATION.cff).

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Governance and security

- Governance: [GOVERNANCE.md](GOVERNANCE.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](SECURITY.md)

## Acknowledgments

COLLaiTE Collens is developed as part of the COLLaiTE project for digital humanities research and manuscript studies, in collaboration with the Netherlands eScience Center and Huygens Institute.