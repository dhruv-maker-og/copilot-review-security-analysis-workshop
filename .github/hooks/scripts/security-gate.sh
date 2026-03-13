#!/bin/bash
# =============================================================
# security-gate.sh — Copilot Hook Script (agentStop)
# =============================================================
# Runs when the Copilot agent finishes responding.
# Purpose: Check for CRITICAL severity findings and block if found.
#
# This hook:
#   1. Reads the latest findings report
#   2. Scans for CRITICAL severity patterns
#   3. Exits non-zero to block if critical findings are detected
#   4. Logs the gate decision for audit
#
# Hook context is passed via stdin as JSON.
# Exit 0 = allow (no critical findings).
# Exit non-zero = block (critical findings detected).
# =============================================================
set -euo pipefail

# Read hook context from stdin
INPUT=$(cat)

mkdir -p logs/copilot
mkdir -p samples/findings

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REPORT_FILE="samples/findings/report.md"
GATE_LOG="logs/copilot/security-gate.log"

# --- Check for critical findings in the report ---
CRITICAL_COUNT=0

if [ -f "$REPORT_FILE" ]; then
  # Count lines containing CRITICAL (case-insensitive)
  CRITICAL_COUNT=$(grep -ci "CRITICAL" "$REPORT_FILE" 2>/dev/null || echo "0")
fi

# Also scan source files for known critical patterns
EVAL_COUNT=$(grep -rn "eval(" sample-app/ 2>/dev/null | wc -l || echo "0")
SQL_INJECT_COUNT=$(grep -rn '`.*\${' sample-app/ 2>/dev/null | grep -i "select\|insert\|update\|delete" | wc -l || echo "0")

TOTAL_CRITICAL=$((CRITICAL_COUNT + EVAL_COUNT + SQL_INJECT_COUNT))

# --- Log the gate decision ---
GATE_RESULT="PASS"
if [ "$TOTAL_CRITICAL" -gt 0 ]; then
  GATE_RESULT="FAIL"
fi

echo "{\"timestamp\":\"$TIMESTAMP\",\"event\":\"agentStop\",\"gate\":\"security\",\"result\":\"$GATE_RESULT\",\"criticalFindings\":$TOTAL_CRITICAL,\"reportCritical\":$CRITICAL_COUNT,\"evalUsage\":$EVAL_COUNT,\"sqlInjection\":$SQL_INJECT_COUNT}" >> "$GATE_LOG"

# --- Append gate result to report ---
if [ -f "$REPORT_FILE" ]; then
  echo "---" >> "$REPORT_FILE"
  echo "### Security Gate — $TIMESTAMP" >> "$REPORT_FILE"
  echo "- **Result:** $GATE_RESULT" >> "$REPORT_FILE"
  echo "- Critical findings in report: $CRITICAL_COUNT" >> "$REPORT_FILE"
  echo "- eval() usage detected: $EVAL_COUNT" >> "$REPORT_FILE"
  echo "- SQL injection patterns: $SQL_INJECT_COUNT" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# --- Gate decision ---
if [ "$TOTAL_CRITICAL" -gt 0 ]; then
  echo "🚨 SECURITY GATE FAILED: $TOTAL_CRITICAL critical finding(s) detected."
  echo "   Review the security report at: $REPORT_FILE"
  echo "   Fix all CRITICAL issues before proceeding."
  # Exit non-zero to block the action
  exit 1
else
  echo "✅ Security gate passed: No critical findings detected."
  exit 0
fi
