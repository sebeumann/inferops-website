---
title: "The Complete Claude + Obsidian Power-User Playbook"
author: Sebastian
pubDatetime: 2026-04-07T10:00:00Z
slug: claude-obsidian-power-user-playbook
featured: true
draft: false
tags:
  - ai-infrastructure
  - developer-tools
  - llm
  - workflow
description: "Context engineering, knowledge systems, and AI workflow integration — how to combine Claude's web interface, Claude Code CLI, and Obsidian into a compounding knowledge architecture."
---

_Context Engineering, Knowledge Systems, and AI Workflow Integration_

---

The single most important insight across every top developer workflow is this: **context engineering — not prompt engineering — determines whether AI tools produce excellent or mediocre results.** Claude's web interface, Claude Code CLI, and Obsidian each solve different parts of the same problem: giving an LLM the right information at the right time.

When combined using the patterns documented here — drawn from Andrej Karpathy's recent suggestion [LLM wiki methodology](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), three fitting frameworks I have found ([GSD](https://github.com/gsd-build/get-shit-done), [Everything Claude Code](https://github.com/affaan-m/everything-claude-code), [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)), and real-world developer setups — these tools create a compounding knowledge system where every session makes the next one more effective.

This article covers the precise configurations, file structures, and workflows that help you build knowledge and great stuff on a daily basis.

---

## Part 1: Claude's Web Interface — Managing the Context Window

Performance degradation in long conversations is Claude's most misunderstood limitation. The context window (200K tokens standard, up to 1M on latest models) is temporary working memory, not storage. **Quality degrades gradually starting at 50% capacity**, not at the limit — and by the time the "Compacting conversation..." notification appears, you've already lost significant precision.

The degradation follows a predictable curve:

- **0–50% capacity** → Claude performs well
- **50–70%** → Attention weakens; proceed cautiously
- **70–85%** → Hallucinations increase; precision drops
- **85%+** → Responses become erratic; earlier instructions get "forgotten"

Claude remembers the beginning and end of context best — information in the middle suffers most from the "[lost in the middle](https://toolpod.dev/blog/managing-context-windows-claude-chat)" phenomenon.

**The single most impactful habit is starting fresh conversations aggressively.** Each discrete task gets its own conversation. Before ending a productive session, use the "handoff" technique: ask Claude to write a dense summary of key decisions, constraints, current state, and next steps, then paste that summary into the opening of a new conversation. Keep research/analysis conversations under ~15 messages. Treat new conversations as free — context degradation is what's expensive.

### Projects, Instructions, and Memory: Three Stacking Layers

Claude's [personalization system](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features) works in three layers that stack on top of each other:

1. **Profile Preferences** (Settings → Profile) — define your professional background, communication preferences, and behavioral rules across _all_ conversations.
2. **Project Instructions** — add task-specific context within a particular project workspace.
3. **Styles** (Normal, Concise, Formal, Explanatory, or custom) — control delivery format.

