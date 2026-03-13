<#
.SYNOPSIS
    Copilot SDK Runner — PowerShell

.DESCRIPTION
    Dispatches to the correct Copilot SDK agent based on -Usecase and -Lang.

.EXAMPLE
    .\copilot-sdk-runner.ps1 -Usecase code-review -Lang nodejs
    .\copilot-sdk-runner.ps1 -Usecase security-analysis -Lang nodejs
    .\copilot-sdk-runner.ps1 -List
    .\copilot-sdk-runner.ps1 -Diagnose
#>

param(
    [string]$Usecase,
    [string]$Lang,
    [switch]$List,
    [switch]$Diagnose,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Show-Usage {
    Write-Host @"
Copilot SDK Runner (PowerShell)

Usage:
  .\copilot-sdk-runner.ps1 -Usecase <name> -Lang <lang>
  .\copilot-sdk-runner.ps1 -List
  .\copilot-sdk-runner.ps1 -Diagnose
  .\copilot-sdk-runner.ps1 -Help

Parameters:
  -Usecase <name>   Use case to run (code-review, security-analysis)
  -Lang <lang>      Language runtime (nodejs)
  -List             List available use cases
  -Diagnose         Check prerequisites
  -Help             Show this help message
"@
}

function Show-Usecases {
    Write-Host @"
Available use cases:
  code-review         Code Review Agent - analyzes code quality and style
  security-analysis   Security Analysis Agent - scans for OWASP Top 10 vulnerabilities

Supported languages: nodejs

Example:
  .\automation\copilot-sdk-runner.ps1 -Usecase code-review -Lang nodejs
"@
}

function Test-Command {
    param([string]$Name)
    try {
        $cmd = Get-Command $Name -ErrorAction SilentlyContinue
        if ($cmd) {
            $ver = & $Name --version 2>&1 | Select-Object -First 1
            Write-Host ("  {0,-14} " -f "${Name}:") -NoNewline
            Write-Host "OK" -ForegroundColor Green -NoNewline
            Write-Host " $ver"
            return $true
        }
    } catch { }
    Write-Host ("  {0,-14} " -f "${Name}:") -NoNewline
    Write-Host "NOT FOUND" -ForegroundColor Red
    return $false
}

function Invoke-Diagnose {
    Write-Host "=== Copilot SDK Runner Diagnostics ==="
    Write-Host ""

    $ok = $true
    if (-not (Test-Command "node")) { $ok = $false }
    if (-not (Test-Command "npm"))  { $ok = $false }
    if (-not (Test-Command "npx"))  { $ok = $false }
    if (-not (Test-Command "git"))  { $ok = $false }

    # tsx
    try {
        $tsxVer = & npx tsx --version 2>&1 | Select-Object -First 1
        Write-Host ("  {0,-14} " -f "tsx:") -NoNewline
        Write-Host "OK" -ForegroundColor Green -NoNewline
        Write-Host " $tsxVer"
    } catch {
        Write-Host ("  {0,-14} " -f "tsx:") -NoNewline
        Write-Host "NOT FOUND" -ForegroundColor Red
        $ok = $false
    }

    # GITHUB_TOKEN
    Write-Host ("  {0,-14} " -f "GITHUB_TOKEN:") -NoNewline
    if ($env:GITHUB_TOKEN) {
        Write-Host "Set" -ForegroundColor Green
    } else {
        Write-Host "NOT SET" -ForegroundColor Red
        $ok = $false
    }

    Write-Host ""
    if ($ok) {
        Write-Host "All checks passed. Ready to run." -ForegroundColor Green
    } else {
        Write-Host "Some checks failed. Fix the issues above before running." -ForegroundColor Red
        exit 1
    }
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

if ($Help) {
    Show-Usage
    exit 0
}

if ($List) {
    Show-Usecases
    exit 0
}

if ($Diagnose) {
    Invoke-Diagnose
    exit 0
}

if (-not $Usecase -or -not $Lang) {
    Write-Host "Error: -Usecase and -Lang are required." -ForegroundColor Red
    Write-Host ""
    Show-Usage
    exit 1
}

if ($Lang -ne "nodejs") {
    Write-Host "Error: Unsupported language '$Lang'. Supported: nodejs" -ForegroundColor Red
    exit 1
}

$AgentFile = switch ($Usecase) {
    "code-review"       { "code-review-agent.ts" }
    "security-analysis" { "security-analysis-agent.ts" }
    default {
        Write-Host "Error: Unknown use case '$Usecase'." -ForegroundColor Red
        Write-Host "Run with -List to see available use cases."
        exit 1
    }
}

$SdkDir = Join-Path $RepoRoot "sdk" "nodejs"
$AgentPath = Join-Path $SdkDir $AgentFile

if (-not (Test-Path $AgentPath)) {
    Write-Host "Error: Agent file not found: $AgentPath" -ForegroundColor Red
    exit 1
}

# Check GITHUB_TOKEN
if (-not $env:GITHUB_TOKEN) {
    Write-Host "Warning: GITHUB_TOKEN is not set. The agent may fail to authenticate." -ForegroundColor Yellow
    Write-Host 'Set it with: $env:GITHUB_TOKEN = "ghp_..."'
}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

Write-Host "=== Copilot SDK Runner ==="
Write-Host "  Use case:  $Usecase"
Write-Host "  Language:  $Lang"
Write-Host "  Agent:     $AgentFile"
Write-Host ""

# Install dependencies if needed
$NodeModules = Join-Path $SdkDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "Installing dependencies..."
    Push-Location $SdkDir
    npm install
    Pop-Location
    Write-Host ""
}

# Run the agent
Write-Host "Launching agent..."
Write-Host ""
Push-Location $SdkDir
& npx tsx $AgentFile
Pop-Location
