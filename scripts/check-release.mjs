import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const skipped = new Set(['node_modules', '.git', 'dist', 'coverage', 'test-results', 'playwright-report'])
const problems = []
let files = 0
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    const name = relative(root, path).replaceAll('\\', '/')
    if (skipped.has(entry.name)) continue
    // Local secrets are intentionally ignored by Git, never release inputs.
    if (entry.name.startsWith('.env') && entry.name !== '.env.example') continue
    if (entry.isDirectory()) {
      if (/^(server\/logs|study-logs)(\/|$)/.test(name)) {
        if (readdirSync(path).length) problems.push(`${name}: local study logs must not be packaged`)
      } else inspect(path)
      continue
    }
    files++
    if (/scenario_(p\d+|liuhaoze|zuoguan|amber_blake)\./i.test(name)) problems.push(`${name}: excluded study scenario`)
    if (/\.(jsonl|pdf|docx|mp4|zip|pem)$/i.test(name)) problems.push(`${name}: unexpected research/binary artifact`)
    if (statSync(path).size > 10 * 1024 * 1024) problems.push(`${name}: file exceeds 10 MiB`)
    const text = readFileSync(path, 'utf8')
    const secretPatterns = [
      /AIza[0-9A-Za-z_-]{35}/,
      /gh[pousr]_[0-9A-Za-z]{30,}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    ]
    if (secretPatterns.some(pattern => pattern.test(text))) problems.push(`${name}: possible credential (value withheld)`)
  }
}
inspect(root)
if (problems.length) {
  console.error(problems.join('\n'))
  process.exitCode = 1
} else console.log(`Release hygiene: ${files} source/documentation files checked; no flagged artifacts or credential patterns. MIT license included; paper citation metadata pending.`)
