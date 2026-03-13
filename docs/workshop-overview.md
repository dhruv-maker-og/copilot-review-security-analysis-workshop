# Workshop Overview

> **Workshop Title:** GitHub Copilot Code Review & Security Analysis Agents
> **Duration:** ~5 hours (adjustable for half-day or full-day delivery)
> **Audience:** Beginner-to-intermediate engineers familiar with VS Code and basic Git workflows

---

## Workshop Description

This workshop teaches participants to build, configure, and run AI-powered code review and security analysis agents using three modalities of GitHub Copilot:

1. **IDE Customization** — Custom agents, skills, custom instructions, and Copilot hooks
2. **CLI Invocation** — Command-line agent execution with GitHub Actions CI/CD integration
3. **SDK Automation** — Programmatic agent execution using the Copilot SDK for Node.js

Participants work with a realistic sample application that contains intentional code quality issues and security vulnerabilities, giving them hands-on experience with real-world review and analysis workflows.

---

## Agenda

### Phase 1: Configuration and Setup (~60 minutes)

| Section | Time | Content | Instructor Notes |
|---------|------|---------|-----------------|
| Welcome & Overview | 10 min | Workshop goals, agenda walkthrough, icebreaker | Set expectations: this is hands-on, ask questions anytime |
| [Licenses & Access](setup/01-licenses-and-access.md) | 10 min | Verify GitHub Copilot license and repo access | Survey room: who has Copilot active already? |
| [VS Code & Extensions](setup/02-vscode-and-extension.md) | 15 min | Install/verify VS Code, Copilot, Copilot Chat | Help anyone stuck on sign-in flow |
| [Node.js Install](setup/03-nodejs-install.md) | 10 min | Install Node.js 20+ LTS, tsx | Suggest nvm/fnm for version management |
| [Copilot CLI Install](setup/04-copilot-cli-install-auth.md) | 15 min | Install GH CLI, Copilot extension, authenticate | Most common blocker: missing copilot scope |
| [Validation Checks](setup/05-validation-checks.md) | 10 min | Run consolidated checklist | Stop here until everyone passes |

> **Instructor checkpoint:** Do not proceed until all participants pass the validation checks. Use the automated validation script to quickly identify who needs help.

### Phase 2: Exercises (~3.5 hours)

| Exercise | Time | Content | Instructor Notes |
|----------|------|---------|-----------------|
| [Lab 1: Custom Agent & Skills](labs/lab-01-custom-agent-ide.md) | 90 min | Build agent, instructions, skills, hooks | Demo first 10 min, then hands-on. Walk the room. |
| Break | 15 min | | |
| [Lab 2: IDE & CLI Invocation](labs/lab-02-invocation-ide-cli.md) | 60 min | Invoke from IDE, CLI, GitHub Actions workflows | Show workflow YAML before participants edit |
| Break | 10 min | | |
| [Lab 3: SDK Automation](labs/lab-03-sdk-automation.md) | 60 min | Copilot SDK agents in Node.js, runner scripts | Walk through the agent code structure together |

### Phase 3: Outcomes and Wrap-Up (~30 minutes)

| Section | Time | Content | Instructor Notes |
|---------|------|---------|-----------------|
| Outcomes Review | 10 min | Review artifacts created, commands run, reports produced | Screen-share a completed participant's output |
| Discussion | 10 min | How would you apply this at work? What's next? | Encourage sharing use cases |
| Q&A | 10 min | Open questions, advanced topics | Point to references and docs |

---

## Learning Outcomes (Measurable)

By the end of the workshop, each participant will have:

| # | Outcome | Artifact / Evidence |
|---|---------|-------------------|
| 1 | Configured and validated Copilot in IDE and CLI | All validation checks pass (Step 5) |
| 2 | Built a custom code review agent with instructions, skills, and hooks | Agent file, instruction files, skill files, hooks.json, and hook scripts committed |
| 3 | Invoked agents from IDE and CLI, with GitHub Actions workflows | Agent used in Chat panel, CLI command executed, workflow YAML created |
| 4 | Automated code review and security analysis via SDK | `code-review-agent.ts` and `security-analysis-agent.ts` executed, report generated |

---

## Delivery Options

### Full Day (Recommended)

Deliver all three phases as written. Include generous break time and Q&A.

### Half Day (Condensed)

- **Option A:** Setup + Lab 1 + Lab 2 (skip SDK automation)
- **Option B:** Pre-complete setup, deliver all three labs

### Self-Paced

Distribute the repository and docs. Participants follow at their own pace. Include the [Troubleshooting Guide](troubleshooting.md) for independent resolution.

---

## Clean Room Reset Instructions

To reset the workshop environment and re-run labs from scratch:

```bash
# 1. Remove any created agent files
rm -rf .github/agents/

# 2. Reset hooks to the template state
git checkout -- .github/hooks/

# 3. Remove generated reports
rm -f samples/findings/report.md

# 4. Clean Node.js dependencies
rm -rf sample-app/node_modules sdk/nodejs/node_modules

# 5. Remove .env (token will need to be re-added)
rm -f .env

# 6. Reinstall dependencies
cd sample-app && npm install && cd ..
cd sdk/nodejs && npm install && cd ../..
```

Or simply re-clone the repository:

```bash
rm -rf copilot-review-security-workshop
git clone https://github.com/<your-org>/copilot-review-security-workshop.git
cd copilot-review-security-workshop
```

---

## Prerequisites Summary

See the [Setup Guides](setup/) for detailed instructions. Participants need:

- GitHub account with Copilot Business/Enterprise license
- VS Code with Copilot + Copilot Chat extensions
- Node.js 20+ with tsx
- GitHub CLI with Copilot extension, authenticated
- Git 2.x+

---

## References

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [About Copilot Hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [Awesome Copilot](https://github.com/github/awesome-copilot)
- [Copilot CLI Automation Accelerator](https://github.com/neildcruz/copilot-cli-automation-accelerator)
- [Copilot SDK Automation Accelerator](https://github.com/microsoft/Github-Copilot-SDK-Automation-Accelerator)
