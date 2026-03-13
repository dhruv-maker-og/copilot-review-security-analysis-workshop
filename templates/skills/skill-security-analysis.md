---
name: 'Security Analysis'
description: 'Scans code for security vulnerabilities based on OWASP Top 10, identifies hardcoded secrets, injection flaws, and insecure patterns. Produces a security report with CWE references and remediation steps.'
---

# Security Analysis Skill

This skill enables a Copilot agent to perform security-focused code analysis following industry standards.

## What This Skill Does

When invoked, the agent will:

1. **Scan for OWASP Top 10 vulnerabilities** in the target files
2. **Identify hardcoded secrets** (API keys, passwords, tokens)
3. **Detect injection vulnerabilities** (SQL, command, XSS)
4. **Check cryptographic practices** (weak hashing, insecure algorithms)
5. **Produce a security report** with CWE references and remediation steps

## Security Checklist

The agent evaluates code against these security criteria:

- [ ] No hardcoded credentials, API keys, or tokens (CWE-798)
- [ ] No SQL injection via string concatenation (CWE-89)
- [ ] No command injection via eval/exec (CWE-95)
- [ ] No use of weak cryptographic hashing for passwords (CWE-328)
- [ ] User input is sanitized before use in HTML output (CWE-79)
- [ ] Error messages do not expose internal details (CWE-209)
- [ ] Secrets are not logged to stdout/stderr (CWE-532)
- [ ] Input validation is present at all external boundaries

## Example Invocation

```
@security-review Scan sample-app/server.js for security vulnerabilities.
Check for OWASP Top 10 issues, hardcoded secrets, and injection flaws.
```

## Expected Output Format

```markdown
## Security Analysis Report

### Executive Summary
- Files scanned: 2
- Total vulnerabilities: 5
- Critical: 2 | High: 2 | Medium: 1 | Low: 0

### Findings

#### [CRITICAL] SQL Injection — CWE-89
**File:** server.js, Line 55
**Description:** User input is directly interpolated into a SQL query string.
**Proof of Concept:** A request to `/api/users/search?username=' OR '1'='1` would return all users.
**Remediation:** Use parameterized queries with prepared statements.

```js
// Before (vulnerable)
const query = `SELECT * FROM users WHERE username = '${username}'`;

// After (safe)
const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
const rows = stmt.all(username);
```
```
