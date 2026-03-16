# Lab 1: Custom Instructions, Agent & Skills on IDE

> **Time estimate:** 90 minutes
> **Instructor note:** Demo the first 10 minutes (creating an instructions file, showing how it affects Copilot behavior). Then let participants work hands-on. Walk the room during Part D (hooks) — participants will use the Copilot coding agent to create hook scripts, which may require help with prompt iteration and troubleshooting generated code.

---

## Objective

Set up project-level **custom instructions**, then build a custom **Code Review Agent** in VS Code, and optionally add **skills** and **GitHub Copilot hooks**. By the end, you'll have Copilot enforcing your code review and security standards across your project.

## Prerequisites

- All [setup steps](../setup/05-validation-checks.md) completed and validated
- Workshop repository cloned and open in VS Code
- Copilot Chat panel accessible (`Ctrl+Shift+I` / `Cmd+Shift+I`)

---

## When to Use What — Practical Guidance

Before building, understand what each construct does and when it's worth creating:

| Construct | What it does | When to create it | Impact |
|-----------|-------------|-------------------|--------|
| **Instructions** (`.instructions.md`) | Defines project-wide standards applied **automatically** to matching files via `applyTo` | **Always** — highest value, lowest effort | Broad: every Copilot interaction follows your rules |
| **Agent** (`.agent.md`) | A dedicated persona with specific tools, behavior, and output format, invoked via `@agent-name` | When you need a **repeatable, on-demand task** with structured output | Focused: only when explicitly invoked |
| **Skills** (`SKILL.md`) | A reusable, focused workflow shared across multiple agents | When you have **2+ agents** sharing the same domain knowledge | Modular: avoids duplication across agents |

> **Practical recommendation:** Start with instructions — they cover ~80% of the value. Add an agent when you find yourself repeatedly typing the same complex prompt. Add skills only when you're duplicating logic across agents. In this lab, we create all three for learning purposes, but **skills are marked optional**.

---

## Part A: Create Custom Instructions (20 min)

Instructions are the **foundation** — they apply automatically to all Copilot interactions on matching files, without any explicit invocation. This is where you define your project's coding standards, security rules, and conventions.

### Step 1: Create a Custom Instructions File

In VS Code use Copilot Chat to generate the instructions file:

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
   > **TIP:** If the shortcut doesn't work, use the menu: **View → Chat**
2. In the chat input box, type `/create-instructions named review-standards.instructions.md ` and press Enter
3. Copilot will generate an instructions file under `.github/instructions/`
4. Verify the file exists at `.github/instructions/review-standards.instructions.md` in the Explorer panel

### Step 2: Review and Edit the Generated Instructions

1. Open the generated file at `.github/instructions/review-standards.instructions.md`
2. Review the content that GitHub Copilot created — it should look something like below.
3. Ensure the YAML frontmatter includes an `applyTo` pattern for your project files:

`````markdown
---
description: 'Code review and security standards for this project'
applyTo: '**/*.js'
---

# Generic Code Review Instructions

Comprehensive code review guidelines for GitHub Copilot that can be adapted to any project. These instructions follow best practices from prompt engineering and provide a structured approach to code quality, security, testing, and architecture review.

## Review Language

When performing a code review, respond in **English** (or specify your preferred language).

> **Customization Tip**: Change to your preferred language by replacing "English" with "Portuguese (Brazilian)", "Spanish", "French", etc.

## Review Priorities

When performing a code review, prioritize issues in the following order:

### 🔴 CRITICAL (Block merge)
- **Security**: Vulnerabilities, exposed secrets, authentication/authorization issues
- **Correctness**: Logic errors, data corruption risks, race conditions
- **Breaking Changes**: API contract changes without versioning
- **Data Loss**: Risk of data loss or corruption

### 🟡 IMPORTANT (Requires discussion)
- **Code Quality**: Severe violations of SOLID principles, excessive duplication
- **Test Coverage**: Missing tests for critical paths or new functionality
- **Performance**: Obvious performance bottlenecks (N+1 queries, memory leaks)
- **Architecture**: Significant deviations from established patterns

### 🟢 SUGGESTION (Non-blocking improvements)
- **Readability**: Poor naming, complex logic that could be simplified
- **Optimization**: Performance improvements without functional impact
- **Best Practices**: Minor deviations from conventions
- **Documentation**: Missing or incomplete comments/documentation

## General Review Principles

When performing a code review, follow these principles:

1. **Be specific**: Reference exact lines, files, and provide concrete examples
2. **Provide context**: Explain WHY something is an issue and the potential impact
3. **Suggest solutions**: Show corrected code when applicable, not just what's wrong
4. **Be constructive**: Focus on improving the code, not criticizing the author
5. **Recognize good practices**: Acknowledge well-written code and smart solutions
6. **Be pragmatic**: Not every suggestion needs immediate implementation
7. **Group related comments**: Avoid multiple comments about the same topic

## Code Quality Standards

When performing a code review, check for:

### Clean Code
- Descriptive and meaningful names for variables, functions, and classes
- Single Responsibility Principle: each function/class does one thing well
- DRY (Don't Repeat Yourself): no code duplication
- Functions should be small and focused (ideally < 20-30 lines)
- Avoid deeply nested code (max 3-4 levels)
- Avoid magic numbers and strings (use constants)
- Code should be self-documenting; comments only when necessary

### Examples
```javascript
// ❌ BAD: Poor naming and magic numbers
function calc(x, y) {
    if (x > 100) return y * 0.15;
    return y * 0.10;
}

// ✅ GOOD: Clear naming and constants
const PREMIUM_THRESHOLD = 100;
const PREMIUM_DISCOUNT_RATE = 0.15;
const STANDARD_DISCOUNT_RATE = 0.10;

