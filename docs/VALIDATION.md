# Local validation — 2026-09-30

Environment: Windows, Node.js 22.12.0, npm 10.9.0. Verification was performed against this curated candidate, not the historical study deployment.

| Check | Observed result |
| --- | --- |
| Clean dependency installation (`npm ci`) | Passed |
| `npm run check` | Passed: 8 tests, production build, release hygiene scan |
| Production dependencies and development dependencies (`npm audit --registry=https://registry.npmjs.org`) | 0 reported vulnerabilities at validation time |
| English home page | Rendered without page errors |
| Chinese home and fictional example | Rendered without page errors |
| Solo walkthrough | Self-Confirm → Cross-Editing → Together Viewing → divergence cards completed |
| Two real browser clients | Joined the same room; both edited thought text and completed the workflow |
| Early annotation confidentiality | Partner WebSocket frames contained no distinctive private edit before both finished |
| Synchronized reveal | Distinctive opposite-partner edits arrived after both finished |
| Divergence cards | Displayed the opposite partner's edited interpretation |
| Browser errors / failed requests in paired walkthrough | None observed |
| Automatic browser log backups with default configuration | No localStorage entries created |
| Git ignore rules | Environment files, server logs, uploaded logs, dependencies, and build output excluded |

The initial agent-browser CLI could not reach localhost in this environment. Browser validation was then completed with a separately launched local headless Microsoft Edge using Playwright. This was a tool connection issue; the successful checks above refer to that fallback browser run.

Not validated: real Gemini requests, exact study-era outputs or visuals, logging-enabled consented research deployment, recovery of unsent edits after reload, public internet hosting, all mobile layouts, complete interface localization, or GitHub-hosted CI execution. License status was subsequently updated to MIT for publication on 2026-10-24.
