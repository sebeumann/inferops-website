# inferops.dev

Technical blog covering **MLOps**, **LLMOps**, and **AI infrastructure**.

Built with [Astro](https://astro.build/) + [AstroPaper](https://github.com/satnaing/astro-paper), deployed to a self-hosted VPS with Caddy, Cloudflare DNS, and Umami analytics.

## Quick Start

### Prerequisites

- **Node.js ≥ 22** — install via [fnm](https://github.com/Schniz/fnm) (recommended) or [nvm](https://github.com/nvm-sh/nvm)
- **pnpm ≥ 9** — install via `corepack enable && corepack prepare pnpm@9 --activate`
- **Git ≥ 2.40**

### Setup

```bash
# Clone the repo
git clone git@github.com:YOUR_GITHUB_USERNAME/inferops-dev.git
cd inferops-dev

# Install the correct Node.js version (if using fnm)
fnm use

# Install dependencies
pnpm install

# Start dev server
pnpm dev
# → http://localhost:4321
```

### Common Commands

| Command              | Description                              |
|----------------------|------------------------------------------|
| `pnpm dev`           | Start dev server at `localhost:4321`     |
| `pnpm build`         | Build production site to `./dist`        |
| `pnpm preview`       | Preview production build locally         |
| `pnpm lint`          | Run ESLint                               |
| `pnpm format`        | Format code with Prettier                |
| `pnpm format:check`  | Check formatting without writing         |

## Project Structure

```
├── .github/workflows/    # CI/CD (deploy on push, quality checks on PR)
├── .vscode/              # Recommended extensions & settings
├── infra/                # Server setup documentation
├── public/fonts/         # Self-hosted WOFF2 fonts (GDPR)
├── src/
│   ├── assets/           # Images processed by Astro
│   ├── components/       # Astro components
│   ├── config.ts         # Site configuration
│   ├── constants.ts      # Social links, share links
│   ├── data/blog/        # Blog posts (Markdown)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Routes (about, imprint, privacy, etc.)
│   ├── styles/           # Global CSS + Tailwind
│   └── utils/            # Helpers (OG image generation, etc.)
├── Caddyfile             # Reverse proxy config (production)
├── docker-compose.yml    # Umami analytics stack
├── Dockerfile            # Optional containerized build
└── lighthouserc.json     # Performance budget
```

## Writing Blog Posts

Create a new `.md` file in `src/data/blog/`:

```yaml
---
title: "Your Post Title"
author: inferops
pubDatetime: 2026-04-01T10:00:00Z
slug: your-post-slug
featured: false
draft: false
tags:
  - mlops
  - kubernetes
description: "A short description for SEO and social cards."
---

Your content here...
```

Set `draft: true` while writing. Drafts are not included in the production build.

## Deployment

Pushing to `main` triggers the GitHub Actions pipeline which builds the site and deploys via rsync to the VPS. See `.github/workflows/deploy.yml`.

### Required GitHub Secrets

| Secret       | Description                       |
|-------------|-----------------------------------|
| `VPS_HOST`  | VPS IP address or hostname         |
| `VPS_USER`  | SSH user (e.g., `deploy`)         |
| `VPS_SSH_KEY`| Ed25519 private key for deployment |

## Infrastructure

- **VPS:** Ubuntu 24.04 LTS (Hetzner recommended)
- **Web server:** Caddy (auto TLS via Let's Encrypt)
- **Analytics:** Umami (self-hosted, cookieless, GDPR-compliant)
- **DNS/CDN:** Cloudflare (free tier)
- **CI/CD:** GitHub Actions → rsync over SSH

See `infra/server-setup.md` for the full VPS provisioning runbook.

## Branch Strategy

- `main` — production (protected, deploys automatically)
- `dev` — integration branch for co-development
- `feat/*` — feature branches
- `draft/*` — blog post drafts

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## License

Content and code are proprietary unless otherwise stated.
