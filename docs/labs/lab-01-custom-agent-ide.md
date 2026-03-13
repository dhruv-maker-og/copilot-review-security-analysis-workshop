# Lab 1: Custom Agent & Skills on IDE

> **Time estimate:** 90 minutes
> **Instructor note:** Demo the first 10 minutes (creating an agent file, showing it appear in Chat). Then let participants work hands-on. Walk the room and help with hooks — they're the trickiest part.

---

## Objective

Build a custom **Code Review Agent** in VS Code with custom instructions, skills, and GitHub Copilot hooks. Then extend it to also perform **security review**, so you have one agent that does both code review and security analysis.

## Prerequisites

- All [setup steps](../setup/05-validation-checks.md) completed and validated
- Workshop repository cloned and open in VS Code
- Copilot Chat panel accessible (`Ctrl+Shift+I` / `Cmd+Shift+I`)

---

## Part A: Create a Custom Agent (25 min)

### Step 1: Create the Agent Directory

In your terminal (inside the workshop repository root):

```bash
mkdir -p .github/agents
```

### Step 2: Create the Agent File

Create the file `.github/agents/code-review.agent.md` with the following content:

```markdown
---
name: code-review
description: 'Expert code reviewer that analyzes code quality, identifies bugs, and suggests improvements with security awareness'
tools:
  - read
  - edit
  - search
---

# Code Review Agent

You are an expert code reviewer and application security engineer. When reviewing code, you perform two analyses:

## Code Quality Review
1. Check naming conventions, function structure, and readability
2. Identify duplicated logic (DRY violations) and suggest refactoring
3. Find magic numbers, debug logging, and TODO comments
4. Evaluate error handling coverage and edge cases
5. Check for callback hell and suggest modern alternatives

## Security Review
1. Scan for OWASP Top 10 vulnerabilities
2. Identify hardcoded credentials, API keys, or tokens
3. Check for injection vulnerabilities (SQL, command, XSS)
4. Verify cryptographic practices (no MD5/SHA1 for passwords)
5. Check that error messages do not expose internal details

## Output Format
Provide findings in this structure:
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION
- **Category**: Security or Code Quality
- **File and Line**: Exact location
- **Description**: What the issue is and why it matters
- **Recommendation**: Concrete fix with code example

Start with a summary table, then list detailed findings sorted by severity.
```

> **TIP:** The YAML frontmatter (between the `---` markers) defines metadata. The Markdown body below is the system prompt that shapes the agent's behavior.

### Step 3: Verify the Agent Appears in VS Code

1. Open the **Copilot Chat** panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. In the chat input box, type `@`
3. You should see **code-review** listed among the available agents
4. If it doesn't appear, try reloading VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Agent file exists | `.github/agents/code-review.agent.md` is created |
| Agent visible in Chat | Typing `@` shows `code-review` in the agent list |

---

## Part B: Create Custom Instructions (15 min)

Custom instructions provide additional context and rules that agents follow. The templates are already provided in the workshop repo.

### Step 4: Review the Instruction Files

Open and read the existing instruction templates:

- `agents/instructions/code-review.md` — Code quality review criteria
- `agents/instructions/security-review.md` — Security analysis criteria (OWASP Top 10)

These files define the detailed review checklists that your agent will follow.

### Step 5: Create an Instructions File for VS Code

Create a custom instructions file that VS Code will pick up:

```bash
mkdir -p .github/instructions
```

Create `.github/instructions/review-standards.instructions.md`:

```markdown
---
description: 'Code review and security standards for this project'
applyTo: '**/*.js'
---

# Review Standards

When reviewing JavaScript files in this project, always check for:

## Code Quality
- Use `const` and `let` instead of `var`
- Prefer arrow functions for callbacks
- Use template literals instead of string concatenation for SQL (use parameterized queries)
- Extract magic numbers into named constants
- Remove all console.log debug statements before review completion

## Security
- Never use `eval()` on user input
- Always use parameterized queries for database operations
- Hash passwords with bcrypt or argon2, never MD5 or SHA1
- Sanitize all user input before rendering in HTML
- Never log secrets, tokens, or passwords
```

