# Step 1: Licenses and Access

> **Time estimate:** 10 minutes
> **Instructor note:** This is a verification-only step. Participants should already have licenses provisioned before the workshop.

## Objective

Confirm that you have the required GitHub Copilot license and repository access to complete the workshop.

## Prerequisites Checklist

| # | Requirement | How to Verify | Status |
|---|------------|---------------|--------|
| 1 | GitHub account (free or paid) | Sign in at [github.com](https://github.com) | ☐ Done |
| 2 | GitHub Copilot Business or Enterprise license | Check at **Settings → Copilot** — should show "Active" | ☐ Done |
| 3 | Access to the workshop repository | You can clone or view this repo without errors | ☐ Done |
| 4 | Repository write access (for PR exercises) | Check repo **Settings → Collaborators** or try creating a branch | ☐ Done |

## Steps

### 1. Verify Your GitHub Copilot License

1. Go to [https://github.com/settings/copilot](https://github.com/settings/copilot)
2. Look for the license status. You should see one of:
   - **GitHub Copilot Business** — Managed by your organization
   - **GitHub Copilot Enterprise** — Managed by your enterprise

> **NOTE:** GitHub Copilot Individual plans also work for the IDE and CLI exercises, but some features (custom agents in organizations) require Business or Enterprise.

### 2. Verify Repository Access

```bash
# Try cloning the workshop repository
git clone https://github.com/<your-org>/copilot-review-security-workshop.git
```

If you see a permission error, contact your workshop facilitator.

### 3. Create a Personal Access Token (for SDK exercises)

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)** or **Fine-grained token**
3. Required scopes:
   - `repo` — Full control of private repositories
   - `read:org` — Read organization membership
   - `copilot` — Access Copilot APIs
4. Copy the token and save it securely — you will add it to `.env` later

> **IMPORTANT:** Never share your token or commit it to version control. Store it in an environment variable or password manager.

## Expected Output

After completing this step:
- Your GitHub Copilot settings page shows an **Active** license
- You can clone and access the workshop repository
- You have a personal access token saved securely

## Done / Not Done

| Criteria | ✅ Done | ❌ Not Done |
|----------|---------|-------------|
| Copilot license active | License status shows "Active" | No license or "Inactive" |
| Repository access | Clone succeeds | Permission denied error |
| Token created | Token saved securely | No token generated |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No Copilot license" | Ask your organization admin to assign a Copilot Business seat |
| "Permission denied" on clone | Request collaborator access from the workshop facilitator |
| Token creation blocked | Your org may restrict token creation — use the org-level token settings |

---

**Next:** [Step 2: VS Code and Extensions →](02-vscode-and-extension.md)
