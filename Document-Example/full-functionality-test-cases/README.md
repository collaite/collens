# Full functionality test cases

This folder is for real, permission-safe example projects that exercise Collens end to end.

The goal is to have a small but representative corpus that can be dropped into the app during development, demos, reviews, and release testing. Each example should use the normal Collens upload format so that it tests the same path as a real user import.

## Required folder shape for each example

```text
full-functionality-test-cases/
└── 01-short-descriptive-name/
    ├── README.md
    ├── project_details.json
    ├── witness_1/ or Custom Witness Name/
    │   ├── 1.png, 2.jpg, ...
    │   └── transcription.xml
    └── witness_2/ or Custom Witness Name/
        ├── 1.png, 2.jpg, ...
        └── transcription.xml
```

Every test case should include:

- a `README.md` explaining the scholarly scenario and what the example is meant to test;
- a `project_details.json` with title and description;
- at least two witness folders;
- one TEI XML transcription per witness;
- at least one manuscript/page image per witness;
- permission-safe or public-domain material only.

## Functionality coverage checklist

Please add enough examples to cover these behaviours:

- Folder import by drag and drop.
- `project_details.json` metadata loading.
- Sequential witness folder names, for example `witness_1`, `witness_2`.
- Custom witness folder names, for example `Author draft`, `Reviewer copy`.
- Multiple witnesses in one project, ideally three or more.
- Manuscript/page images in supported formats: PNG/JPG at minimum; WebP/TIFF/AVIF if useful.
- Image ordering across multiple pages.
- TEI header display in the metadata view.
- XML source display.
- Page divisions using `<div type="page" n="...">`.
- Page breaks using `<pb n="..."/>`.
- Line breaks using `<lb/>`.
- Additions using `<add>`.
- Deletions using `<del>`.
- Substitutions using `<subst>` with `<del>` and `<add>`.
- Instant edits using `instant="true"`.
- Nested edits that exercise original/intermediate/final transcription states.
- Unclear text using `<unclear>`.
- Supplied text using `<supplied>`.
- Notes using `<note>`.
- Witness statistics: additions, deletions, highlights/unclear text, line breaks.
- Witness enable/disable toggles in the settings bar.
- File/image selection inside a witness.
- CollateX JSON generation.
- CollateX output copy/download actions.
- Variant table view.
- Version comparison heatmap view.
- Outlier or highly divergent witness behaviour.
- Local/offline persistence through IndexedDB after refresh.

## Suggested test-case set

Use this as a practical target, not a strict requirement:

1. `01-minimal-two-witnesses` — smallest valid project: two witnesses, one page image each, one TEI XML each.
2. `02-editorial-states` — focuses on additions, deletions, substitutions, instant edits, and nested edits.
3. `03-multipage-image-sync` — several pages per witness to test image ordering and page navigation.
4. `04-custom-witness-names` — real-world folder names such as author/reviewer/copyist labels.
5. `05-collatex-and-heatmap` — three or more witnesses with meaningful variation for CollateX, variant table, and heatmap testing.
6. `06-edge-cases` — small examples for missing/unclear/supplied text, notes, page break variants, and divergent witnesses.

## Per-case README template

Copy `TEST_CASE_TEMPLATE.md` into each example folder and fill it in.

## Notes

Keep examples intentionally small. A few pages with dense TEI phenomena are more useful than a large corpus that is hard to inspect.

Do not add restricted manuscript images or private research data unless the repository access and license situation explicitly allow it.
