# CI/CD & Deployment Plan (GitLab)

## Runtime Topology

```
Telegram User
     │
Telegram Bot API
     │  setWebhook
     ▼
Cloudflare Worker
     │
Webhook Handler
     │
Authentication & Security Layer
     │
Update Router
     │
Feature Handlers
```

## Core Principles

- Single Worker with a single webhook endpoint
- No external Telegram SDK dependencies — all Telegram interaction is via direct `fetch()` calls to the Bot API
- Feature-oriented handler structure
- Minimal persistent state
- Fast webhook acknowledgment via `200 OK`

## Supported Update Types

- `message`
- `callback_query`
- `chat_join_request`
- `edited_message`
- Additional Telegram update types as required

Routing happens in two steps: (1) update type, (2) command, callback data, or message content.

## Request Flow

1. Telegram sends an update to the webhook.
2. The Webhook Handler validates the request.
3. Authentication checks verify user and chat permissions.
4. Rate limits are enforced.
5. The Update Router dispatches the request.
6. The corresponding Feature Handler executes business logic.
7. The Worker interacts with Telegram via `fetch()` to respond, edit messages, or handle callbacks.
8. The Worker returns `200 OK` immediately.

## Pipeline Stages

### 1. validate
- Lint Worker code
- Run unit checks
- Validate configuration structure

### 2. test
- Execute automated tests for routing, authentication, and handlers
- Validate Telegram payload processing

### 3. build
- Bundle the Worker for deployment
- Produce deployment artifacts if required

### 4. deploy
- Deploy to staging on merge or tagged branches
- Deploy to production after approval or release tagging

### 5. post-deploy
- Run smoke tests on the webhook endpoint
- Verify Telegram webhook response flow
- Confirm basic command execution

## Deployment Behavior

- Merge requests execute **validation and testing only** — no deployment.
- Main branch or tagged releases trigger deployments.
- Production deployments are gated by approval rules where applicable.

## Acceptance Criteria

- [ ] Webhook handler correctly validates incoming requests
- [ ] Update router supports all defined update types
- [ ] Feature handlers operate without violating the single-worker architecture
- [ ] Secrets are sourced exclusively from GitLab variables or Cloudflare Secrets
- [ ] GitLab pipeline passes for all merge requests
- [ ] Deployment succeeds for both staging and production environments
- [ ] Cron-based maintenance tasks are properly configured and verified

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Webhook abuse | Token validation, optional IP allowlist, and rate limiting |
| State growth | Strict limitation to compact operational state only |
| Command sprawl | Feature-based routing with clearly defined handler boundaries |
| Deployment drift | Standardized GitLab CI/CD pipeline with reproducible build and deployment steps |

## Cron-Triggered Maintenance

Cloudflare Cron handles periodic operations:

- Scheduled message delivery
- Cleanup of expired workflow state
- Closing or marking stale tickets
- Maintenance of internal counters

## Result

This pipeline establishes a maintainable, production-grade Telegram bot architecture on Cloudflare Workers — a secure webhook entry point, feature-based routing, minimal operational state, and controlled deliv
ery through GitLab CI/CD.
