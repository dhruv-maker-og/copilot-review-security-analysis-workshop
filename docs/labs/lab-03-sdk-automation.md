# Lab 3: SDK Automation for Code Review & Security Analysis

> **Time estimate:** 60 minutes
> **Instructor note:** Walk through the agent code structure together before participants run it. Explain the `defineTool` and `CopilotClient` patterns. The SDK may require a working GITHUB_TOKEN with Copilot API access.

---

## Objective

Use the **GitHub Copilot SDK** (Node.js) to programmatically run code review and security analysis agents. Execute them via the automation runner script and produce a structured markdown report.

## Prerequisites

- [Lab 1](lab-01-custom-agent-ide.md) and [Lab 2](lab-02-invocation-ide-cli.md) completed
- Node.js 20+ and tsx installed (`tsx --version` returns v4+)
- `GITHUB_TOKEN` available (created in [Step 1](../setup/01-licenses-and-access.md))

---

## Part A: Explore the SDK Project (15 min)

### Step 1: Navigate to the SDK Directory

```bash
cd sdk/nodejs
```

### Step 2: Review the Project Structure

```bash
ls -la
```

You should see:

```
├── package.json               # Dependencies: @github/copilot-sdk, tsx
├── tsconfig.json              # TypeScript configuration
├── code-review-agent.ts       # Code review agent
├── security-analysis-agent.ts # Security analysis agent
└── README.md                  # SDK project documentation
```

### Step 3: Review package.json

Open `sdk/nodejs/package.json` and note:

- `"type": "module"` — Uses ES modules
- `@github/copilot-sdk` — The Copilot SDK for building agents
- `tsx` — Zero-config TypeScript runner (no build step needed)

### Step 4: Review the Code Review Agent

Open `sdk/nodejs/code-review-agent.ts` and understand the key patterns:

```typescript
// 1. Import SDK
import { CopilotClient, defineTool, approveAll } from "@github/copilot-sdk";

// 2. Define tools with JSON Schema parameters
const analyzeCode = defineTool("analyze_code", {
  description: "Analyze code for quality issues",
  parameters: { /* JSON Schema */ },
  handler: async ({ code, language, focus }) => {
    // Tool logic here
    return { findings: [...], summary: "..." };
  },
});

// 3. Create a session with model, tools, and system message
const client = new CopilotClient();
const session = await client.createSession({
  model: "gpt-4o",
  streaming: true,
  tools: [analyzeCode, prepareReviewComment],
  systemMessage: { mode: "append", content: SYSTEM_PROMPT },
  onPermissionRequest: approveAll,
});

// 4. Handle events
session.on("assistant.message_delta", (event) => {
  process.stdout.write(event.data.deltaContent);
});

// 5. Send prompts and get responses
await session.sendAndWait({ prompt: "Review this code..." });
```

### Step 5: Review the Security Analysis Agent

Open `sdk/nodejs/security-analysis-agent.ts` and compare:

- Same SDK patterns (`CopilotClient`, `defineTool`, `createSession`)
- Different tools: `scan_vulnerabilities` and `prepare_security_report`
- Security-focused system prompt (OWASP Top 10, CWE references)

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Project files exist | All 5 files present in `sdk/nodejs/` |
| package.json reviewed | Dependencies and structure understood |
| Agent code reviewed | Both `.ts` files read and understood |

---

## Part B: Install and Run the Agents (25 min)

### Step 6: Install Dependencies

```bash
cd sdk/nodejs
npm install
```

**Expected output:**

```
added X packages in Xs
```

### Step 7: Set Up Environment Variables

```bash
# Navigate back to the repo root
cd ../..

# Copy the environment template
cp .env.example .env
```

Edit `.env` and add your GitHub token:

```
GITHUB_TOKEN=ghp_your_actual_token_here
```

> **IMPORTANT:** Never commit the `.env` file. It is already in `.gitignore`.

