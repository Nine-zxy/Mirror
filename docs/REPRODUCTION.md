# Reproduction guide

## Offline walkthrough

1. Run `npm ci`, then `npm run dev` in the repository root.
2. Open `http://localhost:5173/?lang=en` or `?lang=zh`.
3. Select the one-device example. Move from the scene-setting beat to a dialogue beat.
4. Confirm or edit your own thought text in Self-Confirm. Move to Cross-Editing and edit the other person's thought text.
5. Finish editing, view the combined scene, and inspect the divergence cards.

Solo mode is a UI walkthrough. It cannot stand in for independent input from two people.

## Paired mechanism check

1. On the same home page, open **A first**, wait for the connection, then open **B**. The two links contain the same randomly generated demo room code and language.
2. Each client performs Self-Confirm and Cross-Editing independently. Use distinctive edits to make the exchanged content recognizable.
3. Finish A's cross-editing while B remains editing. A must wait, and B must not receive A's annotation contents.
4. Finish B's cross-editing. Both clients enter Together Viewing and receive the opposite partner's annotations.
5. Move a beat in Together Viewing and check that the other browser follows. Inspect the comparison cards at the end.

Use a fresh home page (new room code) for each independent pair. The default four-character research room mechanism and demo links do not provide authentication. Reload/reconnection does not restore all unsent browser state; restart the demo when testing a fresh session.

## AI workflow

Set `GEMINI_API_KEY` in `.env.local`, restart, and use the input workflow. The pipeline contains calibration and scene generation prompts. Default generation model: `gemini-2.5-flash`. Generation is nondeterministic and provider/model availability may change. The fallback path is a demonstration and must not be reported as a successful model reconstruction. For a build preview, set the environment before building, since the client availability flag is compiled into the bundle.

## Optional logging

By default, no behavioral events are collected or persisted. For a consented local research session, set both `ASIDE_ENABLE_LOGGING=true` and `VITE_ENABLE_LOGGING=true` before restarting/building. This enables sensitive event recording and the inherited researcher monitoring features. Server events are written under `server/logs/`; uploaded browser logs go under `study-logs/`; browser backups use `aside-log-*` localStorage entries. All server log paths are ignored by Git. Remove these files and browser entries according to the study's retention policy.

Turning the flags off does not delete previously collected data. Do not expose a logging-enabled installation publicly: the inherited preparation and monitoring functions have no authentication or role-based authorization.

## Tests and build

`npm run check` runs the Node test suite, production build, and release-file scan. The scan detects common secret formats and excluded file categories; it is not a proof that arbitrary new content is anonymized. Review newly added examples manually.

The local development/preview proxy serves API and WebSocket requests. Static hosting of `dist/` alone supports only the offline single-device walkthrough; paired sessions and generation require a backend/proxy deployment. Public hosting, authentication, rate limits, and study data analysis are outside this candidate's verified scope.
