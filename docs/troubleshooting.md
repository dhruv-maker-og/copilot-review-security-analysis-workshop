# Troubleshooting Guide

Common issues organized by workshop phase. Check the relevant section when you encounter a problem.

---

## Setup Issues

### Node.js version too old

**Symptom:** `SyntaxError: Unexpected token` or `ERR_UNSUPPORTED_DIR_IMPORT`
**Fix:** Install Node.js 20+ LTS.
```bash
node -v   # Should show v20.x or higher
```
Use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage versions:
```bash
nvm install 20
nvm use 20
```

### tsx not found

**Symptom:** `command not found: tsx` or `'tsx' is not recognized`
**Fix:**
```bash
npm install -g tsx
```
Or run via npx (no global install needed):
```bash
npx tsx --version
```

### GitHub CLI missing Copilot extension

**Symptom:** `unknown command "copilot" for "gh"`
**Fix:**
```bash
gh extension install github/gh-copilot
gh copilot --version
```

### GITHUB_TOKEN not recognized

**Symptom:** Agent starts but hangs or returns "Unauthorized"
**Fix:**
```bash
# Bash
export GITHUB_TOKEN=ghp_your_token_here

# PowerShell
$env:GITHUB_TOKEN = "ghp_your_token_here"
```
Verify:
```bash
echo $GITHUB_TOKEN   # Bash
$env:GITHUB_TOKEN    # PowerShell
```

---

## Lab 1: IDE Agent Issues

### Agent not appearing in Copilot Chat

**Symptom:** Custom agent not listed when typing `@` in Copilot Chat
**Possible causes:**
1. Agent file not in `.github/agents/` directory
2. File extension is not `.agent.md`
3. YAML frontmatter syntax error
4. VS Code not reloaded after creating the file

**Fix:**
1. Verify the file path: `.github/agents/code-review.agent.md`
2. Check YAML frontmatter syntax — must start and end with `---`
3. Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### Hooks not running

**Symptom:** Hook scripts don't execute when expected
**Possible causes:**
1. `hooks.json` not in `.github/hooks/` directory
2. JSON syntax error in `hooks.json`
3. Script not executable (Linux/macOS)
4. Script path wrong in `hooks.json`

**Fix:**
1. Validate JSON: `cat .github/hooks/hooks.json | python -m json.tool`
2. Make scripts executable: `chmod +x .github/hooks/scripts/*.sh`
3. Check event names match exactly: `sessionStart`, `postToolUse`, `agentStop`

### Skills not loading

**Symptom:** Agent doesn't use skill instructions
**Possible causes:**
1. Skill file not referenced in agent YAML frontmatter
2. Skill file path is wrong
3. Skill markdown file has syntax issues

**Fix:**
1. In the agent's `.agent.md` file, verify the `tools` array includes the skill name
2. Re-read the [agent file format reference](glossary.md)

---

## Lab 2: CLI & Workflow Issues

### gh copilot suggest returns nothing

**Symptom:** CLI hangs or returns empty response
**Fix:**
1. Check authentication: `gh auth status`
2. Re-authenticate: `gh auth login`
3. Verify Copilot access: `gh copilot --version`

### GitHub Actions workflow not triggering

**Symptom:** Workflow doesn't run on PR
**Possible causes:**
1. Workflow file not in `.github/workflows/` directory
2. YAML syntax error
3. Branch filter doesn't match

**Fix:**
1. Validate YAML: `python -m yaml < .github/workflows/code-review.yml`
2. Check the `on.pull_request.branches` filter matches your target branch
3. Trigger manually: Actions tab → Select workflow → "Run workflow"

### Workflow fails with permission error

**Symptom:** `Error: Resource not accessible by integration`
**Fix:** Ensure the workflow has the correct `permissions` block:
```yaml
permissions:
  contents: read
  pull-requests: write
```

---

## Lab 3: SDK Issues

### npm install fails

**Symptom:** Dependency resolution errors
**Fix:**
```bash
cd sdk/nodejs
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module @github/copilot-sdk"

**Symptom:** Import error when running the agent
**Fix:**
1. Ensure you're in the `sdk/nodejs/` directory
2. Run `npm install`
3. Verify: `ls node_modules/@github/copilot-sdk`

### Agent starts but hangs on first prompt

**Symptom:** Agent prints the welcome message but hangs after you type a prompt
**Possible causes:**
1. `GITHUB_TOKEN` not set or expired
2. Token doesn't have Copilot API access
3. Network/proxy issues

**Fix:**
1. Generate a new token at https://github.com/settings/tokens with `copilot` scope
2. Export it: `export GITHUB_TOKEN=ghp_new_token_here`
3. If behind a proxy, set `HTTPS_PROXY` environment variable

### TypeScript compilation errors

**Symptom:** Type errors when running `npx tsx ...`
**Fix:** tsx handles TypeScript natively — no compile step needed. If you see type errors:
1. Ensure `tsx` version is 4+: `npx tsx --version`
2. Ensure `typescript` is installed: `npm install`
3. Check `tsconfig.json` has `"skipLibCheck": true`

---

## Runner Script Issues

### Permission denied (Bash)

**Symptom:** `permission denied: ./automation/copilot-sdk-runner.sh`
**Fix:**
```bash
chmod +x automation/copilot-sdk-runner.sh
```

### Execution policy (PowerShell)

**Symptom:** `cannot be loaded because running scripts is disabled`
**Fix:**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope Process
```

### Runner can't find agent file

**Symptom:** `Error: Agent file not found`
**Fix:** Run the script from the repository root directory:
```bash
cd /path/to/copilot-review-security-workshop
./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs
```

---

## General Tips

1. **Always reload VS Code** after creating or modifying agent/skill/hook files
2. **Check file paths** — most issues come from wrong directory or filename
3. **Validate JSON/YAML** before blaming the tool
4. **Read error messages** — they usually tell you exactly what's wrong
5. **Use `--diagnose`** to verify all prerequisites: `./automation/copilot-sdk-runner.sh --diagnose`

## Getting Help

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)
- [Workshop Overview](workshop-overview.md)
- [Glossary](glossary.md)
