# Software management plan

## Purpose

Collens supports digital humanities research workflows for visual exploration of textual variation in TEI-encoded manuscript witnesses.

## Software shape

Browser-based research software application built with SvelteKit, TypeScript, Vite, Tailwind CSS, and Bun.

## Inputs and outputs

Inputs:

- TEI XML transcriptions.
- Manuscript images.
- Folder structures that group witnesses and pages.

Outputs:

- Browser visualizations of witness states and manuscript images.
- Editorial statistics.
- CollateX-derived collation tables and JSON output where supported.

## Availability and archiving

- Source code is hosted on GitHub.
- Releases should be archived through Zenodo.
- Citation metadata is maintained in `CITATION.cff`.
- Machine-readable metadata is maintained in `.zenodo.json` and `codemeta.json`.

## Maintenance

Maintenance should prioritize:

- Keeping installation and build instructions working.
- Preserving test coverage for TEI parsing and core utility functions.
- Documenting parser assumptions for new TEI corpora.
- Keeping dependencies updated.
- Maintaining a working public demo if one is advertised.

## Risks

- Variation in TEI encoding practices can create parser edge cases.
- External collation service dependencies may change.
- Browser storage is not a long-term archive.
