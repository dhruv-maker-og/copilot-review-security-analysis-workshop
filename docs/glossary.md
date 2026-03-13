# Glossary

Quick reference for terms used throughout this workshop.

---

| Term | Definition |
|------|-----------|
| **Agent** | A custom AI persona defined in an `.agent.md` file with YAML frontmatter. Agents have a name, description, available tools, and a system prompt that shapes their behavior. |
| **Agent File** | A Markdown file (e.g., `code-review.agent.md`) stored in `.github/agents/` that defines a custom Copilot agent. Uses YAML frontmatter for metadata and Markdown body for the system prompt. |
| **Copilot Chat** | The VS Code Chat panel where you interact with GitHub Copilot conversationally. Custom agents appear here as selectable personas. |
| **Copilot CLI** | A GitHub CLI extension (`gh copilot`) that provides AI-powered command-line suggestions, code explanations, and agent execution from the terminal. |
| **Copilot SDK** | The `@github/copilot-sdk` Node.js package for building programmatic AI agents. Provides `CopilotClient`, `defineTool`, and session management APIs. |
| **Custom Instructions** | Markdown files that provide additional context and rules to Copilot agents. Stored in `.github/instructions/` for Copilot to pick up. Reference templates are provided in `templates/instructions/`. |
| **CWE** | Common Weakness Enumeration — a standardized list of software security weaknesses (e.g., CWE-89 for SQL Injection). Used in security analysis findings. |
| **defineTool** | A Copilot SDK function for registering custom tools that agents can invoke. Each tool has a name, description, JSON Schema parameters, and an async handler function. |
| **GitHub Actions** | GitHub's CI/CD platform for automating workflows. In this workshop, used to run code review and security analysis agents on pull requests. |
| **Hook** | A shell command or script that runs automatically during Copilot agent lifecycle events (e.g., after tool use, when agent stops). Defined in `.github/hooks/*.json` files. NOT the same as Git hooks. |
| **hooks.json** | A JSON configuration file in `.github/hooks/` that maps lifecycle events to shell commands. Follows the [GitHub Copilot hooks specification](https://docs.github.com/en/copilot/reference/hooks-configuration). |
| **Lifecycle Events** | Specific moments during a Copilot agent session: `sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `agentStop`. Hooks can fire on these events. |
| **MCP** | Model Context Protocol — an open protocol for connecting AI models to external tools and data sources. Used by Copilot SDK agents to access GitHub APIs. |
| **OWASP Top 10** | The Open Web Application Security Project's list of the 10 most critical web application security risks (e.g., Injection, Broken Authentication, XSS). |
| **Reusable Workflow** | A GitHub Actions workflow designed to be called by other workflows using `uses:`. Enables consistent CI/CD patterns across repositories. |
| **SARIF** | Static Analysis Results Interchange Format — a JSON-based format for static analysis tool output. Can be uploaded to GitHub Code Scanning. |
| **Skill** | A focused capability defined in a Markdown file that describes a specific task an agent can perform. Skills add domain knowledge to agents. |
| **System Prompt** | The instruction text provided to an AI model that shapes its behavior, persona, and output format. In agent files, this is the Markdown body below the YAML frontmatter. |
| **tsx** | A zero-config TypeScript runner for Node.js. Used in this workshop to execute `.ts` agent files without a build step: `npx tsx agent.ts`. |
| **Workflow Dispatch** | A GitHub Actions trigger (`workflow_dispatch`) that allows manual execution of a workflow from the GitHub UI with optional input parameters. |
