# Release process

## Before release

1. Check that the working tree is clean or contains only intended release changes.
2. Run local validation where available:
   - `bun install`
   - `bun run check`
   - `bun run lint`
   - `bun test`
   - `bun run build`
3. Update `CHANGELOG.md`.
4. Update `CITATION.cff` version and release date.
5. Check `.zenodo.json` and `codemeta.json` metadata.
6. Check README badges and links.
7. Confirm the public demo URL works if the release claims a live deployment.

## Create a release

1. Create a GitHub release with a semantic version tag when appropriate, for example `v0.1.0`.
2. Use release notes that explain what changed and who should care.
3. Verify that Zenodo created or updated the archive.
4. Copy the DOI into README and citation documentation.
5. Check that any Research Software Directory entry points to the correct release or repository.

## Release notes template

```markdown
## Summary

## Added

## Changed

## Fixed

## Known limitations

## Citation
```
