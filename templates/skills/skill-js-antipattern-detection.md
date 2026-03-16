---
name: 'JS Anti-Pattern Detection'
description: 'Detects JavaScript-specific anti-patterns and suggests modern ES6+ alternatives. Checks for var usage, loose equality, callback hell, missing strict mode, imperative loops, string concatenation, and prototype pollution risks.'
---

# JS Anti-Pattern Detection Skill

This skill enables a Copilot agent to detect JavaScript-specific anti-patterns that generic code review and security analysis miss.

## What This Skill Does

When invoked, the agent will:

1. **Scan the target `.js` files** for JavaScript anti-patterns
2. **Categorize findings** by severity (HIGH, MEDIUM, LOW, SUGGESTION)
3. **Provide before/after code fixes** using modern ES6+ alternatives
4. **Generate a findings table** sorted by severity

## Anti-Pattern Checklist

The agent evaluates JavaScript code against these criteria:

- [ ] `var` declarations → replace with `let` or `const`
- [ ] `==` / `!=` (loose equality) → replace with `===` / `!==`
- [ ] Callback nesting deeper than 2 levels → refactor to `async/await` or Promises
- [ ] Missing `'use strict'` directive in CommonJS modules
- [ ] `for` loops that could be `.map()`, `.filter()`, or `.reduce()`
- [ ] String concatenation (`+`) → template literals (backtick strings)
- [ ] `typeof` traps (`typeof null === 'object'`, `typeof NaN === 'number'`)
- [ ] `arguments` object usage → rest parameters (`...args`)
- [ ] Prototype pollution: `obj[userInput]` bracket notation on untrusted input

## Example Invocation

```
@code-review Scan sample-app/utils.js for JavaScript anti-patterns.
Focus on var usage, callback nesting, and modern JS alternatives.
```

## Expected Output Format

```markdown
## JS Anti-Pattern Report

### Summary
- Files scanned: 1
- Total findings: 9
- High: 1 | Medium: 3 | Low: 3 | Suggestions: 2

### Findings Table
| # | Severity | Anti-Pattern | File:Line | Modern Alternative |
|---|----------|-------------|-----------|-------------------|
| 1 | HIGH | Callback hell (4 levels deep) | utils.js:137-152 | async/await |
| 2 | MEDIUM | var declaration | utils.js:12 | const |
| 3 | LOW | for loop → .map() | utils.js:53 | Array.map() |

### Detailed Findings

#### [HIGH] Callback Hell — 4 Levels Deep
**File:** utils.js, Lines 137-152
**Description:** `fetchAndProcess` nests 4 `setTimeout` callbacks, making the code hard to read, test, and debug.
**Before:**
```js
function fetchAndProcess(url, callback) {
  setTimeout(function () {
    var data = { items: [1, 2, 3] };
    setTimeout(function () {
      var processed = data.items.map(function (x) { return x * 2; });
      setTimeout(function () {
        var formatted = processed.join(",");
        setTimeout(function () {
          callback(formatted);
        }, 100);
      }, 100);
    }, 100);
  }, 100);
}
```
**After:**
```js
async function fetchAndProcess(url) {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await delay(100);
  const data = { items: [1, 2, 3] };

  await delay(100);
  const processed = data.items.map((x) => x * 2);

  await delay(100);
  const formatted = processed.join(",");

  await delay(100);
  return formatted;
}
```
```
