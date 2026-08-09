# TeamMarySy Bot

TeamMarySy Bot is a **Telegram-native automation system built on Cloudflare Workers**. It uses an event-driven, stateless execution model that relies on Telegram as the source of truth whenever possible. Persistent storage is intentionally minimal and limited to configuration, active workflows, scheduled jobs, support tickets, and sequential counters stored in Cloudflare Workers KV.

## What This Bot Is

- A Telegram Bot API integration running on Cloudflare Workers
- Stateless per-request execution — no long-lived runtime required
- Minimal, purposeful persistence (KV only, no full chat/message history)
- A modular set of feature domains, each isolated from the others
- Scheduled/cron-driven background maintenance and publishing

## What This Bot Is Not

This project does **not** implement natural language processing, machine learning, neural networks, sentiment analysis, continuous learning, feedback retraining, full conversation logging, multi-platform support (Slack/Discord), HR onboarding, or analytics dashboards. If you see documentation describing those capabilities, it does not reflect this implementation — please flag it for removal.

## Runtime & Environment

| Component | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Bot Platform | Telegram Bot API |
| Storage | Cloudflare Workers KV |
| Scheduling | Cloudflare Cron Triggers |

## Feature Modules

- Panel (UI entry system)
- Content (create/edit/publish lifecycle)
- Community (group and join request management)
- Support (ticketing system)
- Buttons (inline workflow system)
- Automation (rule engine)
- Schedule (time-based execution)
- Broadcast (controlled messaging)
- Approvals (request handling system)
- Knowledge (FAQ system)
- Tasks (task lifecycle management)
- Polls (Telegram poll management)

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, layers, folder structure
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Cloudflare Workers deployment environment
- [CALLBACK_QUERIES.md](./CALLBACK_QUERIES.md) — production readiness guide for callback query handling
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) — full build-order checklist (source of truth)
- [CI_CD.md](./CI_CD.md) — GitLab CI/CD pipeline, acceptance criteria, and risk mitigations
- [KNOWN_IMPROVEMENTS.md](./KNOWN_IMPROVEMENTS.md) — remaining production-hardening work

## Quick Start

```bash
# Install dependencies
npm install

# Configure local secrets (do not commit)
cp .dev.vars.example .dev.vars

# Run locally with Wrangler
npx wrangler dev

# Deploy to Cloudflare Workers
npx wrangler deploy
```

## Release Scope (Current Production Deployment)

This deployment includes: Telegram webhook processing, command routing, callback query handling, join request workflow, Content module, Community module, Support module, scheduler execution, scheduled publishing, configuration management, conversation state management, support ticket management, Workers KV persistence, cron-triggered maintenance, and error handling/logging.

No experimental features, breaking API changes, or database migrations are include
d in this release.
