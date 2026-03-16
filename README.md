# GitHub Copilot Code Review & Security Analysis Workshop

> **Build a Code Review Agent and a Security Analysis Agent** using GitHub Copilot — across IDE customization, CLI invocation, and SDK automation.

This hands-on workshop teaches you to create, configure, and run AI-powered code review and security analysis agents using three modalities of GitHub Copilot:

1. **IDE Customization** — Custom agents, skills, instructions, and Copilot hooks in VS Code
2. **CLI Invocation** — Running agents from the command line and integrating with GitHub Actions workflows
3. **SDK Automation** — Programmatic agent execution using the Copilot SDK for Node.js

---

## Workshop Agenda

| Phase | Section | Duration | Description |
|-------|---------|----------|-------------|
| **Setup** | [Licenses & Access](docs/setup/01-licenses-and-access.md) | 10 min | Verify GitHub Copilot license and repository access |
| | [VS Code & Extensions](docs/setup/02-vscode-and-extension.md) | 15 min | Install VS Code and Copilot extensions |
| | [Node.js Install](docs/setup/03-nodejs-install.md) | 10 min | Install Node.js 20+ LTS and tsx |
| | [Copilot CLI Install & Auth](docs/setup/04-copilot-cli-install-auth.md) | 15 min | Install and authenticate GitHub Copilot CLI |
| | [Validation Checks](docs/setup/05-validation-checks.md) | 10 min | Run consolidated validation checklist |
| | [GHES Setup *(GHES only)*](docs/setup/06-ghes-setup.md) | 15 min | Additional configuration for GitHub Enterprise Server |
| **Exercise 1** | [Custom Agent & Skills on IDE](docs/labs/lab-01-custom-agent-ide.md) | 90 min | Build custom agent, instructions, skills, and hooks |
| **Exercise 2** | [Invocation from IDE & CLI](docs/labs/lab-02-invocation-ide-cli.md) | 60 min | Invoke agents from IDE, CLI, and GitHub Actions |
| **Exercise 3** | [SDK Automation](docs/labs/lab-03-sdk-automation.md) | 60 min | Automate code review and security analysis via Copilot SDK |
| **Wrap-up** | [Workshop Overview](docs/workshop-overview.md) | 30 min | Review outcomes, next steps, and Q&A |

**Total estimated time: ~5 hours** (adjust pace for your audience)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A GitHub account with **GitHub Copilot Business or Enterprise** license
- [ ] **VS Code** (latest stable version)
- [ ] **GitHub Copilot** and **GitHub Copilot Chat** VS Code extensions
- [ ] **Node.js 20+** LTS installed
- [ ] **GitHub CLI** (`gh`) installed and authenticated
- [ ] **Copilot CLI extension** installed (`gh extension install github/gh-copilot`)

See the [Setup Guides](docs/setup/) for step-by-step installation instructions.

---

## Learning Goals

By the end of this workshop, you will be able to:

1. **Configure and validate** GitHub Copilot in VS Code and CLI
2. **Build a custom agent** with custom instructions, skills, and post-agent code-review hooks
3. **Run code review and security review** from the IDE and Copilot CLI using reusable workflows
4. **Automate both code review and security analysis** via Copilot SDK (Node.js) and run it via scripts

---

## Repository Structure

