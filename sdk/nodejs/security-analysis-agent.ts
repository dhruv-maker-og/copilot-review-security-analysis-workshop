/**
 * Security Analysis Agent — GitHub Copilot SDK
 *
 * Scans source code for OWASP Top 10 vulnerabilities, CWE-classified
 * weaknesses, and security misconfigurations.
 *
 * Usage:  npx tsx security-analysis-agent.ts
 */

import { CopilotClient, defineTool, approveAll } from "@github/copilot-sdk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

const scanVulnerabilities = defineTool("scan_vulnerabilities", {
  description:
    "Scan a code snippet for security vulnerabilities including OWASP Top 10 and CWE-classified weaknesses",
  parameters: {
    type: "object" as const,
    properties: {
      code: {
        type: "string",
        description: "The source code to scan",
      },
      language: {
        type: "string",
        description: "Programming language of the code (e.g. javascript, typescript, python)",
      },
      context: {
        type: "string",
        description:
          "Additional context: web-server, api, cli, library, or general",
        enum: ["web-server", "api", "cli", "library", "general"],
      },
    },
    required: ["code", "language"],
  },
  handler: async ({
    code,
    language,
    context,
  }: {
    code: string;
    language: string;
    context?: string;
  }) => {
    const appContext = context ?? "general";
    const lines = code.split("\n");

    interface SecurityFinding {
      line: number;
      severity: string;
      cwe: string;
      title: string;
      description: string;
    }

    const findings: SecurityFinding[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // SQL Injection
      if (/\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)/i.test(line) ||
          /['"`]\s*\+\s*\w+.*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "CRITICAL",
          cwe: "CWE-89",
          title: "SQL Injection",
          description: "User input directly interpolated into SQL query. Use parameterized queries.",
        });
      }

      // eval() usage
      if (/\beval\s*\(/.test(line)) {
        findings.push({
          line: lineNum,
          severity: "CRITICAL",
          cwe: "CWE-95",
          title: "Code Injection via eval()",
          description: "eval() executes arbitrary code. Replace with a safe alternative.",
        });
      }

      // Hardcoded secrets
      if (/(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*[=:]\s*["'][^"']{8,}["']/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "HIGH",
          cwe: "CWE-798",
          title: "Hardcoded Credential",
          description: "Secret value hardcoded in source. Use environment variables or a secrets manager.",
        });
      }

      // Weak hashing
      if (/\bmd5\b|\bsha1\b/i.test(line) && /password|hash|crypt/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "HIGH",
          cwe: "CWE-328",
          title: "Weak Cryptographic Hash",
          description: "MD5/SHA1 are not suitable for password hashing. Use bcrypt, scrypt, or Argon2.",
        });
      }

      // XSS
      if (/innerHTML|\.html\(|document\.write/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "HIGH",
          cwe: "CWE-79",
          title: "Cross-Site Scripting (XSS)",
          description: "Unescaped user input in HTML output. Sanitize all dynamic content.",
        });
      }

      // Path traversal
      if (/\.\.\// .test(line) && /readFile|createReadStream|join.*req/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "HIGH",
          cwe: "CWE-22",
          title: "Path Traversal",
          description: "User input used in file path without validation. Sanitize and restrict to allowed directories.",
        });
      }
    }

    return {
      language,
      context: appContext,
      totalLines: lines.length,
      findingsCount: findings.length,
      findings,
      riskLevel:
        findings.some((f) => f.severity === "CRITICAL")
          ? "CRITICAL"
          : findings.some((f) => f.severity === "HIGH")
            ? "HIGH"
            : findings.length > 0
              ? "MEDIUM"
              : "LOW",
      summary:
        findings.length === 0
          ? "No security vulnerabilities detected."
          : `Found ${findings.length} vulnerability(ies). Risk level: ${findings.some((f) => f.severity === "CRITICAL") ? "CRITICAL" : "HIGH"}.`,
    };
  },
});

const prepareSecurityReport = defineTool("prepare_security_report", {
  description:
    "Prepare a structured security analysis report in markdown format with CWE references and remediation guidance",
  parameters: {
    type: "object" as const,
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            line: { type: "number" },
            severity: { type: "string" },
            cwe: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
          },
        },
        description: "List of security findings from the scan",
      },
      filename: {
        type: "string",
        description: "Name of the scanned file",
      },
      riskLevel: {
        type: "string",
        description: "Overall risk level: CRITICAL, HIGH, MEDIUM, or LOW",
        enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      },
    },
    required: ["findings", "riskLevel"],
  },
  handler: async ({
    findings,
    filename,
    riskLevel,
  }: {
    findings: Array<{
      line: number;
      severity: string;
      cwe: string;
      title: string;
      description: string;
    }>;
    filename?: string;
    riskLevel: string;
  }) => {
    const icon =
      riskLevel === "CRITICAL"
        ? "🔴"
        : riskLevel === "HIGH"
          ? "🟠"
          : riskLevel === "MEDIUM"
            ? "🟡"
            : "🟢";

    const header = filename
      ? `## ${icon} Security Analysis — \`${filename}\``
      : `## ${icon} Security Analysis`;

    const findingsBody = findings
      .map(
        (f, i) =>
          `### ${i + 1}. [${f.severity}] ${f.title} — ${f.cwe}
**Line:** ${f.line}
**Description:** ${f.description}
`
      )
      .join("\n");

    const report = `${header}

**Risk Level:** ${riskLevel}
**Vulnerabilities Found:** ${findings.length}

${findingsBody}

---
*Generated by Copilot SDK Security Analysis Agent*
`;

    return { markdown: report, riskLevel, findingsCount: findings.length };
  },
});

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an expert application security analyst. When the user provides code:

