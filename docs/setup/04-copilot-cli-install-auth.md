# Step 4: Copilot CLI Install and Auth

> **Time estimate:** 15 minutes
> **Instructor note:** Participants must have a GitHub Copilot license (verified in Step 1) before the CLI will work.

## Objective

Install the GitHub CLI, add the Copilot CLI extension, and authenticate.

## Steps

### 1. Install GitHub CLI

#### Windows

```powershell
winget install GitHub.cli
```

Or download from [https://cli.github.com/](https://cli.github.com/).

#### macOS

```bash
brew install gh
```

#### Linux

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora
sudo dnf install gh
```

Verify the installation:

```bash
gh --version
```

**Expected output:**
```
gh version 2.x.x (202x-xx-xx)
```

### 2. Authenticate GitHub CLI

```bash
gh auth login
```

Follow the interactive prompts:

1. **Where do you use GitHub?** → `GitHub.com`
2. **Preferred protocol** → `HTTPS`
3. **Authenticate** → `Login with a web browser`
4. Copy the one-time code shown in the terminal
5. Open the browser URL and paste the code
6. Authorize the GitHub CLI

Verify authentication:

```bash
gh auth status
```

**Expected output:**
```
github.com
  ✓ Logged in to github.com account <your-username>
  ✓ Git operations configured with HTTPS
  ✓ Token: ghp_****
  ✓ Token scopes: gist, read:org, repo, workflow, copilot
```

> **NOTE:** If the `copilot` scope is missing, re-authenticate with: `gh auth refresh -s copilot`

### 3. Install the Copilot CLI Extension

```bash
gh extension install github/gh-copilot
```

**Expected output:**
```
✓ Installed extension github/gh-copilot
```

If the extension is already installed, update it:

```bash
gh extension upgrade github/gh-copilot
```

### 4. Verify Copilot CLI

```bash
gh copilot --version
```

**Expected output:**
```
gh copilot version x.x.x (202x-xx-xx)
```

Run a quick test:

```bash
gh copilot suggest "how to list files in bash"
```

Copilot should respond with a command suggestion.

> **TIP:** If this is your first time using `gh copilot`, you may be asked to accept the terms of use.

## Expected Output

After completing this step:
- `gh --version` shows GitHub CLI 2.x+
- `gh auth status` shows you are logged in with the `copilot` scope
- `gh copilot --version` returns a version number
- `gh copilot suggest` returns a command suggestion

## Done / Not Done

| Criteria | ✅ Done | ❌ Not Done |
|----------|---------|-------------|
| GitHub CLI installed | `gh --version` returns 2.x+ | Command not found |
| Authenticated | `gh auth status` shows logged in | Not logged in |
| Copilot scope | Token scopes include `copilot` | Missing copilot scope |
| Copilot extension | `gh copilot --version` works | Extension not found |
| Test suggestion | `gh copilot suggest` returns result | Error or timeout |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `gh: command not found` | Restart terminal after installation; check PATH |
| Auth fails in browser | Try `gh auth login --with-token` using a PAT instead |
| Missing copilot scope | Run `gh auth refresh -s copilot` |
| `gh copilot` extension error | Run `gh extension upgrade github/gh-copilot` |
| "Copilot is not available" | Verify your Copilot license is active (Step 1) |
| Suggestion times out | Check internet connection; try again |

---

**Next:** [Step 5: Validation Checks →](05-validation-checks.md)
