# Lab 2: Copilot CLI & GitHub Actions Workflows

> **Time estimate:** 50 minutes
> **Instructor note:** Demo the Copilot CLI install and `/login` flow live before participants try. Show at least `/review` and `/agent` end-to-end. The workflow YAML files used in Part B are already in the repo — participants review and trigger them.

---

## Objective

Invoke the Copilot CLI on the command line and set up **GitHub Actions workflows** that run the code review and security analysis agents automatically on pull requests.

## Prerequisites

- [Lab 1](lab-01-custom-agent-ide.md) completed (agents, instructions, skills, and hooks created under `.github/`)
- **Node.js 22+** installed (`node -v` shows v22 or higher) — Copilot CLI requires Node.js 22+, which is higher than the v20+ needed for Lab 3
- Repository pushed to GitHub (for `/delegate` and workflow exercises)
- An active GitHub Copilot license ([verify in Step 1](../setup/01-licenses-and-access.md))

---

## Part A: Copilot CLI — Install, Authenticate & Slash Commands (25 min)

GitHub Copilot CLI is a **standalone AI agent** you run directly in your terminal. Unlike the older `gh copilot` extension (which requires the GitHub CLI), Copilot CLI is installed via **npm** and works identically on Windows, macOS, and Linux — no platform-specific tooling required.

The CLI operates in two modes:
- **Interactive** — launch `copilot`, then chat and use slash commands inside a persistent session
- **Programmatic** — run `copilot -p "prompt"` for a single-shot task that exits on completion

Critically for this lab, Copilot CLI **automatically discovers** the agents (`.github/agents/`), instructions (`.github/instructions/`), skills (`.github/skills/`), and hooks (`.github/hooks/`) you created in Lab 1. Everything you built in Lab 1 works out of the box in the CLI — no extra configuration needed.

> **Reference:** [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli) · [CLI Command Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

---

### Step 1: Install Copilot CLI via npm

> **Prerequisite:** Node.js **22 or later** is required. Check your version:
>
> ```bash
> node -v
> ```
>
> If the output shows a version below v22, upgrade Node.js before continuing. Use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows):
>
> ```bash
> nvm install 22
> nvm use 22
> ```

Install the Copilot CLI globally:

```bash
npm install -g @github/copilot
```

> **NOTE:** If you have `ignore-scripts=true` in your `~/.npmrc` file, use:
>
> ```bash
> npm_config_ignore_scripts=false npm install -g @github/copilot
> ```

Verify the installation:

```bash
copilot version
```

**Expected output:**

```
GitHub Copilot CLI vX.X.X
```

> **Alternative install methods (platform-specific):**
>
> | Platform | Command |
> |----------|----------|
> | Windows (WinGet) | `winget install GitHub.Copilot` |
> | macOS / Linux (Homebrew) | `brew install copilot-cli` |
> | macOS / Linux (script) | `curl -fsSL https://gh.io/copilot-install \| bash` |
>
> The npm method is recommended because it's **platform-agnostic** and only requires Node.js.

#### Troubleshooting Install