Export the token for the current terminal session:

```bash
# Bash / macOS / Linux
export GITHUB_TOKEN=$(grep GITHUB_TOKEN .env | cut -d'=' -f2)

# PowerShell / Windows
$env:GITHUB_TOKEN = (Get-Content .env | Select-String "GITHUB_TOKEN" | ForEach-Object { $_.Line.Split("=",2)[1] })
```

### Step 8: Run the Code Review Agent

```bash
cd sdk/nodejs
npx tsx code-review-agent.ts
```

**Expected output:**

```
🔍 Code Review Agent starting...

Tools registered:
  - analyze_code: Analyze a code snippet for quality issues
  - prepare_review_comment: Prepare a structured review comment

Type a prompt and press Enter to send (pasted multi-line input is auto-detected).
Type 'exit' to quit.

Assistant: [The agent introduces itself and explains how it can help]

>
```

Try this prompt when the agent starts (paste and it will be auto-detected):

```
Analyze the following code for quality issues:

const express = require("express");
const API_KEY = "sk-proj-abc123";
var result = [];
for (var i = 0; i < 10; i++) {
  if (i > 0) {
    if (i % 2 === 0) {
      result.push(i);
    }
  }
}
console.log("DEBUG: " + result);
```

The agent should identify:
- Hardcoded API key
- Use of `var` instead of `const`/`let`
- Deeply nested conditionals
- Debug console.log

Type `exit` to quit the agent.

### Step 9: Run the Security Analysis Agent

```bash
npx tsx security-analysis-agent.ts
```

**Expected output:**

```
🔒 Security Analysis Agent starting...

Tools registered:
  - scan_vulnerabilities: Scan code for security vulnerabilities
  - prepare_security_report: Prepare a security analysis report

Type a prompt and press Enter to send (pasted multi-line input is auto-detected).
Type 'exit' to quit.

Assistant: [The agent introduces itself and explains how it can help]

>
```

Try this prompt (paste and it will be auto-detected):

```
Scan this code for security vulnerabilities:

app.get("/api/users/search", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const rows = db.prepare(query).all();
  res.json(rows);
});

app.post("/api/calculate", (req, res) => {
  const result = eval(req.body.expression);
  res.json({ result });
});
```

The agent should identify:
- SQL injection (CWE-89)
- Code injection via eval (CWE-95)

Type `exit` to quit.

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| npm install succeeded | No errors during dependency installation |
| GITHUB_TOKEN set | Token exported to environment |
| Code review agent runs | Agent starts and responds to prompts |
| Security agent runs | Agent starts and identifies vulnerabilities |

---

## Part C: Use the Runner Script (20 min)

### Step 10: Review the Runner Script

Navigate back to the repo root and read the automation script:

```bash
cd ../..
cat automation/copilot-sdk-runner.sh
```

The runner script:
- Accepts `--usecase <name>` and `--lang <lang>` flags
- Validates arguments and checks for Node.js
- Runs `npm install` and then `npx tsx <agent>.ts` in the correct directory
- Checks for `GITHUB_TOKEN` before execution

### Step 11: Run via the Runner Script

Make the runner executable and run:

```bash
chmod +x automation/copilot-sdk-runner.sh

# Run code review agent
./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs

# Run security analysis agent
./automation/copilot-sdk-runner.sh --usecase security-analysis --lang nodejs
```

**Windows (PowerShell):**

```powershell
# Run code review agent
.\automation\copilot-sdk-runner.ps1 -Usecase code-review -Lang nodejs

# Run security analysis agent
.\automation\copilot-sdk-runner.ps1 -Usecase security-analysis -Lang nodejs
```

### Step 12: List Available Use Cases

```bash
./automation/copilot-sdk-runner.sh --list
```

**Expected output:**

```
Available use cases:
  code-review         Code Review Agent — analyzes code quality and style
  security-analysis   Security Analysis Agent — scans for OWASP Top 10 vulnerabilities

Supported languages: nodejs

Example:
  ./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs
```