```
├── README.md                          # This file — workshop entry point
├── .env.example                       # Template environment variables (no secrets)
│
├── .github/
│   ├── workflows/
│   │   ├── code-review.yml            # GitHub Actions: AI code review on PRs
│   │   └── security-analysis.yml      # GitHub Actions: AI security scan on PRs + schedule
│   └── hooks/
│       ├── hooks.json                 # Copilot hooks config (postToolUse, agentStop, sessionStart)
│       └── scripts/
│           ├── post-review.sh         # Hook: lint/format + append report links
│           ├── security-gate.sh       # Hook: fail on CRITICAL severity findings
│           └── log-context.sh         # Hook: write JSON context to logs for debugging
│
├── docs/
│   ├── workshop-overview.md           # Full agenda, instructor notes, time estimates
│   ├── troubleshooting.md             # Common issues and resolutions per phase
│   ├── glossary.md                    # Workshop terminology definitions
│   ├── setup/
│   │   ├── 01-licenses-and-access.md  # Verify GH Copilot license and access
│   │   ├── 02-vscode-and-extension.md # Install VS Code + Copilot extensions
│   │   ├── 03-nodejs-install.md       # Install Node.js 20+ and tsx
│   │   ├── 04-copilot-cli-install-auth.md  # Install + auth Copilot CLI
│   │   └── 05-validation-checks.md    # Consolidated validation checklist
│   └── labs/
│       ├── lab-01-custom-agent-ide.md      # Exercise 1: Custom agent, skills, hooks
│       ├── lab-02-invocation-ide-cli.md    # Exercise 2: IDE + CLI invocation + workflows
│       └── lab-03-sdk-automation.md        # Exercise 3: Copilot SDK automation (Node.js)
│
├── sample-app/                        # Node.js app with intentional vulnerabilities
│   ├── package.json
│   ├── server.js                      # Express server with security issues
│   ├── utils.js                       # Utility code with quality issues
│   └── test/
│       └── server.test.js             # Basic test suite
│
├── samples/
│   ├── pull-requests/
│   │   └── sample-pr-description.md   # Example PR description and diff
│   └── findings/
│       ├── code-review-example-output.md       # Expected code review output
│       └── security-analysis-example-output.md # Expected security analysis output
│
├── templates/                         # Reference templates (NOT consumed by Copilot directly)
│   ├── instructions/
│   │   ├── code-review.md             # Template: code review instruction criteria
│   │   └── security-review.md         # Template: security review instruction criteria
│   └── skills/
│       ├── skill-code-review.md       # Template: code review skill definition
│       └── skill-security-analysis.md # Template: security analysis skill definition
│
├── automation/
│   ├── copilot-sdk-runner.sh          # Bash runner: --usecase <name> --lang <lang>
│   ├── copilot-sdk-runner.ps1         # PowerShell runner (Windows)
│   └── README.md                      # Runner usage and examples
│
└── sdk/
    └── nodejs/
        ├── package.json               # @github/copilot-sdk + tsx
        ├── tsconfig.json              # TypeScript config
        ├── code-review-agent.ts       # SDK agent: code review
        ├── security-analysis-agent.ts # SDK agent: security analysis
        └── README.md                  # SDK project README
```

---

## Quick Start

```bash
# 1. Clone this repository
git clone https://github.com/<your-org>/copilot-review-security-workshop.git
cd copilot-review-security-workshop

# 2. Copy the environment template and add your token
cp .env.example .env
# Edit .env and set your GITHUB_TOKEN

# 3. Install the sample app dependencies
cd sample-app && npm install && cd ..

# 4. Install the SDK dependencies
cd sdk/nodejs && npm install && cd ../..

# 5. Follow the setup guides in docs/setup/ then start with Lab 1
```

---

## Safety Notes

> **IMPORTANT**: Never commit secrets or tokens to version control.

- Use **environment variables** for all sensitive values (see `.env.example`)
- The `.env` file is listed in `.gitignore` — never commit it
- Hook scripts are designed to **never echo secrets** to stdout/logs
- Review all generated reports before sharing externally

---

## References

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [About Copilot Hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)
- [Using Hooks with Copilot Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [Awesome Copilot — Hooks](https://github.com/github/awesome-copilot/tree/main/hooks)
- [Copilot CLI Automation Accelerator](https://github.com/neildcruz/copilot-cli-automation-accelerator)
- [Copilot SDK Automation Accelerator](https://github.com/microsoft/Github-Copilot-SDK-Automation-Accelerator)

---

## License

This workshop material is provided for educational purposes. See individual referenced repositories for their respective licenses.
