<!-- Lab 5: Multi-Agent Orchestration with Copilot SDK -->

> **Time estimate: 75 minutes** Instructor note: Walk through the architecture diagram in Part A together before participants open any code. Emphasize that `Promise.all` is the single most important line — it's what makes this a multi-agent system rather than a sequential pipeline. The deduplication step in Part B often sparks good discussion about ownership of cross-cutting concerns.

# Lab 5: Multi-Agent Orchestration with Copilot SDK

## Objective

Build an Orchestrator Agent that coordinates the Code Review Sub-Agent and Security Analysis Sub-Agent from Lab 3 in **parallel**, aggregates their findings with deduplication, and produces a single unified markdown report — all from one TypeScript file and one command.

---

## Prerequisites

- [Lab 3](lab-03-sdk-automation.md) completed — you must be comfortable with `CopilotClient`, `defineTool`, and `createSession`
- `sdk/nodejs/node_modules/` already installed (`npm install` was run in Lab 3)
- `GITHUB_TOKEN` set in your environment

---

## Architecture Overview

```
User prompt
    │
    ▼
Orchestrator Session  (multi-agent-orchestrator.ts)
    │
    │  Tool: dispatch_all_agents
    ├──────────────────────────────────────────────────────┐
    │                                                      │
    ▼  Promise.all(...)                                    │
    ├── codeReviewSubAgent(code, lang)    ◄── runs locally  │
    └── securitySubAgent(code, lang)     ◄── runs locally  │
         (both finish before either result is used)         │
    │                                                      │
    │  Tool: aggregate_and_report ◄────────────────────────┘
    │     Merge + deduplicate + rank by severity
    │
    │  Tool: save_report  (optional)
    │     Write markdown to samples/findings/
    │
    ▼
Unified report returned to user
```

**Key concept — Supervisor pattern:**
The orchestrator AI *decides which tools to call and in what order*. The `dispatch_all_agents` tool handler *internally* does the parallel work via `Promise.all`. This means:
- The AI still calls one tool at a time (standard LLM tool-calling behavior)
- But inside that one tool, two sub-agents run *concurrently*
- Results are returned together as a single structured object for the next tool call

---

## Part A: Understand the Pattern (15 min)

### Step 1: Review the skeleton file

Open `templates/sdk/multi-agent-orchestrator.skeleton.ts` and read through it.

Notice the structure:

```
┌─────────────────────────────────────────────────────────┐
│  codeReviewSubAgent()   — provided (Lab 3 logic)        │
│  securitySubAgent()     — provided (Lab 3 logic)        │
│                                                         │
│  dispatchAllAgents tool                                 │
│    handler: TODO — add Promise.all here                 │
│                                                         │
│  aggregateAndReport tool                                │
│    handler: TODO — add deduplication here               │
│                                                         │
│  saveReport tool        — provided                      │
│  SYSTEM_PROMPT          — provided                      │
│  main()                 — provided                      │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Understand why Promise.all matters

Compare these two approaches:

```typescript
// Sequential (what the skeleton starts with — do NOT leave this)
const codeReview   = await codeReviewSubAgent(code, language);
const securityScan = await securitySubAgent(code, language); // waits for codeReview to finish first
```

```typescript
// Parallel (what you will implement)
const [codeReview, securityScan] = await Promise.all([
  codeReviewSubAgent(code, language),
  securitySubAgent(code, language, context),
]);
// Both start immediately. Total time ≈ max(t_review, t_security) instead of t_review + t_security
```

For production pipelines with multiple agents hitting external APIs, this difference is significant.

### Step 3: Understand the deduplication problem

The hardcoded-credential pattern (`API_KEY = "abc123"`) is detected by **both** agents:

| Agent | Finding | Severity | Extra context |
|-------|---------|----------|---------------|
| Code Review | Hardcoded credential | critical | style/security category |
| Security Analysis | Hardcoded Credential (CWE-798) | HIGH | OWASP A02, full description |

If you report both, the same issue appears twice. The rule: **keep the security finding** (more context). Drop the code-quality finding for any line that already has a security finding.

### ✅ Checkpoint A

| | |
|--|--|
| Skeleton file reviewed | Understood the two TODO locations |
| Promise.all concept clear | Can explain why parallel is faster |
| Deduplication rule understood | Know which finding to keep |

---

## Part B: Build the Orchestrator (40 min)

### Step 4: Copy the skeleton to the SDK directory

```bash
cp templates/sdk/multi-agent-orchestrator.skeleton.ts sdk/nodejs/multi-agent-orchestrator.ts
```

Open `sdk/nodejs/multi-agent-orchestrator.ts` in VS Code.

### Step 5: Implement the Promise.all dispatch

Find this block in `dispatch_all_agents` handler (around line 120):

```typescript
// TODO: Replace the two sequential calls below with a single Promise.all()
const codeReview   = await codeReviewSubAgent(code, language);   // ← replace
const securityScan = await securitySubAgent(code, language, context); // ← replace
```

Replace **both lines** with a single `Promise.all` call:

```typescript
const [codeReview, securityScan] = await Promise.all([
  codeReviewSubAgent(code, language),
  securitySubAgent(code, language, context),
]);
```

Also update the console.log lines above the TODO to show parallel dispatch:

```typescript
console.log('\n⚡ Dispatching sub-agents in parallel...');
console.log('   → Code Review Sub-Agent     : analyzing code quality');
console.log('   → Security Analysis Sub-Agent: scanning for vulnerabilities\n');
```

### Step 6: Implement the deduplication

Find this block in `aggregate_and_report` handler (around line 165):

```typescript
// TODO: Implement deduplication.
const dedupedCodeFindings = codeReview.findings; // ← replace