| Problem | Solution |
|---------|----------|
| `npm ERR! EACCES` permission denied | **macOS/Linux:** Use `sudo npm install -g @github/copilot` or fix npm permissions. **Windows:** Run terminal as Administrator |
| `copilot: command not found` | Restart your terminal. Check that npm's global bin directory is in your `PATH`: `npm config get prefix` |
| Node.js version error | Copilot CLI requires Node.js **22+**. Upgrade with `nvm install 22` or download from [nodejs.org](https://nodejs.org/) |

---

### Step 2: Authenticate with `/login` (OAuth Device Flow)

Copilot CLI uses an **OAuth device flow** — it generates a one-time code, you paste it in your browser, and you're authenticated. No tokens to copy-paste manually.

> **Reference:** [Authenticating GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli)

#### Method A: Login from the interactive interface (recommended)

1. Navigate to the workshop repository root and launch Copilot CLI:

   ```bash
   cd copilot-review-security-analysis-workshop
   copilot
   ```

2. **Trust the directory** — On first launch, Copilot asks you to confirm that you trust the files in this folder. Choose:
   - **"Yes, and remember this folder for future sessions"** (recommended for the workshop)

3. If you are not logged in, type `/login` at the prompt:

   ```
   /login
   ```

4. Select your GitHub host:

   ```
   What account do you want to log into?
    1. GitHub.com
    2. GitHub Enterprise Cloud with data residency (*.ghe.com)
   ```

   Choose **1** for GitHub.com.

5. The CLI displays a **one-time code** and automatically copies it to your clipboard:

   ```
   Waiting for authorization...
   Enter one-time code: 1234-5678 at https://github.com/login/device
   Press any key to copy to clipboard and open browser...
   ```

6. Your browser opens to `https://github.com/login/device`. Paste the code and click **Continue**.

7. Review the requested permissions and click **Authorize GitHub Copilot CLI**.

8. Return to your terminal. You should see:

   ```
   Signed in successfully as <your-username>. You can now use Copilot.
   ```

#### Method B: Login from the terminal (before entering interactive mode)

```bash
copilot login
```

This runs the same OAuth device flow but from outside the interactive interface.

#### Verify authentication

Inside the interactive interface, type:

```
/user
```

You should see your GitHub username displayed.

> **Alternative: Environment variable authentication** (for CI/CD or headless environments)
>
> Generate a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) with the **"Copilot Requests"** permission, then export it:
>
> ```bash
> # Bash / macOS / Linux
> export COPILOT_GITHUB_TOKEN=github_pat_your_token_here
>
> # PowerShell
> $env:COPILOT_GITHUB_TOKEN = "github_pat_your_token_here"
> ```
>
> Token precedence: `COPILOT_GITHUB_TOKEN` > `GH_TOKEN` > `GITHUB_TOKEN` > stored OAuth token > `gh auth` fallback.
>
> **Important:** Classic personal access tokens (`ghp_`) are **not supported** by Copilot CLI. Use OAuth or a fine-grained PAT.

#### Troubleshooting Auth

| Problem | Solution |
|---------|----------|
| `No authentication information found` | Run `/login` or `copilot login`. Check that env vars are not set to an invalid token |
| `Token (classic) rejected` | Classic PATs (`ghp_`) are not supported. Use OAuth flow or a fine-grained PAT with "Copilot Requests" permission |
| `Access denied by policy` | Check that your account has an active Copilot license. Ask your org admin to enable Copilot CLI in the org policy |
| `Authentication failed` / token expired | Re-run `/login` to re-authenticate. If using a PAT, regenerate it |
| Wrong account | Type `/user switch` to switch accounts, or `/logout` then `/login` with the correct account |

> **Full troubleshooting guide:** [Troubleshooting Copilot CLI Authentication](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/troubleshoot-copilot-cli-auth)

---

### Step 3: `/review` — Code Review

The `/review` slash command runs the built-in **code-review agent** to analyze code changes directly from the CLI. It automatically applies the custom instructions you created in Lab 1 (`.github/instructions/review-standards.instructions.md`) — your review priorities, severity levels, and output format are all in effect.

> **Reference:** [Requesting a code review with GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/agentic-code-review)

#### Try it: Review the sample app for security issues

Inside the interactive Copilot CLI session, type:

```
/review Review @sample-app/server.js for security vulnerabilities and code quality issues. Prioritize CRITICAL and HIGH severity findings.
```

> **TIP:** The `@` prefix includes the file contents in the context. You can use `@sample-app/server.js` to reference any file by relative path.

**Expected output:** Copilot analyzes the file and identifies findings such as:

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | CRITICAL | SQL injection via string interpolation | server.js ~line 55 |
| 2 | CRITICAL | `eval()` on user input | server.js ~line 73 |
| 3 | HIGH | Hardcoded API key and database password | server.js ~lines 21-22 |
| 4 | HIGH | MD5 for password hashing (CWE-328) | server.js ~line 87 |
| 5 | MEDIUM | Error details leaked to client | server.js ~line 59 |

#### Try it: Review utils.js for code quality

```
/review Analyze @sample-app/utils.js for code quality issues: duplicated logic, magic numbers, callback nesting, and var usage.
```

