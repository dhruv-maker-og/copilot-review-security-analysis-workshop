# Lab 4: Code Review with Copilot on GitHub.com

> **Time estimate:** 30 minutes
> **Instructor note:** This lab is entirely browser-based — no local tools required. Share your screen for the first walkthrough, then let participants follow along.

---

## Objective

Use the GitHub.com pull request workflow to request **Copilot as a code reviewer**. You will verify that the custom review instructions created in Lab 1 are available on GitHub, create a pull request with intentional vulnerabilities, and observe how Copilot reviews the code using your configured review priorities.

---

## Prerequisites

- [ ] [Lab 1](lab-01-custom-agent-ide.md) completed (custom instructions file created)
- [ ] Repository pushed to GitHub.com
- [ ] **GitHub Copilot Business or Enterprise** license active on the repository
- [ ] Copilot code review enabled for the repository or organization (see [GitHub docs](https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review))

---

## Part A: Verify Custom Review Instructions on GitHub (10 min)

The `review-standards.instructions.md` file you created in Lab 1 defines how Copilot prioritizes issues during code review — **CRITICAL** (block merge), **IMPORTANT** (requires discussion), and **SUGGESTION** (non-blocking). When this file is present on the repository's default branch, Copilot code review on GitHub.com automatically applies these priorities to pull request reviews.

### Step 1: Confirm the Instructions File Is on GitHub

1. Open your repository on **GitHub.com** in a browser
2. Navigate to `.github/instructions/` in the file tree
3. Verify that **`review-standards.instructions.md`** is listed

> **NOTE:** The file must be on the **default branch** (usually `main`) for Copilot to pick it up during pull request reviews. If you see the file locally but not on GitHub.com, proceed to Step 2.

### Step 2: Push the Instructions File (if needed)

If the file is **not visible** on GitHub.com, you need to push your local changes. Open a terminal and run:

```bash
git add .github/instructions/review-standards.instructions.md
git commit -m "Add custom review instructions for Copilot"
git push origin main
```

Alternatively, you can create the file directly on GitHub.com:

1. Click **Add file → Create new file** in the repository
2. Set the file path to `.github/instructions/review-standards.instructions.md`
3. Paste the following content:

````markdown
---
description: 'Code review and security standards for this project'
applyTo: '**/*.js'
---

# Generic Code Review Instructions

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

1. **Be specific**: Reference exact lines, files, and provide concrete examples
2. **Provide context**: Explain WHY something is an issue and the potential impact
3. **Suggest solutions**: Show corrected code when applicable, not just what's wrong
4. **Be constructive**: Focus on improving the code, not criticizing the author
````

4. Click **Commit changes** → commit directly to `main`

### ✅ Checkpoint A

| Check | Expected |
|-------|----------|
| Instructions file visible on GitHub.com | `.github/instructions/review-standards.instructions.md` exists on `main` branch |
| File contains YAML frontmatter | `applyTo: '**/*.js'` is present |
| Review priorities defined | CRITICAL, IMPORTANT, and SUGGESTION sections are present |

---

## Part B: Create a Pull Request with Sample Changes (10 min)

You will now create a branch and add intentionally vulnerable code — entirely through the GitHub.com web interface — then open a pull request for Copilot to review.

### Step 3: Create a New Branch via the GitHub.com UI

1. On your repository's main page, click the **branch selector** dropdown (shows `main`)
2. Type a new branch name: `feature/add-auth-endpoint`
3. Click **Create branch: feature/add-auth-endpoint from main**

### Step 4: Add Vulnerable Code to the Sample App

1. While on the `feature/add-auth-endpoint` branch, navigate to **`sample-app/server.js`**
2. Click the **pencil icon** (✏️) to edit the file
3. Scroll to the bottom of the file, just **before** the line `module.exports = app;`
4. Paste the following code block:

```javascript
// --- New authentication endpoint ---
const jwt = require("jsonwebtoken");

const JWT_SECRET = "my-super-secret-key-12345";

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  try {
    const user = db.prepare(query).get();
    if (user) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ token: token, message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message, query: query });
  }
});

app.get("/api/admin/users", (req, res) => {
  const rows = db.prepare("SELECT * FROM users").all();
  res.json(rows);
});
```

> **What's wrong with this code?** There are several intentional issues for Copilot to find:
>
> | # | Issue | Severity |
> |---|-------|----------|
> | 1 | **Hardcoded JWT secret** — `JWT_SECRET` is a string literal in source code | HIGH |
> | 2 | **SQL injection** — `username` and `password` are interpolated directly into the query | CRITICAL |
> | 3 | **Error detail leakage** — the raw SQL query is returned in error responses | MEDIUM |
> | 4 | **No authentication on admin endpoint** — `/api/admin/users` exposes all user data without any auth check | HIGH |
> | 5 | **Password stored/compared in plaintext** — passwords are not hashed before comparison | HIGH |

5. Click **Commit changes**
6. In the commit dialog:
   - **Commit message:** `Add authentication endpoint and admin route`
   - Select **Commit directly to the `feature/add-auth-endpoint` branch**
   - Click **Commit changes**

### Step 5: Create the Pull Request