For custom instructions, specificity wins. Instruction compliance runs at roughly **89% for precise, concrete rules** ("use pnpm, not npm") but drops to ~35% for vague directives ("write clean code"). A [battle-tested template](https://www.jdhodges.com/blog/claude-ai-custom-instructions-a-real-example-that-actually-works/) from developer J.D. Hodges:

```
I'm a [profession] with [context]. Here's how I need you to work:

* Research FIRST, then advise. Always web-search before product-specific
  advice — your training data goes stale.
* Challenge my reasoning instead of validating it. If my approach has a flaw, say so.
* When there's a tradeoff, present options with evidence. Don't silently pick the easy path.
* If you're unsure, say so. DO NOT guess or fabricate.
* Be concise. Don't explain basics I already know.
* These instructions last updated: [month year].
```

Keep instructions under 500 words. Focus on the 20% of preferences covering 80% of use cases. Tell Claude what to **STOP** doing — "no excessive flattery" and "don't suggest workarounds without flagging them" change behavior more than "be helpful."

**Claude's [Memory feature](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)** (Settings → Capabilities) creates persistent context across conversations. It generates a synthesis updated roughly every 24 hours, plus accepts immediate updates when you tell Claude to "remember" something. Memory is implemented as visible tool calls — you can see exactly when Claude accesses prior context. Use project isolation strategically: each project maintains its own separate memory space. Review memory summaries periodically and use incognito mode (ghost icon) for sensitive one-off queries.

### SKILL.md Files Teach Claude Reusable Workflows

[Skills](https://code.claude.com/docs/en/skills) are packaged workflows defined in `SKILL.md` files that use **progressive disclosure** — only ~100 tokens of metadata are scanned to determine relevance, with full instructions loading only when triggered. This means you can install many skills without bloating context.

```yaml
---
name: commit-message-formatter
description: >
  Format git commit messages using Conventional Commits.
  Use when user mentions commit, git message, or asks to format/write a commit message.
---
# Commit Message Formatter
Format all commit messages following Conventional Commits 1.0.0.
## Format
<type>(<scope>): <description>
## Rules
- Imperative mood, lowercase, no period, max 72 chars
- Breaking changes: add `!` after type/scope
```

Skills come in three patterns:

- **Instruction-Only** (simplest): pure markdown rules for coding standards, brand guidelines, or review checklists.
- **Instructions + Scripts**: for deterministic processing like validation or file conversion.
- **Instructions + External Services**: for workflows involving APIs — create issue, create branch, fix code, open PR.

Store skills at `~/.claude/skills/<n>/SKILL.md` for personal use or `.claude/skills/<n>/SKILL.md` for project-level sharing. The critical distinction: **skills teach Claude how to behave; MCP servers give Claude new tools; subagents let Claude run independent work.**

---

## Part 2: Claude Code — The Configuration Architecture That Matters

The `.claude/` directory and `CLAUDE.md` file form the highest-leverage configuration points in the entire Claude Code system. [HumanLayer's research](https://www.humanlayer.dev/blog/writing-a-good-claude-md) found that Claude Code's system prompt already contains ~50 instructions — **your CLAUDE.md should contain as few instructions as possible**, with only universally applicable rules. Longer files cause Claude to uniformly ignore all instructions, not just later ones.

### CLAUDE.md: The WHAT/WHY/HOW Framework

```markdown
# Project: MyApp

## Commands

npm run dev # Start dev server
npm run test # Run tests (Jest)
npm run lint # ESLint + Prettier check
npm run build # Production build

## Architecture

- Express REST API, Node 20, PostgreSQL via Prisma ORM
- Handlers in src/handlers/, shared types in src/types/

## Conventions

- Use zod for request validation
- Return shape: { data, error }
- Never expose stack traces to client
- Use logger module, not console.log

## Verification

- Run `npm test` after changes
- TypeScript strict mode: no unused imports
```

Keep this under **200 lines** — ideally under 60. Use the `@import` syntax (`@docs/architecture.md`, `@README.md`) to reference detailed documentation without embedding it. Add "IMPORTANT" or "YOU MUST" to critical rules. Even with emphasis, CLAUDE.md is followed ~70% of the time — use **[hooks](https://code.claude.com/docs/en/hooks-guide) for 100% enforcement** of critical rules. Claude is not a linter; use actual linters and formatters instead of wasting CLAUDE.md space on formatting rules.

The file hierarchy loads in order: managed policy CLAUDE.md (org-wide) → `~/.claude/CLAUDE.md` (personal global) → project root CLAUDE.md (team-shared) → subdirectory CLAUDE.md files (loaded on-demand when working in those directories). Supports up to 5 levels of nesting via imports.

### The Complete .claude/ Directory Structure

**Project-level** (committed to git):

```
your-project/
├── CLAUDE.md                    # Project instructions
├── .mcp.json                    # Project MCP server configuration
└── .claude/
    ├── settings.json            # Permissions, hooks (shared)
    ├── settings.local.json      # Personal overrides (gitignored)
    ├── commands/                 # Custom slash commands
    │   └── review.md
    ├── rules/                   # Path-scoped instruction files
    │   ├── frontend.md          # Loads only when working in frontend/
    │   └── api-conventions.md   # Can use paths: frontmatter
    ├── skills/                  # Auto-invoked workflow packages
    │   └── my-skill/SKILL.md
    ├── agents/                  # Domain-specialist subagents
    │   └── code-reviewer.md
    └── hooks/                   # Hook scripts
```

**User-level** (`~/.claude/`, personal, not committed):

```
~/.claude/
├── CLAUDE.md              # Global personal preferences
├── settings.json          # Global permissions, model, hooks
├── commands/              # Global slash commands
├── skills/                # Personal reusable workflows
├── agents/                # Personal domain specialists
├── rules/                 # Personal file-pattern rules
└── projects/              # Session transcripts per project
```

[Rules files](https://code.claude.com/docs/en/memory) with `paths:` frontmatter load only when Claude works in matching directories. Rules without path restrictions load every session — use sparingly.

### Hooks Enforce What CLAUDE.md Cannot

[Hooks](https://www.ksred.com/claude-code-hooks-a-complete-guide-to-automating-your-ai-coding-workflow/) provide **21 lifecycle events** with four handler types (command, http, prompt, agent). They guarantee enforcement where CLAUDE.md instructions get ~70% compliance. Essential hooks every project should have:

- **Auto-format after edits** (PostToolUse on Edit/Write): runs Prettier on changed TypeScript files automatically.
- **Block dangerous commands** (PreToolUse on Bash): prevents `rm -rf /`, `curl|bash`, and `.env` access.
- **Protect sensitive files** (PreToolUse on Edit/Write): blocks modifications to `.env`, `package-lock.json`, `.git/`.
- **Desktop notifications** (Notification event): alerts when Claude needs input.
- **Anti-rationalization gate** (Stop hook with prompt type): verifies all requested tasks are actually complete before Claude stops working.

### Memory and Context: The Document-and-Clear Pattern

Claude Code's auto-memory (since v2.1.59) writes its own notes during sessions — build commands, debugging insights, architecture patterns — stored in `~/.claude/projects/<project-path>/memory/`. The first 200 lines of MEMORY.md auto-load every conversation.

**The practical threshold for context is 60%**, not the window limit. Auto-compaction fires at ~83.5% and is lossy, retaining only 20–30% of details. CLAUDE.md survives compaction (re-read from disk), but conversation context doesn't. The document-and-clear pattern works: work on a focused task, before context fills ask Claude to document progress to a file, start a new session referencing that document.

### MCP Servers: Essential Integrations

Keep to **5–8 [MCP servers](https://toolradar.com/blog/best-mcp-servers-claude-code)** maximum. With Tool Search (lazy loading), Claude discovers tools on-demand rather than loading all schemas upfront, reducing context usage by ~95%. The essential servers:

- **GitHub MCP** — repository management, PRs, issues, CI/CD
- **Context7** — up-to-date library documentation (eliminates hallucinated APIs)
- **Playwright** — browser automation, testing, screenshots
- **Filesystem** — fine-grained file operations with permission control
- **Sequential Thinking** — structured reasoning for complex problems

Configure via `.mcp.json` at project root (shared via git) or `claude mcp add <n> --scope user` for personal servers.

---

## Part 3: Three Frameworks That Define Claude Code Best Practices

### GSD (Get Shit Done): Spec-Driven Context Engineering

[GSD](https://github.com/gsd-build/get-shit-done) (47K GitHub stars) solves context rot through a phased, spec-driven workflow. Its core innovation is **wave execution** — plans grouped by dependency into parallel waves, each executing in a fresh 200K-token context window with zero accumulated garbage.

The workflow follows a strict loop:

1. `/gsd:new-project` → questions → research → requirements → roadmap
2. `/gsd:discuss-phase N` → capture implementation preferences
3. `/gsd:plan-phase N` → research → plan → verify
4. `/gsd:execute-phase N` → parallel wave execution
5. `/gsd:verify-work N` → user acceptance testing
6. `/gsd:ship N` → create PR

GSD creates a `.planning/` directory with structured spec files: `PROJECT.md` (vision, always loaded), `REQUIREMENTS.md` (scoped requirements), `ROADMAP.md` (phases), `STATE.md` (decisions and blockers), `HANDOFF.json` (machine-readable cross-session continuity), and per-phase context, research, plan, summary, and verification files.

Every plan uses **XML prompt formatting** optimized for Claude's attention patterns:

```xml
<task type="auto">
  <n>Create login endpoint</n>
  <files>src/app/api/auth/login/route.ts</files>
  <action>Use jose for JWT. Validate credentials. Return httpOnly cookie.</action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 + Set-Cookie</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

Install via `npx get-shit-done-cc@latest`. Supports 9 runtimes including Claude Code, Cursor, Windsurf, Codex, and Copilot.

### Everything Claude Code (ECC): The Agent Harness System

[ECC](https://github.com/affaan-m/everything-claude-code) (143K GitHub stars) is a comprehensive plugin featuring **36 specialized subagents**, **142+ skill definitions**, **68 slash commands**, and language-specific rules across 12 ecosystems. Key workflows include TDD (RED → GREEN → IMPROVE → VERIFY), search-first/research-first development, continuous learning with confidence-scored instincts, and multi-agent orchestration with PM2 service management.

ECC's agent format uses YAML frontmatter defining name, description, available tools, and model preference. Its rules architecture follows a common-plus-override pattern: `rules/common/` for universal guidelines, `rules/typescript/`, `rules/python/`, etc. for language-specific overrides.

The instinct-based learning system (`/learn`, `/evolve`, `/prune`) auto-extracts patterns from sessions, scores confidence, and clusters instincts into skills over time. ECC's AgentShield security auditor uses three Opus agents in a red-team/blue-team/auditor pipeline scanning CLAUDE.md, settings, MCP configs, hooks, and agents for vulnerabilities.

### Awesome Claude Code: The Ecosystem Directory

The [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) list (31K+ stars) catalogs the full ecosystem. Notable entries include **Claude Squad** (manage multiple Claude instances in tmux), **the Ralph Wiggum pattern** (autonomous looping until specs are fulfilled), **Trail of Bits Security Skills** (professional code auditing), **Dippy** (auto-approve safe bash commands via AST parsing), and **Simone** (project management workflow).

The list reveals that the community heavily values hook-based automation, status line customization, and security scanning.

### Common Themes Across All Three Frameworks

Every framework converges on these principles:

- Structured planning before execution (never jump straight to coding)
- Fresh context per task
- Multi-agent orchestration with thin orchestrators spawning specialized agents
- Test-driven development as standard practice
- Git worktrees for parallelization
- Security as a first-class concern

---

## Part 4: Karpathy's LLM Wiki — Compilation Over Retrieval

Andrej Karpathy's [LLM Knowledge Base concept](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), published April 2026 and viewed 12+ million times, represents a paradigm shift. The core insight: **RAG rediscovers knowledge from scratch on every question — no accumulation. The alternative: the LLM incrementally builds and maintains a persistent wiki where knowledge is compiled once and kept current.**

The memorable framing:

> **"Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase."**

You never write the wiki yourself. The LLM writes and maintains all of it. You source material, explore, and ask the right questions. The LLM does summarizing, cross-referencing, filing, and bookkeeping — the exact work that causes humans to abandon wikis.

### The Three-Layer Architecture

**Layer 1 — Raw Sources (`raw/`)**: Immutable source documents organized by type (articles, papers, repos, data, images). The LLM reads but never modifies these. [Obsidian Web Clipper](https://obsidian.md/clipper) converts web articles to markdown; images download locally for vision capabilities.

**Layer 2 — The Wiki (`wiki/`)**: LLM-generated pages with YAML frontmatter (title, type, sources, related pages, created/updated dates, confidence level). Contains `index.md` (content catalog replacing RAG at moderate scale), `log.md` (chronological record of all operations), plus directories for concepts, entities, sources, and comparisons. Every wiki page cross-references related pages. A single ingested source can touch 10–15 wiki pages.

**Layer 3 — The Schema (CLAUDE.md)**: Configuration telling the LLM how the wiki is structured, what conventions to follow, and which workflows to use. This is what transforms a generic LLM into a disciplined wiki maintainer. Co-evolved between user and LLM over time.

### Four Operations Drive the System

**Ingest**: Drop a source into `raw/`, tell the LLM to process it. The LLM reads the source, discusses key takeaways, writes a summary page, updates the index, updates relevant entity/concept pages, and appends to the log.

**Query**: Ask questions against the wiki; the LLM reads `index.md` first to find relevant pages, drills into them. Good answers get filed back as new wiki pages — explorations compound.

**Lint**: Periodic health checks finding contradictions, stale claims, orphan pages, missing cross-references, and concepts mentioned but lacking their own page.

**File Back**: Query results archived into the wiki, enriching future queries.

Karpathy's research wiki holds ~100 articles totaling ~400,000 words. At this scale, `index.md` plus the LLM's context window is sufficient — **no vector database or embedding pipeline needed**.

### Farzaa's Farzapedia: A Practical Implementation

Developer Farza built "[Farzapedia](https://gist.github.com/farzaa/c35ac0cfbeb957788650e36aabea836d)" — a personal Wikipedia compiled from 2,500 diary entries, Apple Notes, and iMessage conversations, producing 400 detailed articles. His implementation lives as a Claude Code skill at `.claude/skills/wiki/SKILL.md` with commands: `/wiki ingest`, `/wiki absorb all`, `/wiki query`, `/wiki cleanup`, `/wiki breakdown`.

Key design principles from Farzapedia: directories emerge from the data rather than being pre-created. The "Steve Jobs Test" ensures encyclopedic structure (organized by topic, not chronology). Cleanup uses **parallel subagents** — batches of 5 agents reading and restructuring simultaneously. A companion Wikipedia UI clone built with Vercel provides visual browsing with backlinks.

---

## Part 5: Obsidian as Your AI Knowledge Frontend

Since an Obsidian vault is structurally identical to a codebase — a folder of plain markdown files — Claude Code navigates it the same way it navigates source code. The simplest connection requires only `cd ~/vault && claude`. Claude Code reads CLAUDE.md automatically at session start and gains full filesystem access.

### Five Methods to Connect Claude to Obsidian

**1. Direct filesystem** (simplest, most common): Run Claude Code from the vault directory. Full read/write access, no plugins required.

**2. [MCP via Local REST API](https://github.com/MarkusPfundstein/mcp-obsidian)** (2.8K stars): Install the "Local REST API" community plugin in Obsidian, configure the MCP server with your API key. Provides structured tools for listing files, reading contents, searching, patching content relative to headings, and appending.

**3. [Native Obsidian plugin](https://github.com/iansinnott/obsidian-claude-code-mcp)**: Runs an MCP server directly from within Obsidian using dual WebSocket/HTTP transport. Claude Code auto-discovers and connects via the `/ide` command. No external server needed.

**4. Filesystem MCP server**: Point Anthropic's official filesystem server at the vault folder. No Obsidian plugin required.

**5. [Claudian plugin](https://www.xda-developers.com/claude-code-inside-obsidian-and-it-was-eye-opening/)**: Embeds Claude Code directly inside Obsidian as a terminal panel. The vault becomes the agent's working directory with file read/write, search, bash, and multi-step workflows visible in real-time.

### Essential Obsidian Plugins for the LLM Workflow

- **[Obsidian Web Clipper](https://obsidian.md/clipper)** (official): Browser extension saving articles as durable markdown files with template-based auto-formatting. Critical for populating the `raw/` folder.
- **[Copilot for Obsidian](https://www.obsidiancopilot.com/en)** (100K+ users): Chat mode plus VaultQA mode using semantic indexing across thousands of notes, supporting OpenAI, Anthropic, Google, Ollama.
- **[Smart Connections](https://github.com/brianpetro/obsidian-smart-connections)**: AI-powered note discovery using local embeddings with offline functionality.
- **Dataview**: Query language over markdown frontmatter, essential for structured knowledge bases.
- **[Marp Slides](https://www.obsidianstats.com/plugins/marp-slides)**: Preview and export slide decks from markdown — used in the LLM wiki workflow for presentation generation.
- **[Graphify](https://github.com/safishamsi/graphify)** (3.2K stars): Turns any folder into a queryable knowledge graph using AST extraction plus Claude subagents, with Obsidian vault export and interactive HTML visualization. Claims **71.5x fewer tokens per query** versus reading raw files.

### The Recommended Vault Structure

```
my-knowledge-base/
├── CLAUDE.md           # Claude Code bootstrap (vault structure, conventions, active context)
├── .claude/            # Skills, hooks, settings
│   └── skills/
│       └── wiki/SKILL.md
├── raw/                # Immutable sources (Web Clipper output, PDFs, papers)
│   ├── articles/
│   ├── papers/
│   └── assets/         # Downloaded images
├── wiki/               # LLM-generated and maintained pages
│   ├── index.md        # Content catalog (replaces RAG at moderate scale)
│   ├── log.md          # Chronological operations record
│   ├── concepts/
│   ├── entities/
│   └── sources/
├── output/             # Query results, slides, charts, reports
├── projects/           # Project-specific notes
├── daily-notes/        # Daily journals with AI context sections
└── templates/          # Note templates with frontmatter conventions
```

---

## Part 6: Putting It All Together — The Integration Workflow

The architecture that emerges from every documented power-user setup follows a consistent pattern: **Claude Web** for research and brainstorming, **Claude Code** for agentic execution and file manipulation, **Obsidian** for persistent knowledge and visual navigation, and optionally **Cursor/IDE** for code editing with AI autocomplete.

### The Information Pipeline

Capture flows through processing into organized knowledge that compounds:

1. **Web Clipper** saves articles to `raw/`
2. **Claude Code** processes inbox items — categorizing, summarizing, creating concept pages, adding wikilinks
3. **Obsidian** provides the visual layer — graph view reveals connections, Dataview queries surface patterns, Marp generates presentations
4. **Session logs** written back to the vault create genuine continuity across sessions

[Damian Galarza's documented workflow](https://www.damiangalarza.com/posts/2025-11-25-how-i-use-claude-code/) demonstrates this concretely: a Linear issue triggers Claude Code, which gathers context from Obsidian notes, Sentry exceptions, and GitHub discussions, creates a plan for human review, implements via TDD, runs parallel code review through two sub-agents (one for architecture, one for security), then creates a PR. The command `/add-dir` gives Claude Code access to the Obsidian vault so it can read project notes during implementation.

### Token Waste Reduction That Actually Works

[Boris Cherny](https://mindwiredai.com/2026/03/25/claude-code-creator-workflow-claudemd/) (Claude Code's creator) runs **10–15 Claude sessions simultaneously**, each with its own git worktree. His CLAUDE.md is ~100 lines, updated multiple times per week, and his golden rule: _"Anytime we see Claude do something incorrectly, we add it to CLAUDE.md so it doesn't repeat next time."_

Practical strategies for reducing waste:

- Use `/clear` when switching to unrelated work (stale context wastes tokens on every subsequent message)
- Use `/compact` with custom focus instructions
- Keep CLAUDE.md under 200 lines
- Move specialized instructions to skills (which load on-demand, unlike CLAUDE.md)
- Use Sonnet for most tasks, reserving Opus for complex architectural decisions
- One developer documented a **62% token reduction** by implementing tiered documentation — CLAUDE.md at 200 lines max, plus `QUICK_REF.md`, plus topic-specific docs loaded via smart session hooks that detect work context

A `read-once` hook pattern tracks which files have been read within a session and blocks redundant re-reads, cutting **60–90% of Read tool token usage**. This matters because 40–60% of Read tokens typically go to redundant file access.

### Step-by-Step Implementation Plan

**Phase 1 — Foundation (Day 1, ~1 hour)**

Install Obsidian and create a vault with the recommended folder structure. Install Claude Code (`npm install -g @anthropic-ai/claude-code`). Navigate to the vault directory, run `claude`, then `/init` to scaffold CLAUDE.md. Write initial CLAUDE.md covering vault structure, conventions, and active context.

**Phase 2 — Integration (Day 1–2, ~2 hours)**

Install community plugins (Local REST API, Smart Connections, Web Clipper, Dataview, Templater). Configure CLAUDE.md with a session protocol — what to read at start, what to write at end. Create a daily note template with "Context for AI" and "Agent Log" sections. Test the basic workflow by asking Claude to create and edit notes.

**Phase 3 — Knowledge Pipeline (Week 1)**

Configure Web Clipper to save to `raw/`. Create first Claude Code skills (e.g., `/process-inbox`, `/wiki-ingest`). Establish frontmatter conventions (created, tags, status, related). Start capturing daily notes with AI context sections. Set up `index.md` and `log.md` for wiki operations.

**Phase 4 — Development Integration (Week 2)**

Connect project management tools via MCP (GitHub, Linear, Sentry). Use `/add-dir` to connect vault to code projects. Create project-specific note folders. Build automated skills linking notes to implementation.

**Phase 5 — Advanced (Month 2+)**

Add Memory MCP Server for cross-session persistence. Set up sub-agents for specialized review. Create custom hooks (auto-format, safety gates, notifications). Implement session logging and the `lessons.md` pattern. Consider [qmd](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) for semantic search at scale, [GSD](https://github.com/gsd-build/get-shit-done) or [ECC](https://github.com/affaan-m/everything-claude-code) for structured development workflows, and [Graphify](https://github.com/safishamsi/graphify) for knowledge graph visualization.

> The minimum viable setup requires only Obsidian, Claude Code pointed at the vault, and a CLAUDE.md describing the structure — achievable in one hour at $20/month for Claude Pro. The advanced configuration adds multiple MCP servers, 30+ custom skills and commands, sub-agent architecture, git worktrees for parallel sessions, and voice-to-text pipelines.

---

## Conclusion

The system described here is not a collection of independent tools but a **compounding knowledge architecture**. Three insights distinguish practitioners who get extraordinary results from those who find AI tools underwhelming.

**First, compilation beats retrieval.** Karpathy's core contribution is recognizing that RAG rediscovers knowledge from scratch on every query while a maintained wiki compounds. The LLM handles the bookkeeping that causes humans to abandon knowledge bases — updating cross-references, noting contradictions, maintaining consistency across hundreds of pages.

**Second, context engineering is the actual skill.** GSD, ECC, and every documented power-user setup converge on the same conclusion: the quality of Claude's output is determined by the quality of context it receives, not by prompt cleverness. CLAUDE.md, skills, rules, hooks, and structured planning files are all mechanisms for delivering precise context. Keep CLAUDE.md short, use progressive disclosure, enforce critical rules via hooks, and start fresh sessions aggressively.

**Third, the system gets more valuable over time.** Every session log written to Obsidian, every `lessons.md` entry preventing a future mistake, every decision recorded in the wiki makes the next interaction richer. The key is consistency in maintaining the pipeline — not the sophistication of any individual tool.

---

_Key resources referenced in this guide:_

- [Karpathy's LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Farzaa's Personal Wiki Skill](https://gist.github.com/farzaa/c35ac0cfbeb957788650e36aabea836d)
- [GSD — Get Shit Done](https://github.com/gsd-build/get-shit-done)
- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [Graphify](https://github.com/safishamsi/graphify)
- [Claude Code Best Practices (Official)](https://code.claude.com/docs/en/best-practices)
- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Writing a Good CLAUDE.md (HumanLayer)](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