**Expected output:** Findings covering deeply nested conditionals, magic numbers in `calculateDiscount`, console.log debugging left in `formatLog`, duplicated validation across `getUserById`/`getProductById`/`getOrderById`, and callback hell in `fetchAndProcess`.

> **How does this connect to Lab 1?** The `/review` command uses the built-in `code-review` agent, which is complemented by your custom `code-review.agent.md` from Lab 1 (repo-level agents take precedence). The review standards from your `.instructions.md` file are applied automatically because of the `applyTo: '**/*.js'` pattern.

---

### Step 4: `/agent` — Invoke Custom Agents

The `/agent` slash command lets you browse and select from all available agents — both the **built-in agents** that ship with Copilot CLI and the **custom agents** you created in Lab 1.

> **Reference:** [Invoking custom agents](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/invoke-custom-agents)

#### Try it: Browse available agents

Type:

```
/agent
```

You should see a list that includes:

| Agent | Source | Description |
|-------|--------|-------------|
| `code-review` | Lab 1 (`.github/agents/`) | Your custom code reviewer with structured output |
| `security-analysis` | Lab 1 (`.github/agents/`) | Your custom OWASP security scanner with CWE references |
| `explore` | Built-in | Fast codebase analysis without adding to main context |
| `task` | Built-in | Executes commands (tests, builds) with brief summaries |
| `general-purpose` | Built-in | Complex multi-step tasks with full toolset |
| `research` | Built-in | Deep research across codebase and web |

> **NOTE:** Your custom agents from Lab 1 appear because Copilot CLI auto-discovers agent files in `.github/agents/`. The custom `code-review` agent takes **precedence** over the built-in one at the repository level.

#### Try it: Invoke the security-analysis agent

Select `security-analysis` from the agent list, then enter this prompt:

```
Perform a comprehensive OWASP Top 10 security scan on @sample-app/server.js. For each finding, include the CWE identifier, severity rating, proof of concept, and remediation with before/after code examples.
```

**Expected output:** The agent produces findings following the output format defined in your `security-analysis.agent.md` from Lab 1 — with CWE references (CWE-89 for SQL injection, CWE-95 for eval, CWE-798 for hardcoded secrets, CWE-328 for weak hashing) and structured remediation.

#### Alternative: Invoke an agent by name in a prompt

You can also reference an agent by name directly in your prompt without using `/agent`:

```
Use the security-analysis agent to scan @sample-app/server.js for injection vulnerabilities and hardcoded secrets.
```

Copilot will automatically infer and delegate to the correct agent.

#### Alternative: Programmatic invocation (non-interactive)

From your terminal (outside the interactive interface):

```bash
copilot --agent=security-analysis -p "Scan sample-app/server.js for OWASP Top 10 vulnerabilities" --allow-tool='read'
```

This runs the agent in single-prompt mode and exits after completion — useful for scripting and CI/CD integration.

---

### Step 5: `/fleet` — Parallel Subagent Execution

The `/fleet` command splits a task across **multiple subagents that work simultaneously**. Instead of reviewing files one at a time, you can analyze the entire sample app in parallel.

#### Try it: Fleet review of the entire sample app

```
/fleet Analyze the sample-app/ directory in parallel: (1) Review server.js for OWASP Top 10 security vulnerabilities with CWE references and severity ratings, (2) Review utils.js for JavaScript anti-patterns, code duplication, magic numbers, and callback nesting, (3) Review test/server.test.js for test coverage gaps and missing edge cases.
```

**Expected output:** Copilot spawns three subagents that work concurrently:
- **Subagent 1** analyzes `server.js` → security findings (SQL injection, eval, hardcoded secrets, MD5)
- **Subagent 2** analyzes `utils.js` → code quality findings (var usage, callback hell, duplicated validation, magic numbers)
- **Subagent 3** analyzes `test/server.test.js` → test coverage findings (missing edge cases, untested endpoints)

Results from all three are combined into a single response.

> **When is `/fleet` useful?** For large codebases or multi-file reviews where sequential analysis would be slow. Each subagent operates independently, so the total time is closer to the **longest single review** rather than the sum of all reviews.

---

### Step 6: `/plan` — Implementation Planning