function calculateDiscount(orderTotal, itemPrice) {
    const isPremiumOrder = orderTotal > PREMIUM_THRESHOLD;
    const discountRate = isPremiumOrder ? PREMIUM_DISCOUNT_RATE : STANDARD_DISCOUNT_RATE;
    return itemPrice * discountRate;
}
```

### Error Handling
- Proper error handling at appropriate levels
- Meaningful error messages
- No silent failures or ignored exceptions
- Fail fast: validate inputs early
- Use appropriate error types/exceptions

### Examples
```python
# ❌ BAD: Silent failure and generic error
def process_user(user_id):
    try:
        user = db.get(user_id)
        user.process()
    except:
        pass

# ✅ GOOD: Explicit error handling
def process_user(user_id):
    if not user_id or user_id <= 0:
        raise ValueError(f"Invalid user_id: {user_id}")

    try:
        user = db.get(user_id)
    except UserNotFoundError:
        raise UserNotFoundError(f"User {user_id} not found in database")
    except DatabaseError as e:
        raise ProcessingError(f"Failed to retrieve user {user_id}: {e}")

    return user.process()
```

## Security Review

When performing a code review, check for security issues:

- **Sensitive Data**: No passwords, API keys, tokens, or PII in code or logs
- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection**: Use parameterized queries, never string concatenation
- **Authentication**: Proper authentication checks before accessing resources
- **Authorization**: Verify user has permission to perform action
- **Cryptography**: Use established libraries, never roll your own crypto
- **Dependency Security**: Check for known vulnerabilities in dependencies

### Examples
```java
// ❌ BAD: SQL injection vulnerability
String query = "SELECT * FROM users WHERE email = '" + email + "'";

// ✅ GOOD: Parameterized query
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE email = ?"
);
stmt.setString(1, email);
```

```javascript
// ❌ BAD: Exposed secret in code
const API_KEY = "sk_live_abc123xyz789";

// ✅ GOOD: Use environment variables
const API_KEY = process.env.API_KEY;
```

## Testing Standards

When performing a code review, verify test quality:

- **Coverage**: Critical paths and new functionality must have tests
- **Test Names**: Descriptive names that explain what is being tested
- **Test Structure**: Clear Arrange-Act-Assert or Given-When-Then pattern
- **Independence**: Tests should not depend on each other or external state
- **Assertions**: Use specific assertions, avoid generic assertTrue/assertFalse
- **Edge Cases**: Test boundary conditions, null values, empty collections
- **Mock Appropriately**: Mock external dependencies, not domain logic

### Examples
```typescript
// ❌ BAD: Vague name and assertion
test('test1', () => {
    const result = calc(5, 10);
    expect(result).toBeTruthy();
});

// ✅ GOOD: Descriptive name and specific assertion
test('should calculate 10% discount for orders under $100', () => {
    const orderTotal = 50;
    const itemPrice = 20;

    const discount = calculateDiscount(orderTotal, itemPrice);

    expect(discount).toBe(2.00);
});
```

## Performance Considerations

When performing a code review, check for performance issues:

- **Database Queries**: Avoid N+1 queries, use proper indexing
- **Algorithms**: Appropriate time/space complexity for the use case
- **Caching**: Utilize caching for expensive or repeated operations
- **Resource Management**: Proper cleanup of connections, files, streams
- **Pagination**: Large result sets should be paginated
- **Lazy Loading**: Load data only when needed

### Examples
```python
# ❌ BAD: N+1 query problem
users = User.query.all()
for user in users:
    orders = Order.query.filter_by(user_id=user.id).all()  # N+1!

# ✅ GOOD: Use JOIN or eager loading
users = User.query.options(joinedload(User.orders)).all()
for user in users:
    orders = user.orders
```

## Architecture and Design

When performing a code review, verify architectural principles:

- **Separation of Concerns**: Clear boundaries between layers/modules
- **Dependency Direction**: High-level modules don't depend on low-level details
- **Interface Segregation**: Prefer small, focused interfaces
- **Loose Coupling**: Components should be independently testable
- **High Cohesion**: Related functionality grouped together
- **Consistent Patterns**: Follow established patterns in the codebase

## Documentation Standards

When performing a code review, check documentation:

- **API Documentation**: Public APIs must be documented (purpose, parameters, returns)
- **Complex Logic**: Non-obvious logic should have explanatory comments
- **README Updates**: Update README when adding features or changing setup
- **Breaking Changes**: Document any breaking changes clearly
- **Examples**: Provide usage examples for complex features

## Comment Format Template

When performing a code review, use this format for comments:

```markdown
**[PRIORITY] Category: Brief title**

Detailed description of the issue or suggestion.

**Why this matters:**
Explanation of the impact or reason for the suggestion.

**Suggested fix:**
[code example if applicable]

**Reference:** [link to relevant documentation or standard]
```

### Example Comments

#### Critical Issue
````markdown
**🔴 CRITICAL - Security: SQL Injection Vulnerability**

The query on line 45 concatenates user input directly into the SQL string,
creating a SQL injection vulnerability.

**Why this matters:**
An attacker could manipulate the email parameter to execute arbitrary SQL commands,
potentially exposing or deleting all database data.

**Suggested fix:**
```sql
-- Instead of:
query = "SELECT * FROM users WHERE email = '" + email + "'"

