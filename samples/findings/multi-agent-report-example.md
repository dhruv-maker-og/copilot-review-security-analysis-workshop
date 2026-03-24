# Unified Code Analysis Report

**Generated:** 2026-03-24T10:00:00.000Z  
**Target:** sample-app/server.js  
**Language:** javascript  
**Overall Risk:** 🔴 CRITICAL

---

## Summary

| Agent | Findings |
|-------|----------|
| Code Review Sub-Agent | 4 issue(s) |
| Security Analysis Sub-Agent | 3 vulnerability(ies) |
| **Total (deduplicated)** | **7** |

## Security Vulnerabilities

### 🔴 [CRITICAL] SQL Injection — CWE-89

**Line:** 18  
**OWASP:** A03:2021 – Injection  
**Description:** User input directly interpolated into SQL query. Use parameterized queries.

```javascript
// Before (vulnerable)
const query = `SELECT * FROM users WHERE username = '${username}'`;

// After (safe)
const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
const rows = stmt.all(username);
```

### 🔴 [CRITICAL] Code Injection via eval() — CWE-95

**Line:** 25  
**OWASP:** A03:2021 – Injection  
**Description:** eval() executes arbitrary code. Replace with a safe alternative.

```javascript
// Before (vulnerable)
const result = eval(req.body.expression);

// After (safe — use a math expression parser library)
const { evaluate } = require('mathjs');
const result = evaluate(req.body.expression);
```

### 🟠 [HIGH] Hardcoded Credential — CWE-798

**Line:** 5  
**OWASP:** A02:2021 – Cryptographic Failures  
**Description:** Secret value hardcoded in source. Use environment variables or a secrets manager.

```javascript
// Before (vulnerable)
const API_KEY = 'sk-proj-abcdef123456';

// After (safe)
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY environment variable is required');
```

## Code Quality Issues

- 🟡 **[MEDIUM]** Line 31: Empty catch block — handle or rethrow the error (line 31)
- 🟢 **[LOW]** Line 3: Use 'const' or 'let' instead of 'var' (line 3)
- 🟢 **[LOW]** Line 28: Unresolved TODO/FIXME/HACK comment (line 28)
- 🟢 **[LOW]** Line 8: Debug logging left in code — remove or replace with a logger (line 8)

---

> **Note:** This is an example report showing expected output format.
> The hardcoded credential on line 5 was flagged by both sub-agents but appears
> only once here — in the Security section — because deduplication removed
> the duplicate from the Code Quality section.
