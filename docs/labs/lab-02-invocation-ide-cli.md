# Lab 2: Invocation from IDE & Copilot CLI

> **Time estimate:** 60 minutes
> **Instructor note:** Show the CLI commands live before participants try. The workflow YAML files are already in the repo — participants review and trigger them.

---

## Objective

Invoke the custom code review and security analysis agents from the **VS Code IDE** and from the **Copilot CLI** on the command line. Set up **GitHub Actions workflows** that run these agents automatically on pull requests.

## Prerequisites

- [Lab 1](lab-01-custom-agent-ide.md) completed (agent, instructions, skills, hooks created)
- GitHub CLI authenticated (`gh auth status` shows logged in with `copilot` scope)
- Repository pushed to GitHub (for workflow exercises)

---

## Part A: IDE Invocation (15 min)

### Step 1: Invoke the Agent from Copilot Chat

1. Open the **Copilot Chat** panel in VS Code (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Select the `code-review` agent by typing `@code-review`
3. Enter this prompt:

```
@code-review Perform a full code review and security analysis of the sample-app directory. 
Review both server.js and utils.js. Provide findings in a table sorted by severity.
```

4. Wait for the response. The agent should produce a structured report.

### Step 2: Review the Output

Look for:
- A summary table with finding counts by severity
- Detailed findings with file names and line numbers
- Code fix suggestions for each finding
- Both code quality and security findings

### Step 3: Use the Agent with a Specific File

Try reviewing a single file with focused instructions:

```
@code-review Focus only on security vulnerabilities in sample-app/server.js. 
For each finding, include the CWE identifier and a proof of concept.
```

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Agent responds | Structured findings returned in Chat |
| Mixed findings | Both code quality and security issues identified |
| File-specific review | Single-file review produces focused output |

---

## Part B: Copilot CLI Invocation (20 min)

### Step 4: Explain Code with Copilot CLI

Use `gh copilot explain` to understand code:

```bash
gh copilot explain "What does the /api/users/search endpoint in sample-app/server.js do, and what security issues does it have?"
```

**Expected output:** Copilot explains the endpoint's functionality and identifies the SQL injection vulnerability.

### Step 5: Suggest a Command for Security Scanning

```bash
gh copilot suggest "Run a grep command to find all uses of eval() in the sample-app directory"
```

**Expected output:** Copilot suggests a grep command like:

```bash
grep -rn "eval(" sample-app/
```

Run the suggested command to verify:

```bash
grep -rn "eval(" sample-app/
```

**Expected output:**

```
sample-app/server.js:73:    const result = eval(expression);
```

### Step 6: Suggest a Fix

```bash
gh copilot explain "How should I fix the SQL injection vulnerability at line 55 of sample-app/server.js where it uses string interpolation in a SQL query?"
```

**Expected output:** Copilot explains parameterized queries and suggests using `db.prepare("SELECT ... WHERE username = ?").all(username)`.

### Step 7: Run the Full Agent via CLI (if available)

> **NOTE:** The exact CLI syntax for running full agents may vary based on your Copilot CLI version. Check `gh copilot --help` for available commands.

```bash
# Review code using Copilot CLI
gh copilot suggest "Write a shell command that scans sample-app/ for hardcoded passwords, API keys, and uses of eval()"
```

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Explain works | `gh copilot explain` returns analysis |
| Suggest works | `gh copilot suggest` returns a command |
| Grep finds eval | `grep -rn "eval(" sample-app/` shows server.js:73 |

---

## Part C: GitHub Actions Workflows (25 min)

The workshop repository includes two GitHub Actions workflows that automate code review and security analysis on pull requests.

### Step 8: Review the Workflow Files

Open and examine the two workflow files:

**`.github/workflows/code-review.yml`**
- Triggers on: `pull_request` to `main` or `develop`
- Permissions: `contents: read`, `pull-requests: write`
- Steps: Checkout → Setup Node.js → Install deps → Install Copilot CLI → Run Review → Upload artifacts
- Output: Results posted to GitHub Step Summary

**`.github/workflows/security-analysis.yml`**
- Triggers on: `push` to `main`, `pull_request` to `main`, weekly schedule (Sunday midnight), manual dispatch
- Permissions: `contents: read`
- Steps: Checkout → Setup Node.js → Install deps → Install Copilot CLI → Run Security Scan → Check for Critical → Upload artifacts
- Extra: Checks for critical findings patterns and adds a warning annotation

### Step 9: Push the Repository to GitHub

If you haven't already, push your repository:

```bash
git init
git add .
git commit -m "Workshop: initial setup with agents, hooks, and workflows"
git remote add origin https://github.com/<your-username>/copilot-review-security-workshop.git
git push -u origin main
```

### Step 10: Create a Test Branch and PR

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

### Step 11: Monitor Workflow Execution

1. Go to your repository on GitHub
2. Navigate to the **Actions** tab
3. You should see both workflows running:
   - **AI Code Review** (triggered by the PR)
   - **AI Security Analysis** (triggered by the PR)
4. Click into each workflow run to see the step summary

### Step 12: Review Workflow Output

After workflows complete:

1. Click the workflow run
2. Scroll down to the **Summary** section — this is the step summary with findings
3. Check the **Artifacts** section — download the report files
4. On the PR page, look for any annotations or warnings

### Step 13: Trigger a Manual Workflow Run

You can also trigger the security analysis manually:

```bash
gh workflow run security-analysis.yml --field scan_depth=comprehensive
```

Or from the GitHub UI:
1. Go to **Actions** → **AI Security Analysis**
2. Click **Run workflow**
3. Select scan depth: **comprehensive**
4. Click **Run workflow**

### ✅ Checkpoint C

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

| Problem | Solution |
|---------|----------|
| Workflows don't trigger | Ensure workflows are on the `main` branch and the PR targets `main` |
| "Permission denied" in workflow | Check the `permissions:` block in the YAML |
| Copilot CLI install fails in Actions | The workflow includes `|| true` to handle this gracefully |
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
