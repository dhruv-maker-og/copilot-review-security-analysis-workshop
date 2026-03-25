<!-- Lab 5: Multi-Agent Orchestration with Copilot SDK -->

> **Time estimate: 35 minutes** | **Format: Instructor demo + hands-on (Step 4)**

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

## Step 4: Create a PR and analyze it with the Orchestrator

This step has two parts: **4a** creates a real pull request with vulnerable code, and **4b** uses the running orchestrator to analyze it end-to-end via GitHub MCP.

---

### Step 4a: Create a feature branch and open a PR

You will create a new file with intentional vulnerabilities, commit it on a feature branch, and open a PR so the orchestrator has a real diff to work with.

> **Keep the orchestrator running** in its terminal from Step 2 — you will need it in Step 4b.

Open a **second terminal** in the repo root and run:

```bash
# 1. Create and switch to a new feature branch
git checkout -b feature/user-profile-api
```

**2. Create the file `sample-app/auth.js`** — copy and paste the following content into it:

```js
// =============================================================
// sample-app/auth.js  —  User Authentication Module
// =============================================================
// WARNING: This file contains INTENTIONAL security vulnerabilities
// and code quality issues for workshop exercises (Lab 5, Step 4).
// DO NOT use this code in production.
// =============================================================

const crypto = require('crypto');
const Database = require('better-sqlite3');

// ---------------------------------------------------------------
// VULNERABILITY 1: Hardcoded credentials
// Severity: HIGH — CWE-798 (Use of Hard-coded Credentials)
// ---------------------------------------------------------------
const JWT_SECRET = 'super-secret-jwt-key-do-not-share';
const ADMIN_PASSWORD = 'admin123!';

var db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT,
    created_at TEXT
  )
`);

// ---------------------------------------------------------------
// VULNERABILITY 2: SQL Injection via string concatenation
// Severity: CRITICAL — CWE-89 (SQL Injection)
// ---------------------------------------------------------------
function getUserByUsername(username) {
  console.log('DEBUG: looking up user: ' + username);
  // BAD: user input directly interpolated into SQL
  const query = `SELECT * FROM sessions WHERE user_id = '${username}'`;
  try {
    return db.prepare(query).all();
  } catch (e) {}  // CODE QUALITY: empty catch block — CWE-390
}

// ---------------------------------------------------------------
// VULNERABILITY 3: Weak password hashing (MD5)
// Severity: HIGH — CWE-328 (Use of Weak Hash)
// ---------------------------------------------------------------
function hashPassword(password) {
  // BAD: MD5 is cryptographically broken for password storage
  return crypto.createHash('md5').update(password).digest('hex');
}

// ---------------------------------------------------------------
// VULNERABILITY 4: eval() for expression parsing
// Severity: CRITICAL — CWE-95 (Code Injection)
// ---------------------------------------------------------------
function evaluatePermission(rule, userContext) {
  console.log('DEBUG: evaluating rule', rule);
  // BAD: eval() executes arbitrary code from user-controlled input
  return eval(rule);
}

// ---------------------------------------------------------------
// CODE QUALITY: var, magic numbers, TODO
// ---------------------------------------------------------------
function buildUserProfile(userId, role) {
  // TODO: add input validation before querying
  var profile = {};
  if (role === 'admin') {
    profile.accessLevel = 99;   // magic number
    profile.quota = 10000;      // magic number
  } else {
    profile.accessLevel = 1;
    profile.quota = 250;        // magic number
  }
  console.log('DEBUG: profile built for user ' + userId);
  return profile;
}

module.exports = { getUserByUsername, hashPassword, evaluatePermission, buildUserProfile };
```

**3. Stage, commit, and push:**

```bash
# Stage the new auth module
git add sample-app/auth.js

# Commit with a descriptive message
git commit -m "feat: add user authentication module"

# Push the branch to GitHub
git push -u origin feature/user-profile-api
```

Then open a pull request:

```bash
# Using the GitHub CLI
gh pr create \
  --title "feat: add user authentication module" \
  --body "Adds getUserByUsername, hashPassword, evaluatePermission, and buildUserProfile helpers." \
  --base main \
  --head feature/user-profile-api
```

The CLI will print the new PR URL, for example:
```
https://github.com/<owner>/test-lab5_demo/pull/1
```

Copy that URL — you will use it in Step 4b.

> **No GitHub CLI?** Open a PR manually via the GitHub web UI:  
> Go to your repo → **Pull requests** → **New pull request** → select `feature/user-profile-api` as the compare branch → **Create pull request**.

---

### Step 4b: Run the orchestrator against the PR

Switch back to the terminal where the orchestrator is running and paste this prompt (replace the URL with the one you copied):

```
Fetch the diff from https://github.com/<owner>/test-lab5_demo/pull/1,
analyze its changes, and write a PR review comment with the unified findings.
```

The orchestrator will:
1. Use GitHub MCP `get_pull_request_diff` to fetch the diff of `auth.js`
2. Call `dispatch_all_agents` on the changed code in parallel
3. Call `aggregate_and_report` to merge and deduplicate findings
4. Use GitHub MCP `create_pull_request_review` to post the report as a PR review

**Expected findings in the report:**

| Agent | What it catches |
|-------|----------------|
| Security Sub-Agent | SQL Injection (CWE-89), eval injection (CWE-95), Hardcoded credentials (CWE-798), Weak hash MD5 (CWE-328) |
| Code Review Sub-Agent | Empty catch block, `var` usage, TODO comment, debug `console.log` statements |
| After deduplication | Hardcoded credential kept in security section only (deduplicated from code review) |

After the run, navigate to the PR on GitHub — you will see the review comment posted by the orchestrator.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module '@github/copilot-sdk'` | Run `npm install` in `sdk/nodejs/` |
| `save_report` fails with ENOENT | Run from repo root or ensure `samples/findings/` exists |
| Agent hangs after dispatch | Ensure `GITHUB_TOKEN` is set and valid |
| `git push` rejected | Run `git pull --rebase origin main` first, then push again |
| `gh pr create` not found | Install GitHub CLI: `winget install GitHub.cli` (Windows) or `brew install gh` (macOS) |
| PR review comment not posted | Ensure your token has `repo` scope (not just `read`); regenerate if needed |

---

Lab 5 complete. The orchestrator:

1. ✅ Fans out to two sub-agents **in parallel** via `Promise.all`
2. ✅ **Deduplicates** findings across agent boundaries
3. ✅ Produces a single, severity-ranked **unified report**
4. ✅ You created a real PR with a vulnerable `auth.js` and had the orchestrator analyze its diff
5. ✅ Integrates with the **GitHub MCP server** to post the review comment directly on the PR