1. After committing, GitHub will show a banner: **"feature/add-auth-endpoint had recent pushes — Compare & pull request"**. Click it.
   > If the banner is not visible, go to the **Pull requests** tab and click **New pull request**, then select `feature/add-auth-endpoint` as the compare branch.
2. Fill in the pull request details:
   - **Title:** `Add user authentication endpoint`
   - **Description:**

     ```
     ## Description
     Adds a new `/api/auth/login` endpoint for user authentication using JWT tokens.
     Also adds an admin endpoint to list all users.

     ## Changes
     - `sample-app/server.js` — Added login route with JWT token generation
     - `sample-app/server.js` — Added admin user listing endpoint

     ## What to Test
     1. POST `/api/auth/login` with valid credentials returns a JWT token
     2. POST `/api/auth/login` with invalid credentials returns 401
     3. GET `/api/admin/users` returns the user list
     ```

3. Click **Create pull request**

---

## Part C: Request Copilot Code Review (10 min)

### Step 6: Request Copilot as a Reviewer

1. On the pull request page, look at the **right sidebar** under **Reviewers**
2. Click the **gear icon** (⚙️) next to Reviewers
3. In the search box, type **`Copilot`**
4. Select **Copilot** from the dropdown to add it as a reviewer

> **TIP:** If Copilot does not appear in the reviewer list, your organization or repository may not have Copilot code review enabled. See the [Troubleshooting](#troubleshooting) section below.

Copilot will begin analyzing the pull request. This typically takes 30–60 seconds.

### Step 7: Review Copilot's Inline Comments

Once the review is complete, you will see:

- A **review summary** from Copilot in the pull request conversation tab
- **Inline comments** on the changed lines in the **Files changed** tab

1. Click on the **Files changed** tab to see Copilot's inline review comments
2. Examine the comments — each one typically includes:
   - **Severity level** — aligned with the CRITICAL / IMPORTANT / SUGGESTION priorities from your `review-standards.instructions.md`
   - **Description** of the issue and why it matters
   - **Suggested fix** with corrected code (when applicable)
   - **CWE reference** for security issues (e.g., CWE-89 for SQL injection)

**Expected findings:** Copilot should flag most or all of the following:

| # | Expected Finding | Severity |
|---|-----------------|----------|
| 1 | Hardcoded JWT secret (`JWT_SECRET`) | 🔴 CRITICAL / HIGH |
| 2 | SQL injection in login query | 🔴 CRITICAL |
| 3 | Leaking SQL query in error response | 🟡 IMPORTANT / MEDIUM |
| 4 | Admin endpoint has no authentication | 🔴 CRITICAL / HIGH |
| 5 | Plaintext password comparison | 🟡 IMPORTANT / HIGH |

> **NOTE:** Copilot may generate additional findings or slightly different severity levels depending on the model version. The important thing is that the review reflects the priority categories defined in your custom instructions.

### Step 8: Interact with the Review

Explore the different ways you can respond to Copilot's review comments:

1. **Apply a suggested fix** — If Copilot provides a code suggestion, click **Commit suggestion** to apply it directly
2. **Reply to a comment** — Ask Copilot a follow-up question directly in the comment thread (e.g., "Can you show me how to use parameterized queries here?")
3. **Resolve a comment** — Click **Resolve conversation** after addressing a finding
4. **Dismiss the review** — If needed, you can dismiss Copilot's review from the Reviewers section

> **TIP:** You can request a re-review after making changes. Push new commits or click the 🔄 **re-request review** icon next to Copilot in the Reviewers section.

### ✅ Checkpoint B

| Check | Expected |
|-------|----------|
| Copilot added as reviewer | Copilot appears in the Reviewers section of the PR |
| Review comments posted | At least 3 inline comments on the changed code |
| SQL injection flagged | The `SELECT * FROM users WHERE username = '${username}'` line has a comment |
| Hardcoded secret flagged | The `JWT_SECRET` line has a comment |
| Severity levels match instructions | Comments use priority categories consistent with `review-standards.instructions.md` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Copilot does not appear in the reviewer list | Copilot code review must be enabled for your organization or repository. Ask your admin to enable it under **Settings → Copilot → Code review** |
| Copilot review is pending for a long time | Wait up to 2 minutes. If no review appears, try removing and re-adding Copilot as a reviewer |
| No inline comments appear | Check the **Files changed** tab — comments show on specific lines, not in the conversation tab. Also verify the PR has actual code changes (not just whitespace) |
| Review comments do not match custom instructions | Verify `review-standards.instructions.md` is on the **default branch** (`main`), not only on the feature branch. The file must be merged to `main` for Copilot to use it |
| "Copilot code review is not available" message | Ensure you have a **Copilot Business or Enterprise** license. The free Copilot tier does not include code review on PRs |

---

## Cleanup / Reset

To clean up after this lab:

1. On GitHub.com, navigate to the pull request you created
2. Click **Close pull request** at the bottom of the conversation tab
3. After closing, click **Delete branch** to remove `feature/add-auth-endpoint`

---

**Lab 4 complete!** You have now used Copilot as a code reviewer on GitHub.com — from verifying custom instructions, to creating a pull request, to reviewing and interacting with Copilot's findings.

Return to the [Workshop Overview](../workshop-overview.md) for wrap-up and next steps.
