#!/bin/bash
# =============================================================
# log-context.sh — Copilot Hook Script (sessionStart)
# =============================================================
# Runs when a Copilot agent session starts.
# Purpose: Log the session context as structured JSON for debugging.
#
# This hook:
#   1. Reads the JSON context provided by the hook system via stdin
#   2. Writes a structured log entry with timestamp and working directory
#   3. Creates the log directory if needed
#
# Hook context is passed via stdin as JSON.
# Exit 0 = allow the session to proceed.
# =============================================================
set -euo pipefail

# Read the full JSON context from stdin
INPUT=$(cat)

# Create logs directory
mkdir -p logs/copilot

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CWD=$(pwd)

# Write structured log entry
# Note: We intentionally do NOT log the full INPUT to avoid
# accidentally capturing sensitive data. We log metadata only.
LOG_ENTRY=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "event": "sessionStart",
  "cwd": "$CWD",
  "user": "${USER:-unknown}",
  "nodeVersion": "$(node -v 2>/dev/null || echo 'not-found')",
  "inputReceived": true
}
EOF
)

echo "$LOG_ENTRY" >> logs/copilot/session.log

echo "📝 Session context logged to logs/copilot/session.log"
exit 0
