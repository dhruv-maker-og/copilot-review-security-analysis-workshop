# Step 5: Validation Checks

> **Time estimate:** 10 minutes
> **Instructor note:** This is the final checkpoint before exercises begin. All items must be green.

## Objective

Run a consolidated validation to confirm every prerequisite is met and you are ready for the workshop exercises.

## Consolidated Checklist

Run each command below and verify the output matches the expected result.

| # | Check | Command | Expected Result | Status |
|---|-------|---------|----------------|--------|
| 1 | VS Code | `code --version` | 1.90+ | ☐ |
| 2 | Node.js | `node -v` | v20+ | ☐ |
| 3 | npm | `npm -v` | v10+ | ☐ |
| 4 | tsx | `tsx --version` | v4+ | ☐ |
| 5 | GitHub CLI | `gh --version` | 2.x+ | ☐ |
| 6 | GH auth | `gh auth status` | Logged in with `copilot` scope | ☐ |
| 7 | Copilot CLI | `gh copilot --version` | Version returned | ☐ |
| 8 | Git | `git --version` | 2.x+ | ☐ |

## Automated Validation Script

Copy and run this script to check all prerequisites at once:

### Bash (macOS / Linux)

```bash
#!/bin/bash
set -euo pipefail

echo "=== Workshop Validation Checks ==="
echo ""

PASS=0
FAIL=0

check() {
  local name="$1"
  local cmd="$2"
  local expected="$3"

  if result=$(eval "$cmd" 2>/dev/null); then
    echo "✅ $name: $result"
    PASS=$((PASS + 1))
  else
    echo "❌ $name: FAILED (expected: $expected)"
    FAIL=$((FAIL + 1))
  fi
}

check "VS Code"      "code --version | head -1"            "1.90+"
check "Node.js"      "node -v"                              "v20+"
check "npm"          "npm -v"                               "v10+"
check "tsx"          "tsx --version"                         "v4+"
check "GitHub CLI"   "gh --version | head -1"               "2.x+"
check "GH Auth"      "gh auth status 2>&1 | head -1"       "Logged in"
check "Copilot CLI"  "gh copilot --version 2>&1 | head -1"  "version x.x.x"
check "Git"          "git --version"                        "2.x+"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  echo "⚠️  Some checks failed. Review the setup guides before continuing."
  exit 1
else
  echo "🎉 All checks passed! You are ready for the workshop."
fi
```

### PowerShell (Windows)

```powershell
Write-Host "=== Workshop Validation Checks ===" -ForegroundColor Cyan
Write-Host ""

$pass = 0
$fail = 0

function Test-Command {
    param($Name, $Command, $Expected)
    try {
        $result = Invoke-Expression $Command 2>$null
        if ($result) {
            Write-Host "✅ ${Name}: $($result | Select-Object -First 1)" -ForegroundColor Green
            $script:pass++
        } else { throw "empty" }
    } catch {
        Write-Host "❌ ${Name}: FAILED (expected: $Expected)" -ForegroundColor Red
        $script:fail++
    }
}

Test-Command "VS Code"      "code --version | Select-Object -First 1"            "1.90+"
Test-Command "Node.js"      "node -v"                                            "v20+"
Test-Command "npm"          "npm -v"                                             "v10+"
Test-Command "tsx"          "tsx --version"                                       "v4+"
Test-Command "GitHub CLI"   "gh --version | Select-Object -First 1"              "2.x+"
Test-Command "GH Auth"      "gh auth status 2>&1 | Select-Object -First 1"       "Logged in"
Test-Command "Copilot CLI"  "gh copilot --version 2>&1 | Select-Object -First 1" "version x.x.x"
Test-Command "Git"          "git --version"                                      "2.x+"

Write-Host ""
Write-Host "=== Results: $pass passed, $fail failed ===" -ForegroundColor Cyan

if ($fail -gt 0) {
    Write-Host "⚠️  Some checks failed. Review the setup guides before continuing." -ForegroundColor Yellow
} else {
    Write-Host "🎉 All checks passed! You are ready for the workshop." -ForegroundColor Green
}
```

## VS Code Extension Check

In VS Code, also verify these extensions are installed:

1. Open the **Extensions** panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Confirm these are installed and enabled:
   - ✅ **GitHub Copilot** (by GitHub)
   - ✅ **GitHub Copilot Chat** (by GitHub)
3. Look at the **status bar** (bottom-right) — the Copilot icon should be active (no strike-through)

## Workshop Repository Check

```bash
# Navigate to the workshop directory
cd copilot-review-security-workshop

# Verify the directory structure exists
ls docs/labs/
# Expected: lab-01-custom-agent-ide.md  lab-02-invocation-ide-cli.md  lab-03-sdk-automation.md

ls sample-app/
# Expected: package.json  server.js  utils.js  test/

ls sdk/nodejs/
# Expected: package.json  tsconfig.json  code-review-agent.ts  security-analysis-agent.ts  README.md
```

## Done / Not Done

| Criteria | ✅ Done | ❌ Not Done |
|----------|---------|-------------|
| All 8 CLI checks pass | Validation script shows "All checks passed" | One or more checks failed |
| VS Code extensions | Copilot + Copilot Chat installed and active | Extensions missing |
| Repo cloned | Workshop directory exists with expected files | Directory missing |

> **IMPORTANT:** Do not proceed to the exercises until all checks pass. Refer to the individual setup guides (Steps 1–4) or the [Troubleshooting Guide](../troubleshooting.md) for help.

---

**Setup complete!** Proceed to [Exercise 1: Custom Agent & Skills on IDE →](../labs/lab-01-custom-agent-ide.md)
