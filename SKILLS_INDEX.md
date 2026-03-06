# 🧠 UniZy AI Super-Index

This document serves as the local command center for all AI skills, prompts, and design intelligence integrated into the UniZy project. All resources are organized locally for maximum autonomy and quality.

## 📁 Repository Strategy
All specialized libraries are located in the parent directory: `/Users/omar1/Desktop/Business/UniZy/`
- [antigravity-awesome-skills](file:///Users/omar1/Desktop/Business/UniZy/antigravity-awesome-skills) (1000+ Skills)
- [get-shit-done](file:///Users/omar1/Desktop/Business/UniZy/get-shit-done) (Meta-Prompting)
- [ui-ux-pro-max-skill](file:///Users/omar1/Desktop/Business/UniZy/ui-ux-pro-max-skill) (Design Intelligence)

---

## ⚡ 1. Expert Skills (Instructions)
Expert "manuals" that I load to adopt specific best practices.

| Source | Location | Purpose |
| :--- | :--- | :--- |
| **Awesome Skills** | [antigravity-awesome-skills/skills/](file:///Users/omar1/Desktop/Business/UniZy/antigravity-awesome-skills/skills/) | 1000+ modules for Next.js, Prisma, Auth, etc. |
| **UI/UX Pro Max** | [.agent/skills/ui-ux-pro-max/SKILL.md](file://./.agent/skills/ui-ux-pro-max/SKILL.md) | Deep design intelligence and UX guidelines. |

**How to use:** When starting a task, ask me to "Load [Skill Name]" from these directories.

---

## 🤖 2. Intelligent Prompts (Agents)
Specialized "Roles" that provide specific workflows.

| Agent | Purpose | Prompt Location |
| :--- | :--- | :--- |
| **GSD Planner** | Decomposes phases into executable plans. | [.claude/agents/gsd-planner.md](file://./.claude/agents/gsd-planner.md) |
| **GSD Auditor** | Verifies work against the roadmap. | [.claude/agents/gsd-auditor.md](file://./.claude/agents/gsd-auditor.md) |
| **GSD Debugger** | Systematic root-cause analysis. | [.claude/agents/gsd-debugger.md](file://./.claude/agents/gsd-debugger.md) |

**How to use:** Use commands like `/gsd:plan-phase` or `/gsd:quick` (integrated via Get Shit Done).

---

## 🎨 3. Design Tools (CLI)
Calculates the best design systems based on keywords.

- **Tool**: `uipro` CLI
- **Usage**: Run `python3 .agent/skills/ui-ux-pro-max/scripts/search.py "Keywords" --design-system`
- **Output**: Generates colors, fonts, and styles tailored for UniZy.

---

## 🏗️ 4. Active Workflow
My current workflow is driven by the **GSD (Get Shit Done)** methodology:
1. **Map Codebase**: `/gsd:map-codebase` (done)
2. **Discuss/Plan**: Decomposing your vision into small, verifiable slices.
3. **Execute**: Atomic commits per task.
4. **Verify**: Automated and manual verification.