> **NOTE:** The `applyTo` field tells Copilot to apply these instructions when working with `.js` files in this project.

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Instructions reviewed | You've read both `agents/instructions/` files |
| VS Code instructions file | `.github/instructions/review-standards.instructions.md` exists |

---

## Part C: Create Agent Skills (15 min)

Skills are focused capabilities that add domain knowledge to your agents.

### Step 6: Review the Skill Templates

Open the existing skill templates in the workshop repo:

- `agents/skills/skill-code-review.md` — Code review skill definition
- `agents/skills/skill-security-analysis.md` — Security analysis skill definition

### Step 7: Create a Skill for VS Code

Create a skill directory and file:

```bash
mkdir -p .github/skills/review-and-scan
```

Create `.github/skills/review-and-scan/SKILL.md`:

```markdown
---
name: 'Review and Scan'
description: 'Combined code review and security scan skill that produces a unified report with findings sorted by severity'
---

# Review and Scan Skill

This skill performs both code review and security analysis in a single pass.

## Steps

1. Read the target file(s)
2. Analyze for code quality issues (naming, structure, duplication, error handling)
3. Scan for security vulnerabilities (OWASP Top 10, hardcoded secrets, injection)
4. Produce a unified report sorted by severity

## Report Format

The output should follow this structure:

### Summary
- Files reviewed: [count]
- Code quality findings: [count]
- Security findings: [count]
- Overall risk: CRITICAL / HIGH / MEDIUM / LOW

### Findings Table
| # | Severity | Category | File:Line | Issue | CWE |
|---|----------|----------|-----------|-------|-----|
| 1 | CRITICAL | Security | server.js:55 | SQL Injection | CWE-89 |

### Detailed Findings
[Full description with code fix for each finding]
```

### ✅ Checkpoint C

| Check | Expected |
|-------|----------|
| Skill templates reviewed | You've read both `agents/skills/` files |
| Combined skill created | `.github/skills/review-and-scan/SKILL.md` exists |

---

## Part D: Create Copilot Hooks (25 min)

Hooks are shell commands or scripts that run automatically during Copilot agent lifecycle events. They provide deterministic guardrails — formatting, linting, security gates — that don't depend on the AI remembering to do it.

> **IMPORTANT:** These are **GitHub Copilot hooks** (for the Copilot coding agent), NOT Git hooks. They are defined in `.github/hooks/` and follow the [GitHub Copilot hooks specification](https://docs.github.com/en/copilot/reference/hooks-configuration).

### Step 8: Review the Hooks Configuration

The workshop repository already includes a hooks configuration. Open and examine:

**`.github/hooks/hooks.json`** — Defines three hook events:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [{
      "type": "command",
      "bash": ".github/hooks/scripts/log-context.sh",
      "cwd": ".",
      "timeoutSec": 5
    }],
    "postToolUse": [{
      "type": "command",
      "bash": ".github/hooks/scripts/post-review.sh",
      "cwd": ".",
      "timeoutSec": 30
    }],
    "agentStop": [{
      "type": "command",
      "bash": ".github/hooks/scripts/security-gate.sh",
      "cwd": ".",
      "timeoutSec": 15
    }]
  }
}
```

| Event | Script | Purpose |
|-------|--------|---------|
| `sessionStart` | `log-context.sh` | Log session metadata to `logs/copilot/session.log` |
| `postToolUse` | `post-review.sh` | Run formatter/linter after agent edits, append to report |
| `agentStop` | `security-gate.sh` | Check for CRITICAL findings and block if found |

### Step 9: Review the Hook Scripts

Open each script and understand what it does:

1. **`.github/hooks/scripts/log-context.sh`** — Reads JSON context from stdin, writes structured log entry with timestamp and working directory. Safe: does not log sensitive data.

2. **`.github/hooks/scripts/post-review.sh`** — Runs Prettier and ESLint (if available), appends a timestamped entry to `samples/findings/report.md`.

3. **`.github/hooks/scripts/security-gate.sh`** — Scans for CRITICAL patterns (eval, SQL injection), exits non-zero to block if found. Logs gate decision to `logs/copilot/security-gate.log`.

### Step 10: Make Hook Scripts Executable

```bash
chmod +x .github/hooks/scripts/post-review.sh
chmod +x .github/hooks/scripts/security-gate.sh
chmod +x .github/hooks/scripts/log-context.sh
```

> **Windows users:** Scripts will execute via Git Bash or WSL. The `powershell` field in hooks.json can also be used for Windows-native execution.

### Step 11: Test a Hook Script Manually

You can test the security gate script directly:

```bash
echo '{}' | .github/hooks/scripts/security-gate.sh
```

**Expected output** (because `sample-app/server.js` contains eval and SQL injection):

```
🚨 SECURITY GATE FAILED: X critical finding(s) detected.
   Review the security report at: samples/findings/report.md
   Fix all CRITICAL issues before proceeding.