-- Use:
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE email = ?"
);
stmt.setString(1, email);
```

**Reference:** OWASP SQL Injection Prevention Cheat Sheet
````

#### Important Issue
````markdown
**🟡 IMPORTANT - Testing: Missing test coverage for critical path**

The `processPayment()` function handles financial transactions but has no tests
for the refund scenario.

**Why this matters:**
Refunds involve money movement and should be thoroughly tested to prevent
financial errors or data inconsistencies.

**Suggested fix:**
Add test case:
```javascript
test('should process full refund when order is cancelled', () => {
    const order = createOrder({ total: 100, status: 'cancelled' });

    const result = processPayment(order, { type: 'refund' });

    expect(result.refundAmount).toBe(100);
    expect(result.status).toBe('refunded');
});
```
````

#### Suggestion
````markdown
**🟢 SUGGESTION - Readability: Simplify nested conditionals**

The nested if statements on lines 30-40 make the logic hard to follow.

**Why this matters:**
Simpler code is easier to maintain, debug, and test.

**Suggested fix:**
```javascript
// Instead of nested ifs:
if (user) {
    if (user.isActive) {
        if (user.hasPermission('write')) {
            // do something
        }
    }
}

// Consider guard clauses:
if (!user || !user.isActive || !user.hasPermission('write')) {
    return;
}
// do something
```
````

## Review Checklist

When performing a code review, systematically verify:

### Code Quality
- [ ] Code follows consistent style and conventions
- [ ] Names are descriptive and follow naming conventions
- [ ] Functions/methods are small and focused
- [ ] No code duplication
- [ ] Complex logic is broken into simpler parts
- [ ] Error handling is appropriate
- [ ] No commented-out code or TODO without tickets

### Security
- [ ] No sensitive data in code or logs
- [ ] Input validation on all user inputs
- [ ] No SQL injection vulnerabilities
- [ ] Authentication and authorization properly implemented
- [ ] Dependencies are up-to-date and secure

### Testing
- [ ] New code has appropriate test coverage
- [ ] Tests are well-named and focused
- [ ] Tests cover edge cases and error scenarios
- [ ] Tests are independent and deterministic
- [ ] No tests that always pass or are commented out

### Performance
- [ ] No obvious performance issues (N+1, memory leaks)
- [ ] Appropriate use of caching
- [ ] Efficient algorithms and data structures
- [ ] Proper resource cleanup

### Architecture
- [ ] Follows established patterns and conventions
- [ ] Proper separation of concerns
- [ ] No architectural violations
- [ ] Dependencies flow in correct direction

### Documentation
- [ ] Public APIs are documented
- [ ] Complex logic has explanatory comments
- [ ] README is updated if needed
- [ ] Breaking changes are documented

## Project-Specific Customizations

To customize this template for your project, add sections for:

1. **Language/Framework specific checks**
   - Example: "When performing a code review, verify React hooks follow rules of hooks"
   - Example: "When performing a code review, check Spring Boot controllers use proper annotations"

2. **Build and deployment**
   - Example: "When performing a code review, verify CI/CD pipeline configuration is correct"
   - Example: "When performing a code review, check database migrations are reversible"

3. **Business logic rules**
   - Example: "When performing a code review, verify pricing calculations include all applicable taxes"
   - Example: "When performing a code review, check user consent is obtained before data processing"

4. **Team conventions**
   - Example: "When performing a code review, verify commit messages follow conventional commits format"
   - Example: "When performing a code review, check branch names follow pattern: type/ticket-description"

## Additional Resources

For more information on effective code reviews and GitHub Copilot customization:

- [GitHub Copilot Prompt Engineering](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering)
- [GitHub Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Awesome GitHub Copilot Repository](https://github.com/github/awesome-copilot)
- [GitHub Code Review Guidelines](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)
- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [OWASP Security Guidelines](https://owasp.org/)

## Prompt Engineering Tips

When performing a code review, apply these prompt engineering principles from the [GitHub Copilot documentation](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering):

1. **Start General, Then Get Specific**: Begin with high-level architecture review, then drill into implementation details
2. **Give Examples**: Reference similar patterns in the codebase when suggesting changes
3. **Break Complex Tasks**: Review large PRs in logical chunks (security → tests → logic → style)
4. **Avoid Ambiguity**: Be specific about which file, line, and issue you're addressing
5. **Indicate Relevant Code**: Reference related code that might be affected by changes
6. **Experiment and Iterate**: If initial review misses something, review again with focused questions

## Project Context

- **Tech Stack**: Node.js, Express 4.x, better-sqlite3 (in-memory SQLite)
- **Architecture**: Monolithic single-file server
- **Build Tool**: npm
- **Testing**: Custom lightweight test runner using Node.js built-in `assert` module
- **Code Style**: CommonJS modules (`require`/`module.exports`)
`````

> **NOTE:** The `applyTo` field tells Copilot to apply these instructions when working with `.js` files in this project.

### Step 3: Verify Instructions Are Active

1. Open any `.js` file in the project (e.g., `sample-app/server.js`)
2. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
3. Ask Copilot a question about the file — it should now follow the review priorities and standards defined in your instructions
4. The instructions apply automatically because of `applyTo: '**/*.js'` — no need to reference them explicitly

> **TIP:** Instructions are the highest-impact customization you can make. Even without an agent or skills, every Copilot interaction with `.js` files in this project will now follow your review standards.

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Instructions file created | `.github/instructions/review-standards.instructions.md` exists |
| Instructions active | Copilot follows review standards when you chat about `.js` files |

---

## Part B: Create a Custom Agent (25 min)

Now that your project has instructions (the standards), create an **agent** (the persona) that uses them. An agent gives you an on-demand, structured reviewer you invoke by name — with a specific output format, tool permissions, and behavioral framing that instructions alone don't provide.

> **When is an agent worth it?** When you find yourself repeatedly typing the same complex prompt (e.g., "review this file for security issues and produce a severity table"). The agent encapsulates that prompt so you just type `@code-review`.

### Step 4: Create the Code Review Agent

Use Copilot Chat to generate the code-review agent:

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
   > **TIP:** If the shortcut doesn't work, use the menu: **View → Chat**
2. In the chat input box, type `/create-agent named code-review` and press Enter
3. Copilot will generate an agent file under `.github/agents/`
4. Verify the file exists at `.github/agents/code-review.agent.md` in the Explorer panel
5. Open the generated file and review the content

> **NOTE:** Copilot may generate different content than the reference below. That’s fine — compare your generated file with the reference and edit to include the key sections: **tools list**, **security focus areas**, and **output format**.

Ensure the agent file includes the following YAML frontmatter and markdown content (edit if needed):

```markdown
---
name: code-review
description: 'Expert code reviewer that analyzes code quality, identifies bugs, and suggests improvements with security awareness'
tools:
  - read
  - edit
  - search
---

# Code Review Agent

You are an expert code reviewer and application security engineer. When reviewing code, you perform two analyses:

## Code Quality Review
1. Check naming conventions, function structure, and readability
2. Identify duplicated logic (DRY violations) and suggest refactoring
3. Find magic numbers, debug logging, and TODO comments
4. Evaluate error handling coverage and edge cases
5. Check for callback hell and suggest modern alternatives

## Security Review
1. Scan for OWASP Top 10 vulnerabilities
2. Identify hardcoded credentials, API keys, or tokens
3. Check for injection vulnerabilities (SQL, command, XSS)
4. Verify cryptographic practices (no MD5/SHA1 for passwords)
5. Check that error messages do not expose internal details

## Output Format
Provide findings in this structure:
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION
- **Category**: Security or Code Quality
- **File and Line**: Exact location
- **Description**: What the issue is and why it matters
- **Recommendation**: Concrete fix with code example

Start with a summary table, then list detailed findings sorted by severity.
```

> **TIP:** The YAML frontmatter (between the `---` markers) defines metadata. The Markdown body below is the system prompt that shapes the agent's behavior.
>
> **How does this relate to instructions?** The agent automatically inherits the instructions from Part A (because of `applyTo: '**/*.js'`). The agent file adds the output format, tool permissions, and behavioral framing on top. You don't need to duplicate the review criteria here.

### Step 5: Create the Security Analysis Agent

Use Copilot Chat to generate the security-analysis agent:

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. In the chat input box, type `/create-agent named security-analysis` and press Enter
3. Copilot will generate an agent file under `.github/agents/`
4. Verify the file exists at `.github/agents/security-analysis.agent.md` in the Explorer panel
5. Open the generated file and review the content
6. Edit the agent file to focus on security scanning — ensure it includes OWASP Top 10 coverage, CWE references, and a severity-based output format

> **NOTE:** As with the code-review agent, Copilot may generate different content. Compare with the reference below and edit to align the key sections.

Ensure the agent file includes the following YAML frontmatter and markdown content (edit if needed):

````markdown
---
name: security-analysis
description: 'Senior application security engineer that scans code for OWASP Top 10 vulnerabilities, hardcoded secrets, injection flaws, and insecure patterns'
tools:
  - read
  - search
---

# Security Analysis Agent

You are a senior application security engineer specializing in vulnerability assessment. When reviewing code for security issues, follow these guidelines:

## Focus Areas (OWASP Top 10)

### 1. Injection (A03:2021)
- SQL Injection: String concatenation in SQL queries
- Command Injection: User input passed to exec/eval/system
- NoSQL Injection: Unsanitized queries to document databases
- XSS: User input reflected in HTML without escaping

### 2. Broken Authentication (A07:2021)
- Hardcoded credentials, API keys, or tokens in source code
- Weak password hashing (MD5, SHA1 without salt)
- Missing rate limiting on authentication endpoints
- Session tokens in URLs or logs

### 3. Sensitive Data Exposure (A02:2021)
- Secrets logged to stdout/stderr
- Error messages exposing internal details (stack traces, queries)
- Sensitive data transmitted over HTTP (not HTTPS)
- PII stored in plain text

### 4. Security Misconfiguration (A05:2021)
- Default credentials left in place
- Verbose error responses in production
- Missing security headers (CORS, CSP, HSTS)
- Debug mode enabled in production

### 5. Insecure Dependencies (A06:2021)
- Known vulnerable dependencies
- Outdated packages with security patches available
- Unused dependencies increasing attack surface

## Severity Ratings

| Severity | Criteria | Example |
|----------|----------|---------|
| **CRITICAL** | Actively exploitable, immediate risk | SQL injection, RCE via eval |
| **HIGH** | Significant security weakness | Hardcoded secrets, weak crypto |
| **MEDIUM** | Defense-in-depth concern | Missing input validation, verbose errors |
| **LOW** | Best practice improvement | Missing security headers |
| **INFO** | Observation, no immediate risk | Outdated but not vulnerable dependency |

## Output Format

For each finding, provide:
1. **Vulnerability Title** and CWE identifier (e.g., CWE-89)
2. **Location**: File path and line number
3. **Severity**: CRITICAL / HIGH / MEDIUM / LOW / INFO
4. **Description**: What the vulnerability is and why it matters
5. **Proof of Concept**: How an attacker could exploit it (conceptual, safe description)
6. **Remediation**: Specific code fix with before/after examples

## Important

- Prioritize findings by severity (CRITICAL first)
- Focus on actionable findings — avoid false positives
- Reference CWE identifiers for each vulnerability
- Recommend defense-in-depth: multiple layers of protection
- Start with an executive summary table, then list detailed findings
````

### Step 6: Verify Both Agents Appear in VS Code

1. **Save all files** — ensure both `.agent.md` files are saved
2. Open the **Copilot Chat** panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
3. In the chat input box, type `@`
4. You should see both **code-review** and **security-analysis** listed among the available agents
5. If either doesn’t appear:
   - Ensure both files are saved
   - Wait a few seconds for VS Code to index the new files
   - Reload VS Code: `Ctrl+Shift+P` → **Developer: Reload Window**