// TODO: Calculate overall risk.
const overallRisk = '🟡 MEDIUM'; // ← replace
```

**Replace the deduplication line** with:

```typescript
const secLines = new Set(securityScan.findings.map(f => f.line));
const dedupedCodeFindings = codeReview.findings.filter(
  f => !(f.category === 'security' && f.line !== null && secLines.has(f.line))
);
```

**Replace the overall risk line** with:

```typescript
const overallRisk =
  securityScan.riskLevel === 'CRITICAL' ||
  dedupedCodeFindings.some(f => f.severity === 'critical')
    ? '🔴 CRITICAL'
    : securityScan.riskLevel === 'HIGH' ||
      dedupedCodeFindings.some(f => f.severity === 'high')
    ? '🟠 HIGH'
    : dedupedCodeFindings.length > 0 || securityScan.findings.length > 0
    ? '🟡 MEDIUM'
    : '🟢 LOW';
```

### Step 7: Verify the implementation compiles

```bash
cd sdk/nodejs
npx tsx --noEmit multi-agent-orchestrator.ts 2>&1 | head -20
```

Expected output: no errors (the command exits quickly since `--noEmit` does type-checking without running).

If you see TypeScript errors, compare your implementation with `sdk/nodejs/multi-agent-orchestrator.ts` (the reference solution).

### ✅ Checkpoint B

| | |
|--|--|
| Promise.all implemented | Sequential calls replaced with parallel dispatch |
| Deduplication implemented | `secLines` Set built, code findings filtered |
| Overall risk calculated | Uses both agents' results, not just one |
| No TypeScript errors | `npx tsx --noEmit` exits cleanly |

---

## Part C: Run the Pipeline (20 min)

### Step 8: Run the orchestrator directly

Make sure your token is set, then:

```bash
cd sdk/nodejs
npx tsx multi-agent-orchestrator.ts
```

Expected startup output:

```
🤖 Multi-Agent Orchestrator starting...

Sub-agents:
  Code Review Sub-Agent      — quality, style, maintainability
  Security Analysis Sub-Agent — OWASP Top 10, CWE references

Orchestrator tools:
  - dispatch_all_agents  : Fan-out to both sub-agents in parallel
  - aggregate_and_report : Merge, deduplicate, and rank findings
  - save_report          : Save unified report to samples/findings/

Assistant: [Orchestrator introduces itself and explains the pipeline]

>
```

### Step 9: Run the sample-app code through the orchestrator

Paste this prompt (the agent auto-detects multi-line paste):

```
Analyze the following code and produce a unified report:

const express = require('express');
const db = require('./db');
const API_KEY = 'sk-proj-abcdef123456';

app.get('/api/users/search', (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const rows = db.prepare(query).all();
  res.json(rows);
});

app.post('/api/calculate', (req, res) => {
  const result = eval(req.body.expression);
  res.json({ result });
});

var logger = console.log;
function process(data) {
  try {
    // TODO: add validation
    return data.filter(x => x > 0);
  } catch (e) {}
}
```

You should see:

1. `⚡ Dispatching sub-agents in parallel...` logged immediately
2. Both sub-agents complete (nearly simultaneously)
3. The orchestrator calls `aggregate_and_report`
4. A unified report appears with:
   - **🔴 CRITICAL** risk overall
   - SQL Injection (CWE-89) and eval injection (CWE-95) in the security section
   - Hardcoded credential appearing **once** (in security section only — deduplicated)
   - Code quality issues: empty catch, `var`, TODO comment

### Step 10: Run via the runner script

```bash
# Bash
cd ../..
./automation/copilot-sdk-runner.sh --usecase multi-agent --lang nodejs

