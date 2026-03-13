# Lab 1: Custom Instructions, Agent & Skills on IDE

> **Time estimate:** 90 minutes
> **Instructor note:** Demo the first 10 minutes (creating an instructions file, showing how it affects Copilot behavior). Then let participants work hands-on. Walk the room and help with hooks — they're the trickiest part.

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

### Step 1: Review the Instruction Templates

Open and read the reference templates provided in the workshop repo:

- `templates/instructions/code-review.md` — Code quality review criteria
- `templates/instructions/security-review.md` — Security analysis criteria (OWASP Top 10)

> **NOTE:** These files in `templates/` are **reference examples only** — they are not consumed by VS Code or Copilot. In the next step, you will create the actual instructions file under `.github/instructions/`, which is the path Copilot recognizes.

These files define the detailed review checklists that Copilot will follow.

### Step 2: Create an Instructions File for VS Code

Create a custom instructions file that VS Code will pick up:

```bash
mkdir -p .github/instructions
```

Create `.github/instructions/review-standards.instructions.md`:

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
| Templates reviewed | You've read both `templates/instructions/` files |
| Instructions file created | `.github/instructions/review-standards.instructions.md` exists |
| Instructions active | Copilot follows review standards when you chat about `.js` files |

---

## Part B: Create a Custom Agent (25 min)

Now that your project has instructions (the standards), create an **agent** (the persona) that uses them. An agent gives you an on-demand, structured reviewer you invoke by name — with a specific output format, tool permissions, and behavioral framing that instructions alone don't provide.

> **When is an agent worth it?** When you find yourself repeatedly typing the same complex prompt (e.g., "review this file for security issues and produce a severity table"). The agent encapsulates that prompt so you just type `@code-review`.

### Step 4: Create the Agent Directory

In your terminal (inside the workshop repository root):

```bash
mkdir -p .github/agents
```

### Step 5: Create the Agent File

Create the file `.github/agents/code-review.agent.md` with the following content:

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

### Step 6: Verify the Agent Appears in VS Code

1. Open the **Copilot Chat** panel (`Ctrl+Shift+I` / `Cmd+Shift+I`)
2. In the chat input box, type `@`
3. You should see **code-review** listed among the available agents
4. If it doesn't appear, try reloading VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Agent file exists | `.github/agents/code-review.agent.md` is created |
| Agent visible in Chat | Typing `@` shows `code-review` in the agent list |

---

## Part C: Create Agent Skills — Optional (15 min)

> **This part is optional.** Skills are useful when you have multiple agents that need to share the same domain knowledge. With a single agent, the logic in your `.agent.md` file and `.instructions.md` file already covers what a skill would do. Complete this section to learn how skills work, or skip ahead to Part D.

Skills are focused capabilities that add domain knowledge to your agents. They define a reusable, structured workflow that any agent can reference.

> **When are skills worth it?** When you later create a second agent (e.g., `@security-only`) that needs the same scanning workflow as `@code-review`. The skill avoids duplicating that logic across agent files.

### Step 7: Review the Skill Templates

Open the reference skill templates in the workshop repo:

- `templates/skills/skill-code-review.md` — Code review skill definition
- `templates/skills/skill-security-analysis.md` — Security analysis skill definition

> **NOTE:** Like the instruction templates, these files in `templates/` are **reference examples**. The actual skill you create in the next step goes under `.github/skills/`, which is where Copilot looks for skills.

### Step 8: Create a Skill for VS Code

Create a skill directory and file:

```bash
mkdir -p .github/skills/review-and-scan
```

Create `.github/skills/review-and-scan/SKILL.md`:

```markdown
---
name: 'Review and Scan'
description: 'Combined code review and security scan skill that produces a unified report with findings sorted by severity'
---

# Review and Scan Skill

This skill performs both code review and security analysis in a single pass.

## Steps

1. Read the target file(s)
2. Analyze for code quality issues (naming, structure, duplication, error handling)
3. Scan for security vulnerabilities (OWASP Top 10, hardcoded secrets, injection)
4. Produce a unified report sorted by severity

## Report Format

The output should follow this structure:

### Summary
- Files reviewed: [count]
- Code quality findings: [count]
- Security findings: [count]
- Overall risk: CRITICAL / HIGH / MEDIUM / LOW

### Findings Table
| # | Severity | Category | File:Line | Issue | CWE |
|---|----------|----------|-----------|-------|-----|
| 1 | CRITICAL | Security | server.js:55 | SQL Injection | CWE-89 |

### Detailed Findings
[Full description with code fix for each finding]
```