6. Verify each agent responds correctly:
   - Type `@code-review` followed by a question — it should respond as a code reviewer
   - Type `@security-analysis` followed by a question — it should respond as a security analyst

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Code review agent created | `.github/agents/code-review.agent.md` exists (via `/create-agent`) |
| Security analysis agent created | `.github/agents/security-analysis.agent.md` exists (via `/create-agent`) |
| Both agents visible in Chat | Typing `@` shows both `code-review` and `security-analysis` in the agent list |

---

## Part C: Create Agent Skills — Optional (15 min)

> **This part is optional.** Skills are useful when you have multiple agents that need to share the same domain knowledge. With a single agent, the logic in your `.agent.md` file and `.instructions.md` file already covers what a skill would do. Complete this section to learn how skills work, or skip ahead to Part D.

Skills are focused capabilities that add **domain-specific knowledge** to your agents. The code-review and security-analysis agents from Part B catch generic quality and OWASP issues — but neither has JavaScript-specific expertise. They won't flag `var` instead of `const`, callback hell that should be `async/await`, or `==` coercion traps. A **JS Anti-Pattern Detection** skill fills that gap and can be shared across both agents.

> **When are skills worth it?** When you later create a second agent (e.g., `@security-only`) that needs the same scanning workflow as `@code-review`. The skill avoids duplicating that logic across agent files.

### Step 7: Review the Skill Templates

Open the reference skill templates in the workshop repo:

- `templates/skills/skill-code-review.md` — Code review skill definition
- `templates/skills/skill-security-analysis.md` — Security analysis skill definition
- `templates/skills/skill-js-antipattern-detection.md` — JS anti-pattern detection skill definition

> **NOTE:** Like the instruction templates, these files in `templates/` are **reference examples**. The actual skill you create in the next step goes under `.github/skills/`, which is where Copilot looks for skills.

### Step 8: Create a JS Anti-Pattern Detection Skill

Use Copilot Chat to generate the skill:

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. In the chat input box, type the following prompt and press Enter:

```
/create-skills named js-antipattern-detection that detects JavaScript anti-patterns: var instead of let/const, == instead of ===, callback nesting deeper than 2 levels (suggest async/await), missing 'use strict' in CommonJS modules, for loops replaceable by .map/.filter/.reduce, string concatenation where template literals fit, and prototype pollution risks from bracket notation on user input. Output a findings table sorted by severity with before/after code fixes.
```

> **TIP:** You can copy-paste the full prompt above. If `/create-skills` doesn't accept inline descriptions, just type `/create-skills`, name it `js-antipattern-detection`, and paste the description as a follow-up message.

3. Copilot will generate a skill file under `.github/skills/js-antipattern-detection/`
4. Open the generated file at `.github/skills/js-antipattern-detection/SKILL.md` and review the content

Ensure the skill file includes the following YAML frontmatter and markdown content (edit if needed):

````markdown
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
- [ ] String concatenation (`+`) → template literals (`` ` `` backtick strings)
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
​```js
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
​```
**After:**
​```js
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
​```
```
````

> **TIP:** The YAML frontmatter (between the `---` markers) defines metadata. The Markdown body below defines the anti-pattern checklist and output format that any agent referencing this skill will follow.
>
> **How does this complement the agents?** The code-review agent catches generic quality issues (naming, DRY, error handling). The security-analysis agent catches OWASP vulnerabilities. This skill adds **JavaScript-specific** expertise — `var` vs `const`, callback hell, `==` coercion — that neither agent knows about on its own.

### Step 9: Test the Skill on the Sample App

1. Open the Copilot Chat panel
2. Type:

```
@code-review Scan sample-app/utils.js for JavaScript anti-patterns. Focus on var usage, callback nesting, and modern JS alternatives.
```

3. The agent should now leverage the JS Anti-Pattern Detection skill and identify findings like:

> **NOTE:** If the agent doesn't seem to use the skill, try reloading VS Code first: `Ctrl+Shift+P` → **Developer: Reload Window**

| # | Severity | Anti-Pattern | File:Line | Modern Alternative |
|---|----------|-------------|-----------|-------------------|
| 1 | HIGH | Callback hell (4 levels) | utils.js:137-152 | `async/await` |
| 2 | MEDIUM | `var` declaration | utils.js:12 | `const` / `let` |
| 3 | MEDIUM | `var` declaration | utils.js:52 | `const` |
| 4 | MEDIUM | `var` declaration | utils.js:82 | `const` |
| 5 | LOW | `for` loop → `.map()` | utils.js:53-55 | `Array.map()` |
| 6 | LOW | `for` loop → `.push()` pattern | utils.js:15-26 | `Array.filter().map()` |
| 7 | LOW | String concatenation | utils.js:88 | Template literal |
| 8 | SUGGESTION | Missing `'use strict'` | utils.js:1 | Add `'use strict';` |
| 9 | SUGGESTION | `function` expression | utils.js:140 | Arrow function |

4. Compare these findings with the output from Part E — notice that the JS anti-pattern findings are **different** from the generic code quality and security findings. This demonstrates the value of specialized skills.

### ✅ Checkpoint C

| Check | Expected |
|-------|----------|
| Skill templates reviewed | You've read all three `templates/skills/` files |
| JS anti-pattern skill created | `.github/skills/js-antipattern-detection/SKILL.md` exists (via `/create-skills`) |
| Skill tested on sample app | `@code-review` produces JS-specific findings for `utils.js` |

---

## Part D: Create Copilot Hooks with the Coding Agent (25 min)

Hooks are shell commands or scripts that run automatically during Copilot agent lifecycle events. They provide **deterministic guardrails** — secret scanning, test gates, audit logging — that don't depend on the AI remembering to do it.

In this section, you'll review one pre-built hook to understand the pattern, then **use the Copilot coding agent to create two new hooks from scratch**.

> **IMPORTANT:** These are **GitHub Copilot hooks** (for the Copilot coding agent), NOT Git hooks. They are defined in `.github/hooks/` and follow the [GitHub Copilot hooks specification](https://docs.github.com/en/copilot/reference/hooks-configuration).

### What Are Hook Events?

| Event | When It Fires | Use Case |
|-------|--------------|----------|
| `sessionStart` | When a Copilot agent session begins | Logging, context capture, environment checks |
| `postToolUse` | After the agent uses a tool (e.g., edits a file) | Scanning, formatting, linting modified files |
| `agentStop` | When the agent finishes responding | Quality gates, test runners, final validation |

**Exit codes matter:**
- Exit `0` → allow the workflow to continue
- Exit non-zero → **block** the workflow (useful for gates)

### Step 10: Review the Starter Hook (3 min)

The workshop repository includes a starter `hooks.json` with one pre-built hook to show you the pattern. Open and examine these two files:

**1. `.github/hooks/hooks.json`** — Currently configured with one event:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": ".github/hooks/scripts/log-context.sh",
        "powershell": "powershell -ExecutionPolicy Bypass -File .github/hooks/scripts/log-context.ps1",
        "cwd": ".",
        "timeoutSec": 5
      }
    ]
  }
}
```

**2. `.github/hooks/scripts/log-context.sh`** — The hook script itself:
- Reads JSON context from stdin (every hook receives context this way)
- Writes a structured log entry with timestamp to `logs/copilot/session.log`
- Exits `0` (allows the session to proceed)

Open the script and note the pattern — you'll follow the same structure for your own hooks:

```bash
#!/bin/bash
set -euo pipefail
INPUT=$(cat)              # 1. Read JSON context from stdin
mkdir -p logs/copilot     # 2. Ensure log directory exists
# ... do work ...         # 3. Your logic here
echo "📝 Done"            # 4. Print status message
exit 0                    # 5. Exit 0 to allow, non-zero to block
```

### Step 11: Test the Starter Hook (2 min)

Verify the hook works before building on the pattern:

```bash
# Make the script executable (macOS/Linux)
chmod +x .github/hooks/scripts/log-context.sh

