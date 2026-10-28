# ASIDE

## Live website

[Open the ASIDE introduction and interactive visualization](https://nine-zxy.github.io/Mirror/?lang=en). The site supports Chinese/English and an offline solo walkthrough. Paired sessions and live AI generation require running the server locally.

**From Conflict Participants to Co-Observers Through Dyadic Spectator Reflection**

[中文说明](README.zh-CN.md) · [Paper-to-code map](docs/PAPER_TO_CODE.md) · [Reproduction guide](docs/REPRODUCTION.md) · [Release status](docs/RELEASE_STATUS.md)

ASIDE is a research prototype for reflecting on interpersonal conversations. Partners review AI-inferred inner states, independently edit interpretations, and reveal their perspectives together. AI content is a revisable hypothesis, not a factual account of another person's mind.

This is a curated, modified research artifact. It is **not a frozen copy of the study deployment**, and it does not include participant data or reproduce the paper's statistical results. See the explicit differences in the paper-to-code map.

## Project website

The application home page introduces the research with a bilingual, interactive three-phase explainer, code module map, copyable setup commands, and links into the existing demos. Research, setup, and release notes open within the page. The GitHub URL is marked pending until an actual repository is supplied.

## Quick start

Requirements: Node.js 22.12 or newer and npm. The documented setup runs locally; no API key is required for the authored example.

```sh
npm ci
npm run dev
```

Open <http://localhost:5173>. Choose Chinese or English, then explore the fictional **Dinner Plan** example. For two clients, open **A first, then B** from the same home page. Separate tabs are sufficient; both must finish cross-editing before annotations are revealed.

```sh
npm test              # protocol/privacy gate and example checks
npm run build         # compile the browser application
npm run preview       # inspect the build at localhost:4173, with sync server
npm run check         # tests, build, release-file checks
```

The sync server listens on `127.0.0.1:3001`. Vite proxies `/ws` and `/logs`. For two devices on a trusted LAN, use `npm run dev:lan` and open the host computer's LAN address on port 5173. Do not run two copies of the sync server at once.

## AI generation (optional)

Copy `.env.example` to `.env.local`, set `GEMINI_API_KEY`, and restart the development server. Keep secrets out of all `VITE_*` variables. The default model is `gemini-2.5-flash`, matching the paper; `VITE_GEMINI_MODEL` can select another model, which must be reported as a deviation when reproducing the system.

The local proxy adds the key server-side. Enabling generation sends the supplied dialogue and context to Google's API. Without a key, the application uses its deterministic example/fallback. The fallback is not evidence that a supplied conversation was analyzed by an LLM. Live model availability, responses, and quality are not guaranteed by the offline checks.

## Repository

```text
src/App.jsx                 Workflow and phase transitions
src/components/             Theater, editing, comparison cards, preparation screen
src/data/demoScenario.js    Authored Chinese/English example
src/utils/generateScenario.js  Prompt templates and reconstruction pipeline
src/sync/                   Browser synchronization
server/                     WebSocket protocol, rooms, optional study logging
tests/                      Automated mechanism checks
docs/                       Reproduction, provenance, release status
examples/                   Exported fictional scenario JSON and dialogue
scripts/check-release.mjs   Release hygiene checks
```

The bilingual home page and example share one codebase. Some inherited research controls still mix Chinese and English; complete interface localization and visual redesign are the next interface stage, not claimed complete in this release candidate.

## Data, artwork, and deployment scope

Original participant scenarios, study logs, transcripts, local environment files, paper drafts, videos, and original Git history are excluded. Logs, automatic log uploads, and browser log backups are disabled by default. To explicitly collect study logs on a trusted installation, enable both logging flags in `.env.local`; see the reproduction guide before doing so.

The release uses the study prototype’s original scene backgrounds, character expression sprites, dialogue frames, and UI icons. The introduction embeds the actual application workflow using fictional dialogue. Exact source-file hashes are recorded in docs/STUDY_ASSETS.json. CSS/SVG rendering remains a fallback for missing images.

This is a local/trusted-network research application, not an authenticated public service. Room codes are pairing aids, not access credentials. Do not expose its preparation APIs, optional log APIs, or AI proxy as an unrestricted public service.

## License and citation

[MIT License](LICENSE). Source repository: [Nine-zxy/Mirror](https://github.com/Nine-zxy/Mirror).

Final paper author metadata and DOI will be added when verified. The released source starts from a clean history; private research records and credentials are excluded. Original study visual assets are included as recorded in docs/STUDY_ASSETS.json; participant records remain excluded.
