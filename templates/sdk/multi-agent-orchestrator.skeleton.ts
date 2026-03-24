/**
 * Multi-Agent Orchestrator — SKELETON FILE (Lab 5)
 *
 * Your task: complete the two TODO sections below to implement
 * the fan-out dispatch and the finding aggregation/deduplication.
 *
 * The sub-agent functions (codeReviewSubAgent, securitySubAgent) are
 * provided for you — they contain the same logic you saw in Lab 3.
 *
 * When you are done, copy this file to sdk/nodejs/multi-agent-orchestrator.ts
 * (or compare with the reference implementation in the same directory).
 *
 * Usage:  npx tsx multi-agent-orchestrator.ts
 */

import { CopilotClient, defineTool, approveAll } from '@github/copilot-sdk';
import * as readline from 'node:readline/promises';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stdin as input, stdout as output } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Sub-Agent Types
// ---------------------------------------------------------------------------

interface CodeFinding {
  line: number | null;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

interface CodeReviewResult {
  language: string;
  totalLines: number;
  findings: CodeFinding[];
  summary: string;
}

interface SecurityFinding {
  line: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cwe: string;
  owaspCategory: string;
  title: string;
  description: string;
}

interface SecurityScanResult {
  language: string;
  context: string;
  totalLines: number;
  findings: SecurityFinding[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
}

// ---------------------------------------------------------------------------
// Sub-Agent: Code Review  (provided — same logic as Lab 3)
// ---------------------------------------------------------------------------

async function codeReviewSubAgent(
  code: string,
  language: string
): Promise<CodeReviewResult> {
  const lines = code.split('\n');
  const findings: CodeFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    if (/console\.(log|debug|info)\(/.test(line))
      findings.push({ line: lineNum, category: 'style', severity: 'low', message: `Line ${lineNum}: Debug logging left in code — remove or replace with a logger` });
    if (/\bvar\b/.test(line))
      findings.push({ line: lineNum, category: 'style', severity: 'low', message: `Line ${lineNum}: Use 'const' or 'let' instead of 'var'` });
    if (line.length > 120)
      findings.push({ line: lineNum, category: 'style', severity: 'low', message: `Line ${lineNum}: Line exceeds 120 characters (${line.length} chars)` });
    if (/\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK/i.test(line))
      findings.push({ line: lineNum, category: 'maintainability', severity: 'low', message: `Line ${lineNum}: Unresolved TODO/FIXME/HACK comment` });
    if (/\bcatch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(line))
      findings.push({ line: lineNum, category: 'error-handling', severity: 'medium', message: `Line ${lineNum}: Empty catch block — handle or rethrow the error` });
    if (/(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"]{1}[^'"]{8,}['"]{1}/i.test(line))
      findings.push({ line: lineNum, category: 'security', severity: 'critical', message: `Line ${lineNum}: Hardcoded credential in source — use environment variables` });
  }

  let maxDepth = 0, depth = 0;
  for (const line of lines) {
    depth += (line.match(/{/g) || []).length;
    depth -= (line.match(/}/g) || []).length;
    maxDepth = Math.max(maxDepth, depth);
  }
  if (maxDepth > 4)
    findings.push({ line: null, category: 'complexity', severity: 'medium', message: `Code has nesting depth of ${maxDepth} — consider extracting functions` });

  const top = findings.some(f => f.severity === 'critical') ? 'CRITICAL'
    : findings.some(f => f.severity === 'high') ? 'HIGH'
    : findings.some(f => f.severity === 'medium') ? 'MEDIUM' : 'LOW';
  return { language, totalLines: lines.length, findings,
    summary: findings.length === 0 ? 'No quality issues detected.' : `Found ${findings.length} quality issue(s). Highest severity: ${top}.` };
}

// ---------------------------------------------------------------------------
// Sub-Agent: Security Analysis  (provided — same logic as Lab 3)
// ---------------------------------------------------------------------------

async function securitySubAgent(
  code: string,
  language: string,
  context?: string
): Promise<SecurityScanResult> {
  const appContext = context ?? 'general';
  const lines = code.split('\n');
  const findings: SecurityFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    if (/query\s*[=+]/i.test(line) && line.includes('${'))
      findings.push({ line: lineNum, severity: 'CRITICAL', cwe: 'CWE-89', owaspCategory: 'A03:2021 – Injection', title: 'SQL Injection', description: 'User input directly interpolated into SQL query. Use parameterized queries.' });
    if (/\beval\s*\(/.test(line))
      findings.push({ line: lineNum, severity: 'CRITICAL', cwe: 'CWE-95', owaspCategory: 'A03:2021 – Injection', title: 'Code Injection via eval()', description: 'eval() executes arbitrary code. Replace with a safe alternative.' });
    if (/(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"]{1}[^'"]{8,}['"]{1}/i.test(line))
      findings.push({ line: lineNum, severity: 'HIGH', cwe: 'CWE-798', owaspCategory: 'A02:2021 – Cryptographic Failures', title: 'Hardcoded Credential', description: 'Secret value hardcoded in source. Use environment variables or a secrets manager.' });
    if (/\bmd5\b|\bsha1\b/i.test(line) && /password|hash|crypt/i.test(line))
      findings.push({ line: lineNum, severity: 'HIGH', cwe: 'CWE-328', owaspCategory: 'A02:2021 – Cryptographic Failures', title: 'Weak Cryptographic Hash', description: 'MD5/SHA1 are not suitable for password hashing. Use bcrypt, scrypt, or Argon2.' });
    if (/innerHTML|\.html\(|document\.write/i.test(line))
      findings.push({ line: lineNum, severity: 'HIGH', cwe: 'CWE-79', owaspCategory: 'A03:2021 – Injection', title: 'Cross-Site Scripting (XSS)', description: 'Unescaped user input in HTML output. Sanitize all dynamic content.' });
    if (/\.\.\//.test(line) && /readFile|createReadStream|join.*req/i.test(line))
      findings.push({ line: lineNum, severity: 'HIGH', cwe: 'CWE-22', owaspCategory: 'A01:2021 – Broken Access Control', title: 'Path Traversal', description: 'User input used in file path without validation. Sanitize and restrict to allowed directories.' });
  }

  const riskLevel: SecurityScanResult['riskLevel'] = findings.some(f => f.severity === 'CRITICAL') ? 'CRITICAL'
    : findings.some(f => f.severity === 'HIGH') ? 'HIGH'
    : findings.length > 0 ? 'MEDIUM' : 'LOW';
  return { language, context: appContext, totalLines: lines.length, findings, riskLevel,
    summary: findings.length === 0 ? 'No security vulnerabilities detected.' : `Found ${findings.length} vulnerability(ies). Risk level: ${riskLevel}.` };
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

// ─── Tool 1: dispatch_all_agents ────────────────────────────────────────────
const dispatchAllAgents = defineTool('dispatch_all_agents', {
  description:
    'Dispatch the Code Review Sub-Agent and Security Analysis Sub-Agent in parallel ' +
    'against a code snippet. Returns combined raw findings from both agents.',
  parameters: {
    type: 'object' as const,
    properties: {
      code: { type: 'string', description: 'The source code to analyze' },
      language: { type: 'string', description: 'Programming language (e.g. javascript, typescript, python)' },
      context: {
        type: 'string',
        description: 'Application context: web-server, api, cli, library, or general',
        enum: ['web-server', 'api', 'cli', 'library', 'general'],
      },
    },
    required: ['code', 'language'],
  },
  handler: async ({
    code, language, context,
  }: { code: string; language: string; context?: string }) => {
    console.log('\n⚡ Dispatching sub-agents...');

    // TODO: Replace the two sequential calls below with a single Promise.all()
    //       so both sub-agents run CONCURRENTLY instead of one-after-the-other.
    //
    //  Hint:  const [codeReview, securityScan] = await Promise.all([
    //           codeReviewSubAgent(code, language),
    //           securitySubAgent(code, language, context),
    //         ]);
    //
    const codeReview    = await codeReviewSubAgent(code, language);   // ← replace
    const securityScan  = await securitySubAgent(code, language, context); // ← replace

    console.log(`✅ Code Review Sub-Agent:       ${codeReview.findings.length} finding(s)`);
    console.log(`✅ Security Analysis Sub-Agent: ${securityScan.findings.length} finding(s)\n`);
    return { codeReview, securityScan };
  },
});

// ─── Tool 2: aggregate_and_report ───────────────────────────────────────────
const aggregateAndReport = defineTool('aggregate_and_report', {
  description:
    'Merge findings from both sub-agents, deduplicate overlapping issues, rank by severity, ' +
    'and produce a unified markdown report.',
  parameters: {
    type: 'object' as const,
    properties: {
      codeReview:  { type: 'object', description: 'Result from Code Review Sub-Agent' },
      securityScan: { type: 'object', description: 'Result from Security Analysis Sub-Agent' },
      filename:    { type: 'string', description: 'Source filename (optional, for report header)' },
    },
    required: ['codeReview', 'securityScan'],
  },
  handler: async ({
    codeReview, securityScan, filename,
  }: { codeReview: CodeReviewResult; securityScan: SecurityScanResult; filename?: string }) => {
    const ts = new Date().toISOString();
    const label = filename ?? 'code snippet';

    // TODO: Implement deduplication.
    //       Hardcoded credentials are flagged by BOTH agents. Keep only the
    //       security finding (it has the CWE/OWASP reference).
    //
    //  Steps:
    //   1. Build a Set of line numbers from securityScan.findings
    //      e.g.  const secLines = new Set(securityScan.findings.map(f => f.line));
    //   2. Filter codeReview.findings to REMOVE entries where:
    //         f.category === 'security' AND f.line is in secLines
    //      e.g.  const dedupedCodeFindings = codeReview.findings.filter(...);
    //
    const dedupedCodeFindings = codeReview.findings; // ← replace with deduplication logic

    // TODO: Calculate overall risk.
    //       Should be CRITICAL if either agent found CRITICAL, HIGH if either found HIGH, etc.
    //
    const overallRisk = '🟡 MEDIUM'; // ← replace with actual calculation

    // Sort security findings by severity (CRITICAL first)
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sortedSecFindings = [...securityScan.findings].sort(
      (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
    );

    // Build the markdown report
    let report = '# Unified Code Analysis Report\n\n';
    report += `**Generated:** ${ts}  \n`;
    report += `**Target:** ${label}  \n`;
    report += `**Language:** ${codeReview.language}  \n`;
    report += `**Overall Risk:** ${overallRisk}\n\n`;
    report += '---\n\n## Summary\n\n';
    report += '| Agent | Findings |\n|-------|----------|\n';
    report += `| Code Review Sub-Agent | ${dedupedCodeFindings.length} issue(s) |\n`;
    report += `| Security Analysis Sub-Agent | ${sortedSecFindings.length} vulnerability(ies) |\n`;
    report += `| **Total (deduplicated)** | **${dedupedCodeFindings.length + sortedSecFindings.length}** |\n\n`;

    if (sortedSecFindings.length > 0) {
      report += '## Security Vulnerabilities\n\n';
      for (const f of sortedSecFindings) {
        const icon = f.severity === 'CRITICAL' ? '🔴' : f.severity === 'HIGH' ? '🟠' : '🟡';
        report += `### ${icon} [${f.severity}] ${f.title} — ${f.cwe}\n\n`;
        report += `**Line:** ${f.line}  \n**OWASP:** ${f.owaspCategory}  \n**Description:** ${f.description}\n\n`;
      }
    }
    if (dedupedCodeFindings.length > 0) {
      report += '## Code Quality Issues\n\n';
      for (const f of dedupedCodeFindings) {
        const icon = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟠' : f.severity === 'medium' ? '🟡' : '🟢';
        const lineRef = f.line !== null ? ` (line ${f.line})` : '';
        report += `- ${icon} **[${f.severity.toUpperCase()}]** ${f.message}${lineRef}\n`;
      }
      report += '\n';
    }
    if (sortedSecFindings.length === 0 && dedupedCodeFindings.length === 0)
      report += '> ✅ No issues found. Code looks clean!\n\n';

    return { report, totalFindings: dedupedCodeFindings.length + sortedSecFindings.length, overallRisk };
  },
});

// ─── Tool 3: save_report  (provided — no changes needed) ────────────────────
const saveReport = defineTool('save_report', {
  description: 'Save the unified analysis report as a markdown file in samples/findings/',
  parameters: {
    type: 'object' as const,
    properties: {
      report:   { type: 'string', description: 'The full markdown report content to save' },
      filename: { type: 'string', description: 'Output filename (without path). Defaults to multi-agent-report-<timestamp>.md' },
    },
    required: ['report'],
  },
  handler: async ({ report, filename }: { report: string; filename?: string }) => {
    const outFile = filename ?? `multi-agent-report-${Date.now()}.md`;
    const outPath = path.join(path.resolve(__dirname, '..', '..'), 'samples', 'findings', outFile);
    await fs.writeFile(outPath, report, 'utf8');
    return { saved: true, path: outPath, filename: outFile };
  },
});

// ---------------------------------------------------------------------------
// System prompt  (provided)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a multi-agent orchestration coordinator for code analysis.

When the user provides code to analyze, follow this pipeline:

1. DISPATCH — Call dispatch_all_agents with the code and language.
   Both sub-agents run in parallel and return their findings.

2. AGGREGATE — Call aggregate_and_report with the results from step 1.
   This merges, deduplicates, and ranks findings into a unified report.

3. RESPOND — Present the aggregated report directly in your final response.

4. SAVE (if requested) — Call save_report to write the report to disk.

Rules:
- Always run BOTH sub-agents before aggregating. Never skip one.
- Deduplication: if a hardcoded credential is flagged by both agents,
  keep only the security finding (it carries the CWE/OWASP reference).
- The GitHub MCP server is connected — you can also post PR review comments
  if the user provides a PR URL.`;

// ---------------------------------------------------------------------------
// Main  (provided)
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('\uD83E\uDD16 Multi-Agent Orchestrator starting...\n');
  const client = new CopilotClient();
  const session = await client.createSession({
    model: process.env.COPILOT_MODEL ?? 'gpt-4o',
    streaming: true,
    tools: [dispatchAllAgents, aggregateAndReport, saveReport],
    mcpServers: { github: { type: 'http', url: 'https://api.githubcopilot.com/mcp/', tools: ['*'] } },
    systemMessage: { mode: 'append', content: SYSTEM_PROMPT },
    onPermissionRequest: approveAll,
  });

  session.on('assistant.message_delta', (event) => { if (event.data?.deltaContent) process.stdout.write(event.data.deltaContent); });
  session.on('tool.execution_start',    (event) => { console.log(`\n\u2699\uFE0F  Calling tool: ${event.data.toolName}...`); });
  session.on('tool.execution_complete', (event) => { console.log(`\u2705 Tool completed: ${event.data.toolCallId}\n`); });

  const rl = readline.createInterface({ input, output });
  console.log("Type a prompt and press Enter. Type 'exit' to quit.\n");
  process.stdout.write('Assistant: ');
  await session.sendAndWait({ prompt: 'Hello! Introduce yourself as a multi-agent orchestrator and explain the parallel pipeline you coordinate.' }, 120000);
  console.log('\n');

  const PASTE_DELAY_MS = 150;
  let done = false;
  const collectInput = (): Promise<string | null> => new Promise((resolve) => {
    const lines: string[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    const flush = () => { rl.removeListener('line', onLine); rl.removeListener('close', onClose); resolve(lines.join('\n').trim() || null); };
    const onLine = (line: string) => {
      if (lines.length === 0) {
        if (line.trim().toLowerCase() === 'exit') { done = true; resolve(null); rl.close(); return; }
        if (line.trim() === '') { resolve(''); return; }
        process.stdout.write('> ');
      }
      lines.push(line);
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, PASTE_DELAY_MS);
    };
    const onClose = () => { done = true; resolve(null); };
    rl.on('line', onLine); rl.on('close', onClose);
  });

  while (!done) {
    process.stdout.write('> ');
    const prompt = await collectInput();
    if (prompt === null) { console.log('\n\uD83D\uDC4B Shutting down...'); break; }
    if (prompt === '') continue;
    console.log('');
    await session.sendAndWait({ prompt }, 120000);
    console.log('\n');
  }
  rl.close();
  await client.stop();
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });
