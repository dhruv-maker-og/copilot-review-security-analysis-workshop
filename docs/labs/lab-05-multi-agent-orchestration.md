<!-- Lab 5: Multi-Agent Orchestration with Copilot SDK -->

> **Time estimate: 25 minutes** | **Format: Instructor demo — no participant coding required**

# Lab 5: Multi-Agent Orchestration with Copilot SDK

## Objective

See the pre-built Orchestrator Agent run both specialist sub-agents (Code Review + Security Analysis) **in parallel**, deduplicate overlapping findings, produce a unified report, and post a PR review — all from a single command.

---

## Prerequisites

- [Lab 3](lab-03-sdk-automation.md) completed — `sdk/nodejs/node_modules/` installed and `GITHUB_TOKEN` set
- The orchestrator implementation is already provided at `sdk/nodejs/multi-agent-orchestrator.ts` — no changes needed

---

## Architecture

```
User prompt
    │
    ▼
Orchestrator Session  (multi-agent-orchestrator.ts)
    │
    │  Tool: dispatch_all_agents
    │
    ▼  Promise.all(...)
    ├── codeReviewSubAgent(code, lang)    ◄── runs concurrently
    └── securitySubAgent(code, lang)     ◄── runs concurrently
    │
    │  Tool: aggregate_and_report
    │     Merge + deduplicate + rank by severity
    │
    │  Tool: save_report  (optional)
    │     Write markdown to samples/findings/
    │
    ▼
Unified report returned to user
```

**Supervisor pattern:** the orchestrator AI decides which tools to call and in what order. Inside `dispatch_all_agents`, both sub-agents run concurrently via `Promise.all` and return their results together as a single object.

---

## Step 1: Open the implementation

Open `sdk/nodejs/multi-agent-orchestrator.ts`. Note the three tools defined near the top:

| Tool | What it does |
|------|-------------|
| `dispatch_all_agents` | Fans out to both sub-agents with `Promise.all` |
| `aggregate_and_report` | Merges findings, deduplicates across agent boundaries, ranks by severity |
| `save_report` | Writes the unified report to `samples/findings/` |

No changes needed — this file is the complete reference implementation.

---

## Step 2: Start the orchestrator

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

## Step 3: Run the sample-app code through the orchestrator

Paste this prompt at the `>` prompt:

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

Watch for:

1. `⚡ Dispatching sub-agents in parallel...` logged immediately
2. Both sub-agents completing (nearly simultaneously)
3. The orchestrator calling `aggregate_and_report`
4. A unified report with:
   - **🔴 CRITICAL** risk overall
   - SQL Injection (CWE-89) and eval injection (CWE-95) in the security section
   - Hardcoded credential appearing **once** (security section only — deduplicated)
   - Code quality issues: empty catch, `var`, TODO comment

Then save the report to disk at the same prompt:

```
Analyze the same code as before and save the report to disk as my-analysis.md
```

The orchestrator will call `dispatch_all_agents` → `aggregate_and_report` → `save_report`. Verify:

```bash
cat samples/findings/my-analysis.md
```

For an example of expected output, see `samples/findings/multi-agent-report-example.md`.

---

## Step 4: Use GitHub MCP to analyze a PR

The orchestrator session connects to the GitHub MCP server with `tools: ['*']`, so the AI can call any GitHub tool — including fetching PR diffs and posting reviews — without any extra code.

Try this prompt (replace with a real PR URL):

```
Fetch the diff from https://github.com/<owner>/<repo>/pull/<number>,
analyze its changes, and write a PR review comment with the unified findings.
```

The orchestrator will:
1. Use the GitHub MCP `get_pull_request_diff` (or similar) to fetch the diff
2. Call `dispatch_all_agents` on the changed code
3. Call `aggregate_and_report` on the combined findings
4. Use the GitHub MCP `create_pull_request_review` to post the report as a PR review

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module '@github/copilot-sdk'` | Run `npm install` in `sdk/nodejs/` |
| `save_report` fails with ENOENT | Run from repo root or ensure `samples/findings/` exists |
| Agent hangs after dispatch | Ensure `GITHUB_TOKEN` is set and valid |

---

Lab 5 complete. The orchestrator:

1. ✅ Fans out to two sub-agents **in parallel** via `Promise.all`
2. ✅ **Deduplicates** findings across agent boundaries
3. ✅ Produces a single, severity-ranked **unified report**
4. ✅ Integrates with the **GitHub MCP server** for PR-level automation
