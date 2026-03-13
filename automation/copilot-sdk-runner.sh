#!/usr/bin/env bash
# ============================================================================
# Copilot SDK Runner — Bash
#
# Dispatches to the correct Copilot SDK agent based on --usecase and --lang.
#
# Usage:
#   ./copilot-sdk-runner.sh --usecase code-review --lang nodejs
#   ./copilot-sdk-runner.sh --usecase security-analysis --lang nodejs
#   ./copilot-sdk-runner.sh --list
#   ./copilot-sdk-runner.sh --diagnose
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

usage() {
  cat <<EOF
Copilot SDK Runner

Usage:
  $(basename "$0") --usecase <name> --lang <lang>
  $(basename "$0") --list
  $(basename "$0") --diagnose
  $(basename "$0") --help

Options:
  --usecase <name>   Use case to run (code-review, security-analysis)
  --lang <lang>      Language runtime (nodejs)
  --list             List available use cases
  --diagnose         Check prerequisites
  --help             Show this help message
EOF
}

list_usecases() {
  cat <<EOF
Available use cases:
  code-review         Code Review Agent — analyzes code quality and style
  security-analysis   Security Analysis Agent — scans for OWASP Top 10 vulnerabilities

Supported languages: nodejs

Example:
  ./automation/copilot-sdk-runner.sh --usecase code-review --lang nodejs
EOF
}

check_cmd() {
  local name="$1"
  if command -v "$name" &>/dev/null; then
    local version
    version=$("$name" --version 2>/dev/null | head -1)
    printf "  %-14s ${GREEN}✅${NC} %s\n" "$name:" "$version"
    return 0
  else
    printf "  %-14s ${RED}❌ Not found${NC}\n" "$name:"
    return 1
  fi
}

diagnose() {
  echo "=== Copilot SDK Runner Diagnostics ==="
  echo ""

  local ok=true

  check_cmd "node" || ok=false
  check_cmd "npm"  || ok=false
  check_cmd "npx"  || ok=false
  check_cmd "git"  || ok=false

  # tsx (may be local)
  if npx tsx --version &>/dev/null; then
    local tsx_ver
    tsx_ver=$(npx tsx --version 2>/dev/null | head -1)
    printf "  %-14s ${GREEN}✅${NC} %s\n" "tsx:" "$tsx_ver"
  else
    printf "  %-14s ${RED}❌ Not found${NC}\n" "tsx:"
    ok=false
  fi

  # GITHUB_TOKEN
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    printf "  %-14s ${GREEN}✅ Set${NC}\n" "GITHUB_TOKEN:"
  else
    printf "  %-14s ${RED}❌ Not set${NC}\n" "GITHUB_TOKEN:"
    ok=false
  fi

  echo ""
  if [ "$ok" = true ]; then
    echo -e "${GREEN}All checks passed. Ready to run.${NC}"
  else
    echo -e "${RED}Some checks failed. Fix the issues above before running.${NC}"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------

USECASE=""
LANG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --usecase)
      USECASE="$2"
      shift 2
      ;;
    --lang)
      LANG="$2"
      shift 2
      ;;
    --list)
      list_usecases
      exit 0
      ;;
    --diagnose)
      diagnose
      exit 0
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown argument '$1'${NC}"
      usage
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Validate
# ---------------------------------------------------------------------------

if [ -z "$USECASE" ] || [ -z "$LANG" ]; then
  echo -e "${RED}Error: --usecase and --lang are required.${NC}"
  echo ""
  usage
  exit 1
fi

if [ "$LANG" != "nodejs" ]; then
  echo -e "${RED}Error: Unsupported language '$LANG'. Supported: nodejs${NC}"
  exit 1
fi

# Map use case to agent file
case "$USECASE" in
  code-review)
    AGENT_FILE="code-review-agent.ts"
    ;;
  security-analysis)
    AGENT_FILE="security-analysis-agent.ts"
    ;;
  *)
    echo -e "${RED}Error: Unknown use case '$USECASE'.${NC}"
    echo "Run with --list to see available use cases."
    exit 1
    ;;
esac

SDK_DIR="$REPO_ROOT/sdk/nodejs"

if [ ! -f "$SDK_DIR/$AGENT_FILE" ]; then
  echo -e "${RED}Error: Agent file not found: $SDK_DIR/$AGENT_FILE${NC}"
  exit 1
fi

# Check GITHUB_TOKEN
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo -e "${YELLOW}Warning: GITHUB_TOKEN is not set. The agent may fail to authenticate.${NC}"
  echo "Set it with: export GITHUB_TOKEN=ghp_..."
fi

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

echo "=== Copilot SDK Runner ==="
echo "  Use case:  $USECASE"
echo "  Language:  $LANG"
echo "  Agent:     $AGENT_FILE"
echo ""

# Install dependencies if needed
if [ ! -d "$SDK_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  (cd "$SDK_DIR" && npm install)
  echo ""
fi

# Run the agent
echo "Launching agent..."
echo ""
cd "$SDK_DIR"
exec npx tsx "$AGENT_FILE"