### ✅ Checkpoint C (Optional)

| Check | Expected |
|-------|----------|
| Skill templates reviewed | You've read both `templates/skills/` files |
| Combined skill created | `.github/skills/review-and-scan/SKILL.md` exists |

---

## Part D: Create Copilot Hooks (25 min)

Hooks are shell commands or scripts that run automatically during Copilot agent lifecycle events. They provide deterministic guardrails — formatting, linting, security gates — that don't depend on the AI remembering to do it.

> **IMPORTANT:** These are **GitHub Copilot hooks** (for the Copilot coding agent), NOT Git hooks. They are defined in `.github/hooks/` and follow the [GitHub Copilot hooks specification](https://docs.github.com/en/copilot/reference/hooks-configuration).

### Step 9: Review the Hooks Configuration

The workshop repository already includes a hooks configuration. Open and examine:

**`.github/hooks/hooks.json`** — Defines three hook events:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [{
      "type": "command",
      "bash": ".github/hooks/scripts/log-context.sh",
      "cwd": ".",
      "timeoutSec": 5
    }],
    "postToolUse": [{
      "type": "command",
      "bash": ".github/hooks/scripts/post-review.sh",
      "cwd": ".",
      "timeoutSec": 30
    }],
    "agentStop": [{
      "type": "command",
      "bash": ".github/hooks/scripts/security-gate.sh",
      "cwd": ".",
      "timeoutSec": 15
    }]
  }
}
```

| Event | Script | Purpose |
|-------|--------|---------|
| `sessionStart` | `log-context.sh` | Log session metadata to `logs/copilot/session.log` |
| `postToolUse` | `post-review.sh` | Run formatter/linter after agent edits, append to report |
| `agentStop` | `security-gate.sh` | Check for CRITICAL findings and block if found |

### Step 10: Review the Hook Scripts

Open each script and understand what it does:

1. **`.github/hooks/scripts/log-context.sh`** — Reads JSON context from stdin, writes structured log entry with timestamp and working directory. Safe: does not log sensitive data.

2. **`.github/hooks/scripts/post-review.sh`** — Runs Prettier and ESLint (if available), appends a timestamped entry to `samples/findings/report.md`.

3. **`.github/hooks/scripts/security-gate.sh`** — Scans for CRITICAL patterns (eval, SQL injection), exits non-zero to block if found. Logs gate decision to `logs/copilot/security-gate.log`.

### How Copilot Hooks Help in Code Review & Security Analysis

The `@code-review` agent uses AI to find bugs and security issues — but AI can miss things. Hooks act as an **automatic safety net** that runs regardless of what the AI does.

| Hook | Event | What It Does | Why It Matters |
|------|-------|-------------|----------------|
| `log-context.sh` | `sessionStart` | Logs who ran the review, when, and where | Creates an **audit trail** for compliance — proof that reviews happened, without logging sensitive data |
| `post-review.sh` | `postToolUse` | Runs Prettier + ESLint, appends to `report.md` | Catches broken formatting or new lint errors from agent-suggested fixes; builds a running report **automatically** |
| `security-gate.sh` | `agentStop` | Scans for `eval()` on user input, SQL injection patterns | **Hard stop** — blocks the workflow with a non-zero exit if critical patterns are found, even if the AI missed them |

**Real-world flow:**

```
@code-review reviews server.js
  → [sessionStart] logs the session
  → Agent analyzes (AI)
  → [postToolUse] formats code, updates report
  → Agent finishes
  → [agentStop] scans for eval/SQL injection
  → ❌ CRITICAL found → BLOCKS workflow 🚨