# PowerShell (Windows)
.\automation\copilot-sdk-runner.ps1 -Usecase multi-agent -Lang nodejs
```

Verify it appears in the list:

```bash
./automation/copilot-sdk-runner.sh --list
```

Expected:
```
Available use cases:
  code-review         Code Review Agent — analyzes code quality and style
  security-analysis   Security Analysis Agent — scans for OWASP Top 10 vulnerabilities
  multi-agent         Multi-Agent Orchestrator — parallel code review + security analysis

Supported languages: nodejs
```

### Step 11: Save a report to disk

Run the orchestrator again and at the prompt type:

```
Analyze the same code as before and save the report to disk as my-analysis.md
```

The orchestrator should call `dispatch_all_agents` → `aggregate_and_report` → `save_report`.

Verify the output file:

```bash
cat samples/findings/my-analysis.md
```

### Step 12 (Bonus): Use GitHub MCP to analyze a PR

The orchestrator's session is connected to the GitHub MCP server with `tools: ['*']`. This means the AI can call any GitHub tool — including fetching PR diffs and posting PR reviews — without you needing to define them.

Try this prompt (replace with a real PR URL from your workshop repo):

```
Fetch the diff from https://github.com/<owner>/<repo>/pull/<number>,
analyze its changes, and write a PR review comment with the unified findings.
```

The orchestrator will:
1. Use the GitHub MCP `get_pull_request_diff` (or similar) to fetch the diff
2. Call `dispatch_all_agents` on the changed code
3. Call `aggregate_and_report` on the combined findings
4. Use the GitHub MCP `create_pull_request_review` to post the report as a PR review

### ✅ Checkpoint C

| | |
|--|--|
| Direct run works | Orchestrator starts and responds |
| Parallel dispatch visible | Console shows both sub-agents launching |
| Deduplication working | Hardcoded credential appears once in output |
| Runner script works | `--usecase multi-agent` dispatches correctly |
| Report saved to disk | `samples/findings/*.md` file created |

---

## Verification — Final Check

```bash
# From the repo root
ls sdk/nodejs/multi-agent-orchestrator.ts   # Your implementation exists
ls samples/findings/                         # Report files created
./automation/copilot-sdk-runner.sh --list    # multi-agent shown in list
./automation/copilot-sdk-runner.sh --diagnose # All checks pass
```

### Commands Run Summary

| Command | Purpose |
|---------|--------|
| `npx tsx multi-agent-orchestrator.ts` | Run orchestrator directly |
| `./automation/copilot-sdk-runner.sh --usecase multi-agent --lang nodejs` | Run via shared runner |
| `.\automation\copilot-sdk-runner.ps1 -Usecase multi-agent -Lang nodejs` | Run via shared runner (Windows) |
| `./automation/copilot-sdk-runner.sh --list` | List available use cases |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module '@github/copilot-sdk'` | Run `npm install` in `sdk/nodejs/` |
| TypeScript errors after copy | Compare with reference `sdk/nodejs/multi-agent-orchestrator.ts` |
| Both sub-agents still sequential | Check that you replaced BOTH sequential lines with `Promise.all` |
| Credential appears twice in output | Check the `secLines` Set construction and filter logic |
| `save_report` fails with ENOENT | Run from repo root or ensure `samples/findings/` exists |
| Agent hangs after dispatch | Ensure `GITHUB_TOKEN` is set and valid |

---

## Cleanup / Reset

```bash
# Remove your implementation to start fresh
rm sdk/nodejs/multi-agent-orchestrator.ts

# Remove saved reports
rm -f samples/findings/my-analysis.md samples/findings/multi-agent-report-*.md
```

---

Lab 5 complete! You have now built a multi-agent orchestration pipeline that:

1. ✅ Fans out to two specialist sub-agents **in parallel** via `Promise.all`
2. ✅ Aggregates and **deduplicates** findings across agent boundaries
3. ✅ Produces a single, severity-ranked **unified report**
4. ✅ Integrates with the **GitHub MCP server** for PR-level automation

This supervisor pattern scales directly to real-world scenarios: add more sub-agents (e.g. dependency audit, license compliance, performance profiling) by adding them to the `Promise.all` call and extending the aggregation logic.