1. Use the scan_vulnerabilities tool to perform a thorough security scan.
2. Classify each finding by OWASP Top 10 category and CWE identifier.
3. Use the prepare_security_report tool to produce a structured markdown report.
4. For each vulnerability, provide:
   - A clear explanation of the risk
   - A concrete code example showing the fix
   - The OWASP Top 10 category it belongs to

OWASP Top 10 (2021) categories to check:
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection (SQL, XSS, command injection)
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable and Outdated Components
- A07: Identification and Authentication Failures
- A08: Software and Data Integrity Failures
- A09: Security Logging and Monitoring Failures
- A10: Server-Side Request Forgery (SSRF)

Rules:
- Always cite CWE identifiers (e.g., CWE-89 for SQL Injection).
- Prioritize findings: CRITICAL > HIGH > MEDIUM > LOW.
- Be specific — cite exact line numbers.
- Include remediation code examples.
- If no vulnerabilities are found, confirm the code is secure and explain why.`;

async function main(): Promise<void> {
  console.log("🔒 Security Analysis Agent starting...\n");

  const client = new CopilotClient();
  const model = process.env.COPILOT_MODEL ?? "gpt-4o";

  const session = await client.createSession({
    model,
    streaming: true,
    tools: [scanVulnerabilities, prepareSecurityReport],
    mcpServers: {
      github: {
        type: "http",
        url: "https://api.githubcopilot.com/mcp/",
        tools: ["*"],
      },
    },
    systemMessage: { mode: "append", content: SYSTEM_PROMPT },
    onPermissionRequest: approveAll,
  });

  console.log("Tools registered:");
  console.log("  - scan_vulnerabilities: Scan code for security vulnerabilities");
  console.log("  - prepare_security_report: Prepare a security analysis report\n");

  // Stream assistant responses to stdout
  session.on("assistant.message_delta", (event) => {
    if (event.data?.deltaContent) {
      process.stdout.write(event.data.deltaContent);
    }
  });

  session.on("tool.execution_start", (event) => {
    console.log(`\n⚙️  Calling tool: ${event.data.toolName}...`);
  });

  session.on("tool.execution_complete", (event) => {
    console.log(`✅ Tool completed: ${event.data.toolCallId}\n`);
  });

  // Interactive REPL with automatic multi-line paste detection
  const rl = readline.createInterface({ input, output });
  console.log("Type a prompt and press Enter to send (pasted multi-line input is auto-detected).");
  console.log("Type 'exit' to quit.\n");

  // Send an initial greeting so the agent introduces itself
  process.stdout.write("Assistant: ");
  await session.sendAndWait({
    prompt: "Hello! Introduce yourself and explain how you can help with security analysis.",
  }, 120000);
  console.log("\n");

  // Collect input lines; pasted text arrives within ms, so a short
  // timeout after the last line distinguishes paste from typing.
  const PASTE_DELAY_MS = 150;
  let done = false;

  const collectInput = (): Promise<string | null> =>
    new Promise((resolve) => {
      const lines: string[] = [];
      let timer: ReturnType<typeof setTimeout> | null = null;

      const flush = () => {
        rl.removeListener("line", onLine);
        rl.removeListener("close", onClose);
        const text = lines.join("\n").trim();
        resolve(text || null);
      };

      const onLine = (line: string) => {
        if (lines.length === 0) {
          if (line.trim().toLowerCase() === "exit") { done = true; resolve(null); rl.close(); return; }
          if (line.trim() === "") { resolve(""); return; }
          process.stdout.write("> ");
        }
        lines.push(line);
        if (timer) clearTimeout(timer);
        timer = setTimeout(flush, PASTE_DELAY_MS);
      };

      const onClose = () => { done = true; resolve(null); };

      rl.on("line", onLine);
      rl.on("close", onClose);
    });

  while (!done) {
    process.stdout.write("> ");
    const prompt = await collectInput();
    if (prompt === null) { console.log("\n👋 Shutting down Security Analysis Agent..."); break; }
    if (prompt === "") continue;
    console.log("");
    await session.sendAndWait({ prompt }, 120000);    console.log("\n");
  }

  rl.close();
  await client.stop();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
