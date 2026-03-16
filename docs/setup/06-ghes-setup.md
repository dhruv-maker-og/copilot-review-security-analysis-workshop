# Step 6: GitHub Enterprise Server (GHES) Setup

> **Audience:** This step is only required if you are running the workshop on a **GitHub Enterprise Server (GHES)** instance instead of GitHub.com.
> **Time estimate:** 15 minutes
> **Instructor note:** Complete this step after Steps 1–5. All standard setup steps apply, but the changes below are required for GHES environments.

---

## 1. GHES Version Requirement

**GHES 3.12 or later** is required. GitHub Copilot support (including Copilot Chat, custom agents, and the Copilot CLI) requires this minimum version.

Verify with your GHES admin before starting the workshop.

---

## 2. Admin Setup (pre-workshop)

The following must be configured by a **GHES site administrator** before participants arrive:

| Task | Where |
|------|--------|
| Enable GitHub Copilot in the enterprise | GHES Admin Console → **Policies → Copilot** |
| Assign Copilot Business/Enterprise seats to participants | Org Settings → **Copilot → Seat Management** |
| Ensure GHES has outbound access to `api.githubcopilot.com` and `copilot-proxy.githubusercontent.com` (or configure a proxy) | Network/Firewall settings |

> **NOTE:** Without network access to the Copilot endpoints above, inline suggestions and Copilot Chat will not function even with a valid license.

---

## 3. GitHub CLI Authentication (replaces Step 4)

Instead of `gh auth login` defaulting to GitHub.com, specify the GHES hostname:

```bash
gh auth login --hostname your-ghes.company.com
```

Follow the interactive prompts as normal (HTTPS → Login with a web browser).

For all subsequent `gh` commands, either pass `--hostname` or export the environment variable:

```bash
export GH_HOST=your-ghes.company.com
```

Verify:

```bash
gh auth status
```

**Expected output:**
```
your-ghes.company.com
  ✓ Logged in to your-ghes.company.com account <your-username>
  ✓ Token scopes: gist, read:org, repo, workflow, copilot
```

> **NOTE:** If the `copilot` scope is missing, re-authenticate:
> ```bash
> gh auth refresh --hostname your-ghes.company.com -s copilot
> ```

---

## 4. VS Code Copilot Extension (replaces Step 2 auth)

After installing the GitHub Copilot and GitHub Copilot Chat extensions (Step 2), configure VS Code to use your GHES instance:

1. Open VS Code **Settings** (`Ctrl+,` / `Cmd+,`)
2. Search for `githubEnterprise`
3. Set **GitHub Enterprise URI** to `https://your-ghes.company.com`

Or add to `settings.json` directly:

```json
{
  "github.copilot.advanced": {
    "githubEnterprise.uri": "https://your-ghes.company.com"
  }
}
```

4. Sign in to VS Code using your **GHES account** (not your GitHub.com account):
   - Click the Accounts icon in the bottom-left activity bar
   - Select **Sign in with GitHub Enterprise**
   - Enter `https://your-ghes.company.com` when prompted

---

## 5. Personal Access Tokens (replaces Step 1 token creation)

Create your PAT on the **GHES instance**, not GitHub.com:

```
https://your-ghes.company.com/settings/tokens
```

Required scopes are the same as Step 1:
- `repo` — Full control of private repositories
- `read:org` — Read organization membership
- `copilot` — Access Copilot APIs

---

## 6. SDK Exercise — `.env` Changes

Update your `.env` file (copied from `.env.example`) with GHES-specific values:

```env
GITHUB_TOKEN=<your-ghes-pat>
GITHUB_API_URL=https://your-ghes.company.com/api/v3
COPILOT_API_URL=https://your-ghes.company.com/api/v3/copilot
```

Replace `your-ghes.company.com` with your actual GHES hostname.

---

## 7. GitHub Actions Workflows (Exercise 2)

Workflows in `.github/workflows/` run on GHES-managed runners. Ensure:

- **Self-hosted runners** are registered and online for the repository/org, **or** GitHub-hosted runners are enabled on your GHES instance (available from GHES 3.9+)
- `GITHUB_TOKEN` workflow secrets are automatically scoped to the GHES instance — no changes needed in the workflow files
- The `pull_request` trigger (`branches: [main, develop]`) works identically on GHES — no changes required

---

## Quick Summary

| Component | GitHub.com | GHES Change Needed |
|-----------|------------|-------------------|
| CLI auth | `gh auth login` | Add `--hostname your-ghes.company.com` |
| PAT creation | `github.com/settings/tokens` | `your-ghes.company.com/settings/tokens` |
| VS Code sign-in | GitHub.com account | GHES account + `githubEnterprise.uri` setting |
| Copilot availability | Managed via github.com | Must be enabled by GHES admin (see Section 2) |
| Actions runners | GitHub-hosted | Self-hosted or GHES-hosted runners |
| SDK `.env` API URL | Default `api.github.com` | Set to GHES API endpoint in `.env` |

> The core workshop content — exercises, custom agents, skills, hooks, and workflows — works identically on GHES. Only **authentication endpoints and network routing** differ.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Copilot is not available" in VS Code | Verify GHES admin has enabled Copilot and assigned your seat (Section 2) |
| `gh auth login` goes to github.com | Use `gh auth login --hostname your-ghes.company.com` |
| Missing `copilot` scope | Run `gh auth refresh --hostname your-ghes.company.com -s copilot` |
| VS Code won't sign in to GHES | Confirm `githubEnterprise.uri` is set correctly in VS Code settings |
| SDK errors on API calls | Check `GITHUB_API_URL` and `COPILOT_API_URL` in `.env` point to your GHES hostname |
| Actions workflows fail | Ensure self-hosted runner is online and registered; check runner labels match the workflow `runs-on` value |

---

**Back to:** [Step 5: Validation Checks](05-validation-checks.md)
