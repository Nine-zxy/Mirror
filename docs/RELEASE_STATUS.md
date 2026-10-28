# Release candidate status

This folder is an isolated publication candidate. Original research files and their history remain outside it. Publish this folder only, not its parent research workspace.

## Prepared

- One shared application and sync server; no duplicate English application tree.
- Dependency manifest, lockfile, environment example, ignored data paths, CI workflow.
- Bilingual README, bilingual entry page, and authored bilingual demonstration.
- Core reveal/privacy regression tests and a release hygiene check.
- Explicit paper-to-code mapping and reconstruction limitations.
- Original participant scenario modules, raw data, logs, and credentials excluded.

## Publication metadata

- Code is released under the MIT License; see LICENSE.
- Supply final paper authors, publication metadata, DOI, so `CITATION.cff` can be generated from verified metadata.
- Study visual assets were restored at the project owner request on 2026-10-28; source paths and exact hashes are recorded in docs/STUDY_ASSETS.json.

## Interface stage

The entry page and authored example support `lang=zh` and `lang=en`. The inherited research controls still contain mixed-language text. Complete localization, consistent controls, mobile layout review, and final visual polish remain the interface stage requested after code organization. Avoid making a second code copy for English.

## Verification scope

Check the accompanying local handoff for the latest actual commands and results. CI is configured but is not a claim that a GitHub-hosted run has occurred. Live Gemini calls and public deployment must be checked separately; this preparation does not use stored private keys or upload data.

## Public repository preparation — 2026-10-24

The source repository is https://github.com/Nine-zxy/Mirror. This release uses an independent Git history to keep historical credentials and research records out of the public repository. The original research history is retained privately. Publication status must be checked on GitHub.
