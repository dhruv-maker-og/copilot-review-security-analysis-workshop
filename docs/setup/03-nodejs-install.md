# Step 3: Node.js Install

> **Time estimate:** 10 minutes
> **Instructor note:** Participants on macOS/Linux may prefer nvm or fnm. Windows users can use the official installer or fnm.

## Objective

Install Node.js 20+ LTS and the `tsx` TypeScript runner, required for the SDK automation exercises.

## Steps

### 1. Install Node.js 20+ LTS

Choose your preferred method:

#### Option A: Official Installer (All Platforms)

Download from [https://nodejs.org/](https://nodejs.org/) — choose the **LTS** version (20.x or newer).

#### Option B: Using nvm (macOS / Linux)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Restart your terminal, then:
nvm install 20
nvm use 20
```

#### Option C: Using fnm (All Platforms)

```bash
# Install fnm (Fast Node Manager)
# macOS / Linux:
curl -fsSL https://fnm.vercel.app/install | bash

# Windows (PowerShell):
winget install Schniz.fnm

# Then install Node.js:
fnm install 20
fnm use 20
```

### 2. Verify Node.js Installation

```bash
node -v
```

**Expected output:**
```
v20.x.x   (or v22.x.x — any 20+ version)
```

```bash
npm -v
```

**Expected output:**
```
10.x.x   (or newer)
```

### 3. Install tsx Globally

`tsx` is a zero-config TypeScript runner. We use it to run the Copilot SDK agents without a build step.

```bash
npm install -g tsx
```

Verify the installation:

```bash
tsx --version
```

**Expected output:**
```
tsx v4.x.x
```

### 4. Quick Test

Create a temporary test file and run it:

```bash
echo "console.log('Node.js is working!');" > /tmp/test-node.js
node /tmp/test-node.js
```

**Expected output:**
```
Node.js is working!
```

> **Windows users:** Use `echo console.log('Node.js is working!'); > %TEMP%\test-node.js` and `node %TEMP%\test-node.js` instead.

## Done / Not Done

| Criteria | ✅ Done | ❌ Not Done |
|----------|---------|-------------|
| Node.js installed | `node -v` returns v20+ | Command not found or old version |
| npm available | `npm -v` returns v10+ | Command not found |
| tsx installed | `tsx --version` returns v4+ | Command not found |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: command not found` | Restart your terminal after installation |
| Node.js version < 20 | Use `nvm install 20` or download the latest LTS |
| `npm install -g` permission error | On Linux/macOS, use `sudo npm install -g tsx` or fix npm permissions |
| `tsx: command not found` after install | Check that npm global bin is in your PATH: `npm config get prefix` |

---

**Next:** [Step 4: Copilot CLI Install & Auth →](04-copilot-cli-install-auth.md)