The `/plan` command switches Copilot into **plan mode** — it analyzes your request, asks clarifying questions if needed, and builds a structured implementation plan **before writing any code**. This is ideal for complex remediation where you want to review the approach before making changes.

> **TIP:** You can also press `Shift+Tab` to cycle between standard, plan, and autopilot modes.

#### Try it: Plan a remediation for critical findings

```
/plan Create a remediation plan for all CRITICAL and HIGH severity findings in sample-app/server.js. For each finding, outline: (1) the specific fix, (2) which files need to change, (3) any new dependencies required, and (4) how to verify the fix works.
```

**Expected output:** Copilot produces a structured plan covering:

1. **SQL Injection fix** — Replace string interpolation with parameterized queries using `db.prepare().all()`
2. **eval() removal** — Replace `eval()` with a safe math expression parser (e.g., `mathjs` or manual parsing)
3. **Hardcoded secrets** — Move `API_KEY` and `DB_PASSWORD` to environment variables, update code to read from `process.env`
4. **MD5 replacement** — Switch from `crypto.createHash('md5')` to `bcrypt` for password hashing

Each step includes the files affected and verification steps — but **no code is changed yet**. You review the plan, provide feedback, and only then let Copilot proceed.

> **How does this differ from `/review`?** The `/review` command **identifies issues**. The `/plan` command **designs the fix**. Use them together: review first to find problems, then plan the remediation.

---

### Step 7: `/delegate` — Delegate to Copilot Coding Agent

The `/delegate` command hands off work to the **cloud-based Copilot coding agent** on GitHub. It preserves your session context, commits any unstaged changes as a checkpoint in a new branch, and opens a **draft pull request** where the coding agent makes changes on your behalf.

> **Prerequisite:** Your repository must be pushed to GitHub with a remote configured.

> **Reference:** [Delegating tasks to GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli-agents/delegate-tasks-to-cca)

#### Try it: Delegate a security fix

```
/delegate Fix the SQL injection vulnerability in sample-app/server.js by replacing the string interpolation on line 55 with a parameterized query using db.prepare().all(). Update the corresponding test in test/server.test.js to verify the fix.
```

**Expected behavior:**
1. Copilot asks to commit any unstaged changes as a checkpoint
2. Creates a new branch
3. Opens a **draft pull request** on GitHub
4. The coding agent works in the background to implement the fix
5. Copilot provides a **link to the PR and agent session** on GitHub
6. The coding agent requests your review when done

#### Alternative: Use the `&` shorthand

You can prefix any prompt with `&` to delegate it:

```
& Replace the eval() usage in sample-app/server.js with a safe math expression parser. Add input validation to reject non-numeric characters. Include test cases for valid and invalid expressions.
```

> **When to use `/delegate`:** For fixes that are well-defined and can be implemented autonomously. The coding agent works in the cloud, so you can close your terminal and come back later to review the PR. This is the **bridge between local CLI work and GitHub-based automation** — the same coding agent that powers GitHub's "Copilot coding agent" feature.

---

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Copilot CLI installed | `copilot version` returns version info |
| Authenticated | `/user` shows your GitHub username |
| `/review` works | Code review findings returned for `sample-app/server.js` |
| `/agent` works | Custom agents from Lab 1 (`code-review`, `security-analysis`) visible in agent list |
| `/fleet` works | Parallel analysis across multiple files completes |
| `/plan` works | Structured remediation plan generated without code changes |
| `/delegate` works | PR link provided on GitHub (requires repo pushed to GitHub) |

---

## Part B: GitHub Actions Workflows (25 min)

The workshop repository uses a **reusable workflow** architecture. The Copilot CLI engine lives in `.github/workflows/copilot-cli-action.yml`, while the caller workflow templates live in `.github/actions/`. To activate them, copy the caller workflows into `.github/workflows/`.

#### Copy the caller workflows into `.github/workflows/`

```bash
cp .github/actions/code-review.yml .github/workflows/code-review.yml
cp .github/actions/security-analysis.yml .github/workflows/security-analysis.yml
```

Or on Windows (PowerShell):

```powershell
Copy-Item .github\actions\code-review.yml .github\workflows\code-review.yml
Copy-Item .github\actions\security-analysis.yml .github\workflows\security-analysis.yml
```