```

Test the log-context script:

```bash
echo '{"event":"test"}' | .github/hooks/scripts/log-context.sh
```

**Expected output:**

```
📝 Session context logged to logs/copilot/session.log
```

Verify the log was created:

```bash
cat logs/copilot/session.log
```

### ✅ Checkpoint D

| Check | Expected |
|-------|----------|
| hooks.json reviewed | You understand the 3 hook events |
| Scripts reviewed | You've read all 3 scripts |
| Scripts executable | `chmod +x` applied (macOS/Linux) |
| Manual test | `security-gate.sh` exits with non-zero (detects vulnerabilities) |
| Log created | `logs/copilot/session.log` contains a JSON entry |

---

## Part E: Test the Agent (10 min)

### Step 12: Invoke the Agent on the Sample App

1. Open the Copilot Chat panel
2. Type:

```
@code-review Review the file sample-app/server.js for code quality and security issues. Provide a detailed report with severity levels and fix suggestions.
```

3. Wait for the agent to analyze the file

### Step 13: Review the Output

The agent should identify findings like:

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Security | SQL injection via string interpolation (line ~55) |
| 2 | CRITICAL | Security | eval() on user input (line ~73) |
| 3 | HIGH | Security | Hardcoded API key and password (lines ~21-22) |
| 4 | HIGH | Security | MD5 for password hashing (line ~87) |
| 5 | MEDIUM | Security | XSS — unsanitized user input in HTML (line ~101) |
| 6 | MEDIUM | Code Quality | Error details leaked to client (line ~59) |
| 7 | LOW | Code Quality | Secrets logged to console (line ~115) |

### Step 14: Test on utils.js

```
@code-review Review the file sample-app/utils.js focusing on code quality. Identify duplicated logic, magic numbers, and unnecessary debug logging.
```

Expected findings:
- Deeply nested conditionals in `processUserData`
- Magic numbers in `calculateDiscount`
- console.log debugging in `formatLog`
- Duplicated validation in `getUserById` / `getProductById` / `getOrderById`
- Callback hell in `fetchAndProcess`

### ✅ Checkpoint E — Final Verification

| Check | Expected |
|-------|----------|
| Agent invoked | `@code-review` responds with structured findings |
| Security findings | At least 5 security issues identified in `server.js` |
| Quality findings | At least 5 code quality issues identified in `utils.js` |
| Hooks configured | `hooks.json` + 3 scripts ready in `.github/hooks/` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent not showing in `@` list | Reload VS Code window; ensure file is at `.github/agents/code-review.agent.md` |
| Agent gives generic responses | Check the system prompt in the `.agent.md` file; make it specific |
| Hook scripts fail with "permission denied" | Run `chmod +x` on each script |
| Hook logs not created | Ensure the `logs/copilot/` directory is writable; create it with `mkdir -p` |
| Security gate passes unexpectedly | Check that `sample-app/server.js` still contains the original vulnerable code |
| Skills not recognized | Ensure the SKILL.md file has valid YAML frontmatter with `name` and `description` |

## Where Hook Logs Appear

- Session logs: `logs/copilot/session.log`
- Hook execution logs: `logs/copilot/hooks.log`
- Security gate decisions: `logs/copilot/security-gate.log`
- Report entries: `samples/findings/report.md`

## Cleanup / Reset

```bash
# Remove created agent files (keeps templates in agents/)
rm -rf .github/agents/
rm -rf .github/instructions/
rm -rf .github/skills/

# Reset logs
rm -rf logs/

# Reset generated reports
rm -f samples/findings/report.md
```

---

**Lab 1 complete!** Proceed to [Lab 2: Invocation from IDE & CLI →](lab-02-invocation-ide-cli.md)
