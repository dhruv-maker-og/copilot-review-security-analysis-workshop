# Copilot SDK Agents — Node.js

This directory contains two Copilot SDK agents written in TypeScript:

| Agent | File | Purpose |
|-------|------|---------|
| Code Review | `code-review-agent.ts` | Analyzes code for quality, style, complexity, and maintainability issues |
| Security Analysis | `security-analysis-agent.ts` | Scans code for OWASP Top 10 vulnerabilities with CWE references |

## Prerequisites

- Node.js 20+ (`node -v`)
- tsx 4+ (`npx tsx --version`)
- `GITHUB_TOKEN` environment variable set with Copilot API access

## Quick Start

```bash
# Install dependencies
npm install

# Run the code review agent
npx tsx code-review-agent.ts

# Run the security analysis agent
npx tsx security-analysis-agent.ts
```

## SDK Patterns Used

### CopilotClient

The entry point for the SDK. Creates a client that communicates with the Copilot API.

```typescript
import { CopilotClient } from "@github/copilot-sdk";
const client = new CopilotClient();
```

### defineTool

Defines a tool that the agent can call. Each tool has a name, description, JSON Schema parameters, and an async handler.

```typescript
import { defineTool } from "@github/copilot-sdk";

const myTool = defineTool("tool_name", {
  description: "What this tool does",
  parameters: {
    type: "object",
    properties: { /* JSON Schema */ },
    required: ["param1"],
  },
  handler: async ({ param1 }) => {
    return { result: "..." };
  },
});
```

### createSession

Creates an interactive session with a model, tools, and system prompt.

```typescript
const session = await client.createSession({
  model: "gpt-4o",
  streaming: true,
  tools: [myTool],
  systemPrompt: "You are an expert...",
});
```

### Event Handling

Listen for events during the session:

```typescript
session.on("assistant.message_delta", (event) => {
  process.stdout.write(event.data.deltaContent);
});

session.on("tool.call", (event) => {
  console.log(`Calling: ${event.data.toolName}`);
});
```

### sendAndWait

Send a prompt and wait for the full response (including tool calls):

```typescript
await session.sendAndWait({ prompt: "Analyze this code..." });
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | — | GitHub token with Copilot API access |
| `COPILOT_MODEL` | No | `gpt-4o` | Model to use for the agent session |

## Project Structure

```
sdk/nodejs/
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── code-review-agent.ts       # Code review agent
├── security-analysis-agent.ts # Security analysis agent
└── README.md                  # This file
```

## Related

- [Lab 3: SDK Automation](../../docs/labs/lab-03-sdk-automation.md) — Step-by-step lab exercise
- [Automation Runner](../../automation/README.md) — Run agents via shared script
- [Glossary](../../docs/glossary.md) — Key terms and definitions
