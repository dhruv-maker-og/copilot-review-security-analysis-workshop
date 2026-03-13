# Sample Pull Request: Add User Authentication Endpoint

## Description

This PR adds a new `/api/auth/login` endpoint to the Express server. Users can authenticate with a username and password and receive a session token.

### Changes

- `sample-app/server.js` — Added login route with password verification
- `sample-app/utils.js` — Added `validateCredentials` helper function

### What to Test

1. POST `/api/auth/login` with valid credentials returns a 200 and a session token
2. POST `/api/auth/login` with invalid credentials returns a 401
3. Missing fields return a 400

### Notes

This is a **sample PR description** used during the workshop. It intentionally contains code with known vulnerabilities and quality issues so that the Copilot agents can demonstrate their review capabilities.

---

## Files Changed (for review)

### server.js — New login route

```javascript
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Look up user
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const user = db.prepare(query).get();

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Verify password
  const hash = crypto.createHash("md5").update(password).digest("hex");
  if (hash !== user.password_hash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate token
  const token = "session_" + Math.random().toString(36).substring(2);
  res.json({ token, username: user.username });
});
```

### utils.js — New validation helper

```javascript
function validateCredentials(username, password) {
  if (username == null) {
    return false;
  }
  if (username == "") {
    return false;
  }
  if (password == null) {
    return false;
  }
  if (password == "") {
    return false;
  }
  if (password.length < 4) {
    return false;
  }
  console.log("DEBUG: validating " + username);
  return true;
}
```

---

*Use this sample PR as input when testing the Copilot agents in Labs 1–3.*
