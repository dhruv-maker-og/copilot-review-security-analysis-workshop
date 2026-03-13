---
name: 'Code Review'
description: 'Performs comprehensive code quality review: naming, structure, error handling, duplication, and maintainability. Produces actionable findings with severity levels and fix suggestions.'
---

# Code Review Skill

This skill enables a Copilot agent to perform structured code reviews against established quality criteria.

## What This Skill Does

When invoked, the agent will:

1. **Scan the target files** for code quality issues
2. **Categorize findings** by severity (Critical, High, Medium, Low, Suggestion)
3. **Provide actionable recommendations** with concrete code fixes
4. **Generate a summary report** with an overall quality score

## Review Checklist

The agent evaluates code against these criteria:

- [ ] Function and variable naming follows conventions
- [ ] Functions have a single responsibility
- [ ] No duplicated logic (DRY violations)
- [ ] Magic numbers are replaced with named constants
- [ ] Error handling covers edge cases
- [ ] No debug logging left in code (console.log, print statements)
- [ ] No TODO/FIXME comments that should be tracked as issues
- [ ] Callback nesting is kept to a reasonable depth
- [ ] Input validation is present at API boundaries

## Example Invocation

```
@code-review Review the file sample-app/server.js for code quality issues.
Focus on naming, structure, error handling, and maintainability.
```

## Expected Output Format

```markdown
## Code Review Report

### Summary
- Files reviewed: 2
- Total findings: 8
- Critical: 0 | High: 2 | Medium: 3 | Low: 2 | Suggestions: 1

### Findings

#### [HIGH] Duplicated validation logic
**File:** utils.js, Lines 93-118
**Description:** The same null/undefined/empty check is repeated in getUserById, getProductById, and getOrderById.
**Recommendation:** Extract into a shared `validateId()` function.
```
