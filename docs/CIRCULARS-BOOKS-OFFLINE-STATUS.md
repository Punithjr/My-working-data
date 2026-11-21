# Government circulars, statutory books and offline PDF — implementation status

## Implemented in source
- `src/data/governmentReferenceRegistry.ts`: curated circular/rule document and official-portal references with provenance labels.
- `src/data/officeReferenceBooks.ts`: previously added reference-book links.
- `src/components/OfficeReferencePicker.tsx`: search, source open, reference copy, user-supplied PDF storage/download in browser IndexedDB.
- Picker embedded in `GeneralLetterStudio`, `OfficialLetterStudio`, and `StatutoryCircularStudio`.

## Important limitations
- This is NOT a complete archive of all Karnataka government circulars, amendments, books, or PDFs. Government sites and source URLs may change; check authenticity and effective amendments before using citations.
- Reference copy requires the caseworker to paste into the letter; there is no automatic reference-field binding.
- Offline PDFs are stored only in the current browser/profile. They are not centrally synchronized or backed up, and may be lost when browser storage is cleared. No government PDFs have been downloaded or committed.
- The source registry is a curated starter set, not an automated official circular feed. An official publication is not automatically applicable to BEO Bhadravathi.
- No copyright-restricted full books are bundled.

## Pending (P0)
- [ ] Run `npm ci`, `npm run lint`, `npm run build` and smoke-test all three letter editors.
- [ ] Validate source URLs and latest official amendments against primary government sites.
- [ ] Verify reference paste/printing and local PDF storage in supported browsers.
- [ ] Audit pre-existing hardcoded sample circular templates and remove or flag unverified invented GO/circular numbers before official use.

## Pending (P1)
- [ ] Expand vetted official circular coverage by year, issuing authority, subject, effective date and superseded status.
- [ ] Add approved official PDF downloads/ingestion, metadata validation, checksums, export/import backup and reliable offline availability.
- [ ] Add automatic insertion into editable letter reference fields with source and revision tracking.
- [ ] Expand KCSR, KFC, Karnataka Treasury Code, CCA, Conduct, office procedure, pension, RTE, education acts/rules and amendments using authentic authoritative publications.
- [ ] Add online synchronization only with explicit access and reliable provenance.

## Test limitation
A container Git clone/build attempt could not run because github.com DNS/network access was unavailable. Therefore **build and website testing are NOT complete**. GitHub source commits do not prove successful deployment.