# Test it manually — pipe empty JSON context via stdin
echo '{"event":"test"}' | .github/hooks/scripts/log-context.sh
```

**Expected output:**

```
📝 Session context logged to logs/copilot/session.log
```

Verify the log was created:

```bash
cat logs/copilot/session.log
```

You should see a JSON entry with a timestamp, event type, and working directory.

> **Windows users:** If you're on Windows without WSL, run these commands in **Git Bash** (installed with Git for Windows). The hook system uses the `bash` field from `hooks.json` automatically.

### Step 12: Create a Secret Leak Scanner with the Coding Agent (8 min)

Now you'll create your first hook using the Copilot coding agent. This hook will scan for hardcoded secrets after every agent edit — catching the same class of issue (CWE-798) that the security analysis agent finds, but **deterministically**, with pattern matching instead of AI judgment.

**1. Switch to Agent mode** in the Copilot Chat panel:
   - Open Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`)
   - Click the **mode selector** at the top of the Chat panel and switch to **Agent** mode
   - Agent mode allows Copilot to create files and edit existing files directly

> **Why Agent mode?** In Ask mode, Copilot can only suggest code. In Agent mode, Copilot can actually create the script file and update `hooks.json` for you — which is exactly what we need.

**2. Paste the following prompt** into the Copilot Chat input and press Enter:

```
Create a Copilot hook script at .github/hooks/scripts/secret-scanner.sh that:

1. Runs after each tool use (postToolUse event)
2. Reads JSON context from stdin (same pattern as log-context.sh)
3. Scans all .js files in sample-app/ for hardcoded secrets using grep regex patterns:
   - API keys matching patterns like "sk-", "sk_", "AKIA", "ghp_", "gho_", "github_pat_"
   - Variables named password, secret, api_key, token assigned to string literals
   - Bearer tokens in strings
4. Creates the logs/copilot/ directory if it doesn't exist
5. Logs findings to logs/copilot/secret-scan.log as JSON with timestamp and finding count
6. Prints a summary to stdout: "🔍 Secret scan: X potential secret(s) found in sample-app/"
7. Always exits 0 (warn only — does NOT block the workflow)

Also update .github/hooks/hooks.json to add this script under the postToolUse event
with a 15-second timeout. Keep the existing sessionStart hook unchanged.
```

**3. Review what the coding agent generated:**

After the agent finishes, check these things:

| What to check | Where | What to look for |
|---------------|-------|-----------------|
| Script created | `.github/hooks/scripts/secret-scanner.sh` | File exists in Explorer panel |
| Shebang line | Line 1 of the script | Starts with `#!/bin/bash` |
| Stdin consumed | Near the top of the script | Has `INPUT=$(cat)` or similar |
| Correct scan target | In the grep commands | Scans `sample-app/`, not the project root |
| Exit code | End of the script | Ends with `exit 0` |
| hooks.json updated | `.github/hooks/hooks.json` | Has a new `postToolUse` entry pointing to the script |

> **Common issues the coding agent might produce (and how to fix):**
> - **Missing shebang (`#!/bin/bash`)** — Add it as the first line of the script
> - **Not reading stdin** — Add `INPUT=$(cat)` near the top (hooks always receive JSON via stdin; not reading it can cause the script to hang)
> - **Scanning the wrong directory** — Ensure grep targets `sample-app/`, not `.` or the project root
> - **Forgot to update hooks.json** — Manually add the `postToolUse` entry (see Step 14 for the expected format)

**4. Make the script executable and test it:**

```bash
# Make executable
chmod +x .github/hooks/scripts/secret-scanner.sh

# Test manually
echo '{}' | .github/hooks/scripts/secret-scanner.sh
```

