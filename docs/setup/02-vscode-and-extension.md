# Step 2: VS Code and Extensions

> **Time estimate:** 15 minutes
> **Instructor note:** Most participants will already have VS Code. Focus on ensuring the Copilot extensions are installed and authenticated.

## Objective

Install Visual Studio Code and configure the GitHub Copilot extensions.

## Steps

### 1. Install VS Code

Download and install from [https://code.visualstudio.com/](https://code.visualstudio.com/)

- **Windows:** Download the `.exe` installer and run it
- **macOS:** Download the `.dmg` and drag to Applications
- **Linux:** Download the `.deb` or `.rpm` package, or use snap:
  ```bash
  sudo snap install code --classic
  ```

Verify the installation:

```bash
code --version
```

**Expected output:**
```
1.96.x (or newer)
<commit-hash>
x64
```

### 2. Install GitHub Copilot Extension

> **GHES users:** After installing the extensions, additional configuration is required to point VS Code at your GHES instance. See [Step 6: GHES Setup](06-ghes-setup.md#4-vs-code-copilot-extension-replaces-step-2-auth).

1. Open VS Code
2. Click the **Extensions** icon in the sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **"GitHub Copilot"**
4. Click **Install** on the extension by **GitHub**
5. After installation, you will be prompted to **Sign in with GitHub** — complete the sign-in flow

### 3. Install GitHub Copilot Chat Extension

1. In the Extensions panel, search for **"GitHub Copilot Chat"**
2. Click **Install** on the extension by **GitHub**
3. This extension enables the Chat panel where you will interact with custom agents

### 4. Verify Copilot is Active

After installing both extensions and signing in:

1. Look at the **bottom-right** of the VS Code status bar
2. You should see the **Copilot icon** (a small icon that looks like two overlapping brackets)
3. The icon should appear **without a strike-through** — this means Copilot is active

To test inline suggestions:

1. Create a new file called `test.js`
2. Type `function add(a, b) {` and press Enter
3. Copilot should suggest `return a + b;` as a ghost text completion
4. Press `Tab` to accept the suggestion
5. Delete the test file when done

To test Copilot Chat:

1. Open the Chat panel: **View → Chat** (or press `Ctrl+Shift+I` / `Cmd+Shift+I`)
2. Type: `What is GitHub Copilot?`
3. You should receive a response within a few seconds

## Expected Output

| Check | What You Should See |
|-------|-------------------|
| Status bar | Copilot icon active (no strike-through) |
| Inline suggestions | Ghost text appears as you type code |
| Chat panel | Copilot Chat responds to questions |

## Done / Not Done

| Criteria | ✅ Done | ❌ Not Done |
|----------|---------|-------------|
| VS Code installed | `code --version` returns a version | Command not found |
| Copilot extension | Extension appears in installed list | Extension missing |
| Copilot Chat extension | Extension appears in installed list | Extension missing |
| Signed in to GitHub | Copilot icon active in status bar | Icon has strike-through or missing |
| Chat works | Chat responds to a test question | No response or error |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Copilot icon has strike-through | Click the icon → Sign in to GitHub again |
| "Copilot is not available" | Verify your license (Step 1) and restart VS Code |
| Chat returns errors | Update both Copilot extensions to the latest version |
| No inline suggestions | Open Settings → search "Copilot" → ensure "Enable" is checked |
| Extension won't install | Check VS Code version — Copilot requires VS Code 1.90+ |

---

**Next:** [Step 3: Node.js Install →](03-nodejs-install.md)