```

**Why not rely on AI alone?**

| AI Only | AI + Hooks |
|---------|-----------|
| Might miss `eval()` buried in code | Hook **always** catches it — pattern matching, not judgment |
| No record of when reviews happened | Session log created **automatically** |
| Suggested fixes can break linting | ESLint runs after **every** edit |
| Developer can ignore AI warnings | Security gate **blocks** the workflow entirely |

> **Bottom line:** Hooks make security reviews **reliable and enforceable**, not just advisory.

### Step 11: Make Hook Scripts Executable

```bash
chmod +x .github/hooks/scripts/post-review.sh
chmod +x .github/hooks/scripts/security-gate.sh
chmod +x .github/hooks/scripts/log-context.sh
```

> **Windows users:** Scripts will execute via Git Bash or WSL. The `powershell` field in hooks.json can also be used for Windows-native execution.

### Step 12: Test a Hook Script Manually

You can test the security gate script directly:

```bash
echo '{}' | .github/hooks/scripts/security-gate.sh
```

**Expected output** (because `sample-app/server.js` contains eval and SQL injection):

```
🚨 SECURITY GATE FAILED: X critical finding(s) detected.
   Review the security report at: samples/findings/report.md
   Fix all CRITICAL issues before proceeding.
```

Test the log-context script:

```bash
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

### ✅ Checkpoint D

| Check | Expected |
|-------|----------|
| hooks.json reviewed | You understand the 3 hook events |
| Scripts reviewed | You've read all 3 scripts |
| Scripts executable | `chmod +x` applied (macOS/Linux) |
| Manual test | `security-gate.sh` exits with non-zero (detects vulnerabilities) |
| Log created | `logs/copilot/session.log` contains a JSON entry |

---

## Part E: Test the Agent (10 min)

### Step 13: Invoke the Agent on the Sample App

1. Open the Copilot Chat panel
2. Type:

```
@code-review Review the file sample-app/server.js for code quality and security issues. Provide a detailed report with severity levels and fix suggestions.
```

3. Wait for the agent to analyze the file

### Step 14: Review the Output

The agent should identify findings like:

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Security | SQL injection via string interpolation (line ~55) |
| 2 | CRITICAL | Security | eval() on user input (line ~73) |
| 3 | HIGH | Security | Hardcoded API key and password (lines ~21-22) |
| 4 | HIGH | Security | MD5 for password hashing (line ~87) |
| 5 | MEDIUM | Security | XSS — unsanitized user input in HTML (line ~101) |
| 6 | MEDIUM | Code Quality | Error details leaked to client (line ~59) |
| 7 | LOW | Code Quality | Secrets logged to console (line ~115) |

### Step 15: Test on utils.js

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
| Hooks configured | `hooks.json` + 3 scripts ready in `.github/hooks/` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent not showing in `@` list | Reload VS Code window; ensure file is at `.github/agents/code-review.agent.md` |
| Agent gives generic responses | Check the system prompt in the `.agent.md` file; make it specific |
| Hook scripts fail with "permission denied" | Run `chmod +x` on each script |
| Hook logs not created | Ensure the `logs/copilot/` directory is writable; create it with `mkdir -p` |
| Security gate passes unexpectedly | Check that `sample-app/server.js` still contains the original vulnerable code |
| Skills not recognized | Ensure the SKILL.md file has valid YAML frontmatter with `name` and `description` (Part C is optional) |

## Where Hook Logs Appear

- Session logs: `logs/copilot/session.log`
- Hook execution logs: `logs/copilot/hooks.log`
- Security gate decisions: `logs/copilot/security-gate.log`
- Report entries: `samples/findings/report.md`

## Cleanup / Reset

```bash
# Remove created files (keeps reference templates in templates/)
rm -rf .github/instructions/
rm -rf .github/agents/
rm -rf .github/skills/  # Only if you created skills (Part C)

# Reset logs
rm -rf logs/

# Reset generated reports
rm -f samples/findings/report.md
```

---

**Lab 1 complete!** Proceed to [Lab 2: Invocation from IDE & CLI →](lab-02-invocation-ide-cli.md)