**Expected output** (because `sample-app/server.js` contains `sk-proj-abc123...` and `SuperSecret123!`):

```
🔍 Secret scan: 2 potential secret(s) found in sample-app/
```

> The exact count may vary depending on the regex patterns the coding agent chose — the key is that it finds **at least 2** secrets (the API key and the database password in `server.js`).

**5. Verify the log was created:**

```bash
cat logs/copilot/secret-scan.log
```

You should see a JSON entry with a timestamp and the number of findings.

### Step 13: Create a Test Runner Gate with the Coding Agent (8 min)

> **Stretch goal:** If you're running short on time, skip to **Checkpoint D** — the secret scanner from Step 12 already demonstrates the key concepts. Complete this step if time permits.

This hook runs your test suite when the agent finishes and **blocks the workflow** if tests fail. This is the "hard gate" — it doesn't just warn, it **stops everything**.

**1. In the same Agent mode Copilot Chat**, paste this prompt:

```
Create a Copilot hook script at .github/hooks/scripts/test-gate.sh that:

1. Runs when the agent stops (agentStop event)
2. Reads JSON context from stdin
3. Changes directory to sample-app/ and runs "npm test"
4. Captures the test exit code
5. Creates the logs/copilot/ directory if it doesn't exist
6. If tests pass (exit 0):
   - Logs a JSON success entry to logs/copilot/test-gate.log with timestamp
   - Prints "✅ TEST GATE PASSED: All tests pass."
   - Exits 0 (allows the workflow to continue)
7. If tests fail (exit non-zero):
   - Logs a JSON failure entry to logs/copilot/test-gate.log with timestamp
     and the test exit code
   - Prints "🚨 TEST GATE FAILED: Tests did not pass. Fix failing tests
     before proceeding."
   - Exits 1 to BLOCK the workflow

Also update .github/hooks/hooks.json to add this script under the agentStop event
with a 30-second timeout. Keep the existing sessionStart and postToolUse hooks unchanged.
```

**2. Review what the coding agent generated:**

| What to check | Where | What to look for |
|---------------|-------|-----------------|
| Script created | `.github/hooks/scripts/test-gate.sh` | File exists in Explorer panel |
| Correct directory | In the script body | Does `cd sample-app` before `npm test` |
| Exit code handling | End of script | Exits `0` on test pass, exits `1` on test fail |
| hooks.json updated | `.github/hooks/hooks.json` | Has a new `agentStop` entry with 30s timeout |

> **Common issues and fixes:**
> - **`npm test` fails with "missing dependencies"** — The script should not need to run `npm install` (that's done during setup). But if you haven't run `npm install` in `sample-app/` yet, do it now: `cd sample-app && npm install && cd ..`
> - **Script doesn't change directory** — Ensure the script does `cd sample-app` before `npm test`. Without this, npm will look for `package.json` in the project root
> - **Uses `set -e` and npm test failure kills the script** — The script should capture the exit code (`npm test; TEST_EXIT=$?`) rather than letting `set -e` abort on failure

**3. Make the script executable and test it:**

```bash
# Make executable
chmod +x .github/hooks/scripts/test-gate.sh

# Ensure dependencies are installed
cd sample-app && npm install && cd ..

# Test manually
echo '{}' | .github/hooks/scripts/test-gate.sh
```

**Expected output** (the sample-app tests pass on unmodified code):

```
=== Sample App Tests ===
  ✅ returns active users for type 'active'
  ✅ returns inactive users for type 'inactive'
  ...
=== Results: X passed, 0 failed ===
✅ TEST GATE PASSED: All tests pass.
```

**4. Verify the gate log:**

```bash
cat logs/copilot/test-gate.log
```

### Step 14: Verify the Final hooks.json (2 min)

Open `.github/hooks/hooks.json` and confirm it has **three events** configured — one pre-built, two created by the coding agent:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": ".github/hooks/scripts/log-context.sh",
        "powershell": "powershell -ExecutionPolicy Bypass -File .github/hooks/scripts/log-context.ps1",
        "cwd": ".",
        "timeoutSec": 5
      }
    ],
    "postToolUse": [
      {
        "type": "command",
        "bash": ".github/hooks/scripts/secret-scanner.sh",
        "cwd": ".",
        "timeoutSec": 15
      }
    ],
    "agentStop": [
      {
        "type": "command",
        "bash": ".github/hooks/scripts/test-gate.sh",
        "cwd": ".",
        "timeoutSec": 30
      }
    ]
  }
}
```

> **TIP:** If the coding agent's edits to `hooks.json` look malformed, validate the JSON:
> ```bash
> cat .github/hooks/hooks.json | python3 -m json.tool
> ```
> If it shows errors, open the file and fix the JSON manually using the reference above.

Your `hooks.json` may look slightly different — the key is that all three events (`sessionStart`, `postToolUse`, `agentStop`) are present and point to the correct scripts.

### How These Hooks Work Together

When you invoke `@code-review` in Part E, the hooks fire automatically at each lifecycle stage:

```
@code-review reviews server.js
  → [sessionStart] log-context.sh logs the session        ← pre-built
  → Agent analyzes code (AI)
  → Agent suggests a fix and edits a file
  → [postToolUse] secret-scanner.sh scans for secrets      ← you created this
  → Agent finishes
  → [agentStop] test-gate.sh runs npm test                 ← you created this
  → ✅ Tests pass → workflow continues
  → (or 🚨 Tests fail → workflow BLOCKED)
