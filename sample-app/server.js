// =============================================================
// sample-app/server.js
// =============================================================
// WARNING: This file contains INTENTIONAL security vulnerabilities
// and code quality issues for workshop exercises.
// DO NOT use this code in production.
// =============================================================

const express = require("express");
const crypto = require("crypto");
const { processUserData, calculateDiscount, formatLog } = require("./utils");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------
// VULNERABILITY 1: Hardcoded API key / secret
// Severity: HIGH — CWE-798 (Use of Hard-coded Credentials)
// ---------------------------------------------------------------
const API_KEY = "sk-proj-abc123def456ghi789jkl012mno345pqr678";
const DB_PASSWORD = "SuperSecret123!";

// ---------------------------------------------------------------
// VULNERABILITY 2: SQL Injection via string concatenation
// Severity: CRITICAL — CWE-89 (SQL Injection)
// ---------------------------------------------------------------
const Database = require("better-sqlite3");
let db;

try {
  db = new Database(":memory:");
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);
  db.exec(`INSERT INTO users (username, email, password, role)
           VALUES ('admin', 'admin@example.com', 'admin123', 'admin')`);
  db.exec(`INSERT INTO users (username, email, password, role)
           VALUES ('alice', 'alice@example.com', 'password1', 'user')`);
} catch (err) {
  console.log("Database error: " + err);
}

app.get("/api/users/search", (req, res) => {
  const username = req.query.username;
  // BAD: Direct string interpolation in SQL query
  const query = `SELECT id, username, email, role FROM users WHERE username = '${username}'`;
  try {
    const rows = db.prepare(query).all();
    res.json(rows);
  } catch (err) {
    // VULNERABILITY: Leaking error details to client
    res.status(500).json({ error: err.message, query: query });
  }
});

// ---------------------------------------------------------------
// VULNERABILITY 3: eval() usage — CWE-95 (Code Injection)
// Severity: CRITICAL
// ---------------------------------------------------------------
app.post("/api/calculate", (req, res) => {
  const expression = req.body.expression;
  try {
    // BAD: Using eval on user input
    const result = eval(expression);
    res.json({ result: result });
  } catch (err) {
    res.status(400).json({ error: "Invalid expression" });
  }
});

// ---------------------------------------------------------------
// VULNERABILITY 4: Insecure password hashing (MD5)
// Severity: HIGH — CWE-328 (Use of Weak Hash)
// ---------------------------------------------------------------
app.post("/api/users/register", (req, res) => {
  const { username, email, password } = req.body;

  // BAD: MD5 is not suitable for password hashing
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  try {
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    );
    stmt.run(username, email, hashedPassword);
    res.status(201).json({ message: "User created", username });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ---------------------------------------------------------------
// VULNERABILITY 5: Missing input validation + XSS potential
// Severity: MEDIUM — CWE-79 (Cross-site Scripting)
// ---------------------------------------------------------------
app.post("/api/comments", (req, res) => {
  const comment = req.body.comment;
  const author = req.body.author;

  // BAD: No sanitization, no length check, no type check
  // Reflecting user input directly
  res.json({
    message: "Comment posted",
    html: `<div class="comment"><strong>${author}</strong>: ${comment}</div>`,
  });
});

// ---------------------------------------------------------------
// CODE QUALITY ISSUE: Overly complex, no error handling
// ---------------------------------------------------------------
app.get("/api/report", (req, res) => {
  const type = req.query.type;
  const data = processUserData(type);
  const discounted = calculateDiscount(data, 0.15, true, "USD", null, 2);
  console.log("Report generated: " + formatLog(data));
  res.json(data);
});

// ---------------------------------------------------------------
// Start server
// ---------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Key: ${API_KEY}`); // BAD: Logging secrets
});

module.exports = app;
