# Automation Runner Scripts

Cross-platform scripts to launch Copilot SDK agents from the command line.

## Files

| File | Platform | Description |
|------|----------|-------------|
| `copilot-sdk-runner.sh` | Bash (macOS, Linux, Git Bash) | Shell dispatcher for SDK agents |
| `copilot-sdk-runner.ps1` | PowerShell (Windows) | PowerShell dispatcher for SDK agents |

## Usage

### List available use cases

```bash
./automation/copilot-sdk-runner.sh --list
```

```powershell
.\automation\copilot-sdk-runner.ps1 -List
```

### Run an agent

```bash
# Code review
./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs

# Security analysis
./automation/copilot-sdk-runner.sh --usecase security-analysis --lang nodejs
```

```powershell
# Code review
.\automation\copilot-sdk-runner.ps1 -Usecase code-review -Lang nodejs

# Security analysis
.\automation\copilot-sdk-runner.ps1 -Usecase security-analysis -Lang nodejs
```

### Check prerequisites

```bash
./automation/copilot-sdk-runner.sh --diagnose
```

```powershell
.\automation\copilot-sdk-runner.ps1 -Diagnose
```

## What the Runner Does

1. Validates arguments (`--usecase`, `--lang`)
2. Checks that `GITHUB_TOKEN` is set
3. Resolves the correct agent file in `sdk/<lang>/`
4. Runs `npm install` if `node_modules/` is missing
5. Launches the agent with `npx tsx <agent>.ts`

## Related

- [SDK Agents](../sdk/nodejs/README.md) — Agent source code and documentation
- [Lab 3](../docs/labs/lab-03-sdk-automation.md) — Step-by-step lab exercise