### Step 13: Run Diagnostics

```bash
./automation/copilot-sdk-runner.sh --diagnose
```

**Expected output:**

```
=== Copilot SDK Runner Diagnostics ===

Node.js:     ✅ v20.x.x
npm:         ✅ v10.x.x
tsx:         ✅ v4.x.x
GITHUB_TOKEN: ✅ Set
Git:         ✅ v2.x.x

All checks passed. Ready to run.
```

### ✅ Checkpoint C

| Check | Expected |
|-------|----------|
| Runner script works | `./automation/copilot-sdk-runner.sh --list` shows use cases |
| Diagnostics pass | `--diagnose` shows all green checks |
| Code review runs | `--usecase code-review --lang nodejs` launches agent |
| Security analysis runs | `--usecase security-analysis --lang nodejs` launches agent |

---

## Verification — Final Check

After completing all three parts, verify these artifacts exist:

```bash
# From the repo root
ls sdk/nodejs/node_modules/       # Dependencies installed
ls samples/findings/              # Example output files present
cat automation/README.md          # Runner documentation present
```

### Commands Run Summary

| Command | Purpose |
|---------|---------|
| `npx tsx code-review-agent.ts` | Run the code review SDK agent directly |
| `npx tsx security-analysis-agent.ts` | Run the security analysis SDK agent directly |
| `./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs` | Run via the shared runner script |
| `./automation/copilot-sdk-runner.sh --usecase security-analysis --lang nodejs` | Run via the shared runner script |
| `./automation/copilot-sdk-runner.sh --list` | List available use cases |
| `./automation/copilot-sdk-runner.sh --diagnose` | Check prerequisites |

### Expected Report Output

When agents run in production mode, they produce a report at `samples/findings/report.md` with this structure:

```markdown
# Code Review & Security Analysis Report

**Generated:** 2026-03-13T10:30:00Z
**Agent:** Copilot SDK Automation

## Summary
- Files analyzed: 2
- Code quality findings: 8
- Security findings: 5
- Overall risk: CRITICAL

## Security Findings

### [CRITICAL] SQL Injection — CWE-89
**File:** sample-app/server.js:55
**Description:** User input directly interpolated into SQL query.
**Remediation:** Use parameterized queries with prepared statements.

### [CRITICAL] Code Injection via eval() — CWE-95
**File:** sample-app/server.js:73
...

## Code Quality Findings

### [HIGH] Duplicated Validation Logic
**File:** sample-app/utils.js:93-118
...
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Check Node.js version (`node -v` — need 20+) |
| "Cannot find module @github/copilot-sdk" | Run `npm install` in `sdk/nodejs/` directory |
| Agent starts but hangs | Ensure `GITHUB_TOKEN` is set and valid |
| "Unauthorized" error | Generate a new token with `copilot` scope |
| Runner script: "permission denied" | Run `chmod +x automation/copilot-sdk-runner.sh` |
| PowerShell execution policy | Run `Set-ExecutionPolicy RemoteSigned -Scope Process` |
| tsx not found | Install globally: `npm install -g tsx` |

## Cleanup / Reset

```bash
# Remove installed dependencies
rm -rf sdk/nodejs/node_modules

# Remove generated reports  
rm -f samples/findings/report.md

# Remove .env (contains token)
rm -f .env

# Reinstall for fresh start
cd sdk/nodejs && npm install && cd ../..
```

---

**Lab 3 complete!** You have now built and run code review and security analysis agents across all three modalities:

1. ✅ **IDE** — Custom agent with skills and hooks in VS Code
2. ✅ **CLI** — Copilot CLI invocation with GitHub Actions workflows
3. ✅ **SDK** — Programmatic automation with Node.js and the Copilot SDK

Return to the [Workshop Overview](../workshop-overview.md) for wrap-up and next steps.