```

### Why Not Rely on AI Alone?

| AI Only | AI + Hooks |
|---------|-----------|
| Might miss `sk-proj-abc123` buried in code | Secret scanner **always** catches it — regex, not judgment |
| No record of when reviews happened | Session log created **automatically** every time |
| Suggested fixes might break tests | Test gate runs `npm test` after **every** session |
| Developer can ignore AI warnings | Test gate **blocks** the workflow entirely on failure |

> **Bottom line:** The AI finds and explains issues. Hooks provide the **hard enforcement** — deterministic, auditable, and unforgeable.

### ✅ Checkpoint D

| Check | Expected |
|-------|----------|
| `hooks.json` has 3 events | `sessionStart`, `postToolUse`, `agentStop` all configured |
| `log-context.sh` tested | `echo '{"event":"test"}' \| .github/hooks/scripts/log-context.sh` logs to `session.log` |
| `secret-scanner.sh` created by coding agent | Script exists, is executable, detects secrets in `server.js` |
| `test-gate.sh` created by coding agent *(stretch)* | Script exists, is executable, runs `npm test` successfully |
| All scripts executable | `chmod +x` applied to all scripts (macOS/Linux) |

---

## Part E: Test the Agent (10 min)

### Step 15: Invoke the Agent on the Sample App

1. Open the Copilot Chat panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Ensure you are in **Ask** mode or **Agent** mode (check the mode selector at the top of the Chat panel — either works for invoking `@` agents)
3. Type:

```
@code-review Review the file sample-app/server.js for code quality and security issues. Provide a detailed report with severity levels and fix suggestions.
```

4. Wait for the agent to analyze the file

> **NOTE:** If you created hooks in Part D, they will fire automatically during this interaction — you should see output from your `secret-scanner.sh` (postToolUse) and `test-gate.sh` (agentStop) in the terminal or chat output.

### Step 16: Review the Output

The agent should identify findings like:

> **NOTE:** AI results may vary — you may see more or fewer findings than listed below. The key check is that the agent identifies the major **CRITICAL** and **HIGH** severity issues (SQL injection, eval, hardcoded secrets).

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Security | SQL injection via string interpolation (line ~55) |
| 2 | CRITICAL | Security | eval() on user input (line ~73) |
| 3 | HIGH | Security | Hardcoded API key and password (lines ~21-22) |
| 4 | HIGH | Security | MD5 for password hashing (line ~87) |
| 5 | MEDIUM | Security | XSS — unsanitized user input in HTML (line ~101) |
| 6 | MEDIUM | Code Quality | Error details leaked to client (line ~59) |
| 7 | LOW | Code Quality | Secrets logged to console (line ~115) |

### Step 17: Test on utils.js

```
@code-review Review the file sample-app/utils.js focusing on code quality. Identify duplicated logic, magic numbers, and unnecessary debug logging.
```

Expected findings:
- Deeply nested conditionals in `processUserData`
- Magic numbers in `calculateDiscount`
- console.log debugging in `formatLog`
- Duplicated validation in `getUserById` / `getProductById` / `getOrderById`
- Callback hell in `fetchAndProcess`

### ✅ Checkpoint E — Final Verification

| Check | Expected |
|-------|----------|
| Agent invoked | `@code-review` responds with structured findings |
| Security findings | At least 5 security issues identified in `server.js` |
| Quality findings | At least 5 code quality issues identified in `utils.js` |
| Hooks fired | If Part D completed, hook output visible (secret scan summary, test gate result) |
| Hooks configured | `hooks.json` + scripts ready in `.github/hooks/` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent not showing in `@` list | Save all files, wait a few seconds, then reload VS Code: `Ctrl+Shift+P` → **Developer: Reload Window**. Ensure file is at `.github/agents/code-review.agent.md` |
| Agent gives generic responses | Check the system prompt in the `.agent.md` file; make it specific |
| Hook scripts fail with "permission denied" | Run `chmod +x` on each script (macOS/Linux) |
| Hook logs not created | Ensure the `logs/copilot/` directory is writable; create it with `mkdir -p logs/copilot` |
| Skills not recognized | Ensure the SKILL.md file has valid YAML frontmatter with `name` and `description` (Part C is optional). Try reloading VS Code |
| Coding agent creates a script that doesn't work | Check: (1) shebang line `#!/bin/bash` on line 1, (2) stdin is consumed with `INPUT=$(cat)`, (3) correct directory paths. See Common Issues callouts in Steps 12–13 |
| `npm test` fails inside `test-gate.sh` | Ensure the script does `cd sample-app` before `npm test`. Run `cd sample-app && npm install && cd ..` if dependencies aren't installed |
| Secret scanner finds nothing | Check that grep patterns target `sample-app/`, not the project root. Verify `server.js` still has the original hardcoded secrets |
| `hooks.json` malformed after coding agent edit | Validate JSON: `cat .github/hooks/hooks.json \| python3 -m json.tool`. Fix manually using the reference in Step 14 |
| `/create-agent` or `/create-skills` command not recognized | Ensure GitHub Copilot Chat extension is up to date. Try updating via Extensions panel |

## Where Hook Logs Appear

- Session logs: `logs/copilot/session.log`
- Secret scan results: `logs/copilot/secret-scan.log`
- Test gate decisions: `logs/copilot/test-gate.log`

## Cleanup / Reset

```bash
# Remove created files (keeps reference templates in templates/)
rm -rf .github/instructions/
rm -rf .github/agents/
rm -rf .github/skills/  # Only if you created skills (Part C)

# Remove hook scripts created by the coding agent (keeps log-context.sh)
rm -f .github/hooks/scripts/secret-scanner.sh
rm -f .github/hooks/scripts/test-gate.sh

# Reset hooks.json to starter state (sessionStart only)
# See Step 10 for the original content, or run:
# git checkout .github/hooks/hooks.json

# Reset logs
rm -rf logs/

# Reset generated reports
rm -f samples/findings/report.md
```

---

**Lab 1 complete!** Proceed to [Lab 2: Invocation from IDE & CLI →](lab-02-invocation-ide-cli.md)