> **Why this pattern?** The reusable workflow `copilot-cli-action.yml` contains all the Copilot CLI installation and execution logic. The caller workflows in `.github/actions/` are templates that define **what** to analyze (prompts, triggers, permissions). By copying them to `.github/workflows/`, you activate them — and you can customize the prompts without touching the underlying mechanics.

### Step 5: Review the Workflow Files

The workshop repository uses a **reusable workflow** pattern (inspired by [neildcruz/copilot-cli-automation-accelerator](https://github.com/neildcruz/copilot-cli-automation-accelerator)) that separates the Copilot CLI mechanics from the review configuration. There are three workflow files:

**`.github/workflows/copilot-cli-action.yml`** — Reusable workflow (the engine)
- Triggered via `workflow_call` by other workflows (or manually via `workflow_dispatch`)
- Encapsulates all Copilot CLI installation and execution logic
- Accepts inputs: `agent`, `user_prompt`, `node_version`, `install_dependencies`, `timeout_minutes`
- Returns output: `copilot_output` (captured stdout from the Copilot CLI run)
- Steps: Checkout → Setup Node.js → Install deps → Install Copilot CLI → Run prompt → Capture output

**`.github/actions/code-review.yml`** → copy to **`.github/workflows/code-review.yml`**
- Triggers on: `pull_request` to `main` or `develop`, manual dispatch with optional `custom_prompt`
- Permissions: `contents: read`, `pull-requests: write`
- Delegates to `copilot-cli-action.yml` with `agent: code-review` and the review prompt
- Downstream jobs: Display results in step summary, upload artifacts
- Clean and easy to customize — change the prompt without touching the underlying mechanics

**`.github/actions/security-analysis.yml`** → copy to **`.github/workflows/security-analysis.yml`**
- Triggers on: `push` to `main`, `pull_request` to `main`, weekly schedule (Sunday midnight), manual dispatch with `scan_depth`
- Permissions: `contents: read`
- Delegates to `copilot-cli-action.yml` with `agent: security-analysis` and the security prompt
- Downstream jobs: Display results, check for critical patterns (`eval()`, SQL injection, hardcoded secrets), upload artifacts

> **Key pattern:** The caller workflows use `uses: ./.github/workflows/copilot-cli-action.yml` with `secrets: inherit` to invoke the reusable workflow. This keeps each workflow focused on its purpose: **what** to analyze (caller) vs. **how** to run the CLI (reusable workflow). The templates live in `.github/actions/` — copy them to `.github/workflows/` to activate them.

### Step 6: Push the Repository to GitHub

If you haven't already, push your repository:

```bash
git init
git add .
git commit -m "Workshop: initial setup with agents, hooks, and workflows"
git remote add origin https://github.com/<your-username>/copilot-review-security-workshop.git
git push -u origin main
```

### Step 7: Create a Test Branch and PR

Create a branch with a small change to trigger the workflows:

```bash
git checkout -b feature/test-review
```

Edit `sample-app/server.js` — add a comment at the top:

```javascript
// This file needs a comprehensive code review and security analysis
```

Commit and push:

```bash
git add sample-app/server.js
git commit -m "test: trigger code review and security analysis workflows"
git push -u origin feature/test-review
```

Create a pull request:

```bash
gh pr create --title "Test: Code Review & Security Analysis" \
  --body "This PR triggers the automated code review and security analysis workflows." \
  --base main
```

### Step 8: Monitor Workflow Execution

1. Go to your repository on GitHub
2. Navigate to the **Actions** tab
3. You should see both workflows running:
   - **AI Code Review** (triggered by the PR)
   - **AI Security Analysis** (triggered by the PR)
4. Click into each workflow run to see the step summary

### Step 9: Review Workflow Output

After workflows complete:

1. Click the workflow run
2. Scroll down to the **Summary** section — this is the step summary with findings
3. Check the **Artifacts** section — download the report files
4. On the PR page, look for any annotations or warnings

### Step 10: Trigger a Manual Workflow Run

You can also trigger the security analysis manually:

```bash
gh workflow run security-analysis.yml --field scan_depth=comprehensive
```

Or from the GitHub UI:
1. Go to **Actions** → **AI Security Analysis**
2. Click **Run workflow**
3. Select scan depth: **comprehensive**
4. Click **Run workflow**

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Workflows reviewed | You understand both YAML files |
| PR created | Pull request exists on GitHub |
| Workflows triggered | Both workflows appear in the Actions tab |
| Step summary | Workflow output visible in the run summary |
| Manual dispatch | Security analysis runs with "comprehensive" depth |

---

## Expected Output

### Sample Workflow Step Summary

When the code review workflow runs, the step summary shows:

```
## 📝 AI Code Review Results

**Trigger:** pull_request
**Branch:** feature/test-review
**Reviewer:** GitHub Copilot Code Review Agent

### Findings

The code review agent would analyze the PR diff and produce findings here.
In a live environment, this step invokes `gh copilot` with the review prompt.
```

### Where Outputs Go

| Output | Location |
|--------|----------|
| Step Summary | Visible on the workflow run page in GitHub |
| Artifacts | Downloadable from the workflow run's "Artifacts" section |
| PR comments | Posted to the pull request (when `pull-requests: write` is granted) |
| Reports | Saved to `samples/findings/` as workflow artifacts |
| Logs | Available in the workflow run's step logs |

---

## Troubleshooting

### Part A: Copilot CLI Issues

| Problem | Solution |
|---------|----------|
| `copilot: command not found` | Restart your terminal. Check PATH: `npm config get prefix`. Re-install: `npm install -g @github/copilot` |
| `No authentication information found` | Run `/login` (interactive) or `copilot login` (terminal). Check env vars: `echo $COPILOT_GITHUB_TOKEN` |
| `Token (classic) rejected` | Classic PATs (`ghp_`) are not supported. Use the OAuth flow (`/login`) or a fine-grained PAT with "Copilot Requests" permission |
| `Access denied by policy` | Verify your Copilot license is active. Ask your org admin to enable Copilot CLI in org policy |
| Custom agents not found in `/agent` list | Verify `.github/agents/code-review.agent.md` and `.github/agents/security-analysis.agent.md` exist (created in Lab 1). Reload: exit and re-launch `copilot` |
| `/review` returns generic results | Check `.github/instructions/review-standards.instructions.md` exists with valid YAML frontmatter (created in Lab 1) |
| `/delegate` fails | Ensure repo is pushed to GitHub with a remote: `git remote -v`. The repo must have a remote origin |
| `/fleet` subagents fail | Ensure all referenced files exist. Try a simpler fleet prompt with fewer subtasks first |
| Node.js version error | Copilot CLI requires Node.js **22+**. Upgrade: `nvm install 22 && nvm use 22` |
| Hooks not firing during CLI session | Verify `.github/hooks/hooks.json` exists and is valid JSON. Check that hook scripts are executable (`chmod +x`) |
| Keychain unavailable (Linux) | Install `libsecret`: `sudo apt install libsecret-1-0 gnome-keyring`. Or accept plaintext storage when prompted |
| Wrong GitHub account | Type `/user switch` to switch accounts, or `/logout` then `/login` with the correct account |

> **Full auth troubleshooting:** [Troubleshooting Copilot CLI Authentication](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/troubleshoot-copilot-cli-auth)

### Part B: GitHub Actions Workflow Issues

| Problem | Solution |
|---------|----------|
| Workflows don't trigger | Ensure workflows are on the `main` branch and the PR targets `main` |
| "Permission denied" in workflow | Check the `permissions:` block in the YAML |
| Copilot CLI install fails in Actions | The workflow includes `\|\| true` to handle this gracefully |
| No step summary | Check the "Run Code Review Agent" step logs for errors |
| PR creation fails | Ensure you pushed the branch first: `git push -u origin feature/test-review` |
| Manual dispatch not available | Push workflows to the default branch first |

## Cleanup / Reset

```bash
# Delete the test branch
git checkout main
git branch -D feature/test-review
git push origin --delete feature/test-review

# Close the PR (if still open)
gh pr close <PR-NUMBER>
```

---

**Lab 2 complete!** Proceed to [Lab 3: SDK Automation →](lab-03-sdk-automation.md)
