# Implementation Path & Workflow (Source of Truth)

## 0. Repository & Project Setup — MUST BE COMPLETED FIRST

- [ ] Initialize Cloudflare Worker project structure
- [ ] Configure TypeScript
- [ ] Configure package manager and lockfile
- [ ] Set up linting and formatting standards
- [ ] Integrate unit testing framework
- [ ] Configure local development environment
- [ ] Add `.gitignore`
- [ ] Add `.dev.vars.example` (no secrets included)
- [ ] Create `README.md`
- [ ] Configure GitLab CI pipeline
- [ ] Define staging and production environments

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the required folder structure — do not deviate.

## 1. Cloudflare Worker Foundation

- [ ] Create Worker entry point (`index.ts`)
- [ ] Implement `fetch()` handler
- [ ] Implement `scheduled()` handler
- [ ] Configure compatibility settings
- [ ] Configure KV namespaces
- [ ] Configure Cron triggers
- [ ] Define environment bindings
- [ ] Validate local execution
- [ ] Validate staging deployment
- [ ] Validate production deployment

**Guarantees:** local execution works; HTTP requests handled correctly; cron triggers fire as expected; KV read/write functions correctly; no hardcoded secrets.

## 2. Telegram API Client (Single Gateway Layer)

> Rule: ALL Telegram API interactions must pass through this layer.

- [ ] Define base API URL
- [ ] Implement `call(method, payload)`
- [ ] Load bot token from secure environment variables
- [ ] Standardize error handling
- [ ] Normalize API responses
- [ ] Add timeout and abort support
- [ ] Ensure sensitive data is never logged

**Required methods:** `sendMessage`, `editMessageText`, `editMessageReplyMarkup`, `answerCallbackQuery`, `deleteMessage`, `restrictChatMember`, `approveChatJoinRequest`, `declineChatJoinRequest`, `sendPoll`, `stopPoll`. Extend only when explicitly required by a feature.

## 3. Webhook Handler (Entry Gate Only)

> Rule: NO BUSINESS LOGIC IS PERMITTED HERE

- [ ] Accept only POST requests
- [ ] Reject all other HTTP methods
- [ ] Validate `Content-Type`
- [ ] Parse incoming update payload
- [ ] Validate webhook secret
- [ ] Reject malformed or invalid updates
- [ ] Forward validated data to authentication layer
- [ ] Forward to router layer
- [ ] Always respond with HTTP 200 quickly

## 4. Authentication & Authorization (Security Gate)

**Execution order (strict):** Authentication → Authorization → Rate limiting → Routing

- [ ] Validate webhook secret
- [ ] Validate request structure
- [ ] Accept only trusted sources
- [ ] Owner verification
- [ ] Admin verification
- [ ] Chat allowlist enforcement
- [ ] User permission validation
- [ ] Chat permission validation
- [ ] Feature-level access control
- [ ] Per-user rate limits
- [ ] Per-chat rate limits
- [ ] Optional IP-based limits
- [ ] Sensitivity-based thresholds
- [ ] Safe rejection handling
- [ ] Optional Telegram IP allowlist (document the decision)

## 5. Update Router (Dispatch Layer Only)

> Rule: NO BUSINESS LOGIC — ROUTING ONLY

- [ ] Route message updates
- [ ] Route callback queries
- [ ] Route join requests
- [ ] Route edited messages
- [ ] Provide fallback for unknown update types

## 6. Configuration System

- [ ] Load environment configuration
- [ ] Load bot configuration
- [ ] Load owner/admin identifiers
- [ ] Load allowed chat list
- [ ] Load feature flags
- [ ] Load default language settings
- [ ] Load rate limit configuration
- [ ] Validate configuration at startup

**Per-chat config:** language preferences, permission settings, enabled features, automation settings, broadcast settings, moderation settings.

## 7. State Layer (KV Abstraction Only)

> Rule: STORE ONLY OPERATIONAL DATA

- [ ] Implement get / put / delete abstraction
- [ ] Enforce namespaced keys
- [ ] Standardize serialization
- [ ] Support expiration policies
- [ ] Define strict key naming conventions

**Allowed:** configuration, workflows, tickets, jobs, counters, feature state.
**Forbidden:** full chat history, analytics datasets, message archives, ML datasets.

## 8. Sequential Counters (Atomic IDs)

- [ ] Ticket ID generation
- [ ] Task ID generation
- [ ] Content ID generation
- [ ] Poll ID generation
- [ ] Feature ID generation

## 9. Workflow State (Temporary Processes)

- [ ] Workflow ID tracking
- [ ] User ID association
- [ ] Chat ID association
- [ ] Step tracking
- [ ] Minimal payload storage
- [ ] Expiration timestamp enforcement

Must expire automatically, must not leak across users, must support resumability.

## 10–21. Feature Modules

> Core rule: features must never interact with Telegram directly — only through the Telegram client layer.

Each feature must be fully isolated, use only the state layer and Telegram client, enforce permissions strictly, and avoid cross-feature dependencies.

Modules: Panel · Content · Community · Support · Buttons · Automation · Schedule · Broadcast · Approvals · Knowledge · Tasks · Polls

## 22. Cron System

- [ ] Identify due jobs
- [ ] Validate state integrity
- [ ] Execute safely
- [ ] Update job state
- [ ] Prevent duplicate execution
- [ ] Handle failures gracefully

**Cleanup tasks:** expired workflows, stale tickets, completed jobs.

## 23. Error Handling

- [ ] Standardized error types
- [ ] Telegram API error handling
- [ ] KV error handling
- [ ] Authentication failures
- [ ] Rate limit violations
- [ ] Safe webhook responses
- [ ] No internal error leakage

## 24. Logging

**Allowed:** update type, chat ID, user ID, command, callback action, execution result, error type, execution timing.
**Forbidden:** bot token, secrets, full message content, sensitive configuration values.

## 25. Testing Strategy

**Unit:** routing logic, command handling, callback handling, authentication, rate limiting, state operations, workflows, counters.

**Integration:** webhook → router flow, router → feature flow, feature → KV interaction, feature → Telegram API interaction, cron execution flow.

**Negative:** invalid secrets, malformed payloads, unauthorized access attempts, expired workflows, external API failures, rate limit enforcement.

## 26. GitLab CI/CD

**Stages:** validate → test → build → deploy → smoke-test

Rules: no deployment without passing tests; no secrets exposed during build; production deployments require protection rules.

## 27. Secrets Management

- Never commit secrets
- Use CI/CD environment variables only
- Mask all sensitive values
- Separate staging and production credentials
- Restrict access permissions

## 28. Webhook Deployment Flow

1. Deploy Worker
2. Configure webhook
3. Set webhook secret
4. Verify webhook registration
5. Send test update
6. Validate full processing pipeline

## 29. Production Readiness Checklist

- [ ] All tests passing
- [ ] CI pipeline enforced
- [ ] KV properly configured
- [ ] Cron jobs configured
- [ ] Webhook active
- [ ] Rate limiting enabled
- [ ] Logging compliant and safe
- [ ] Rollback strategy defined
- [ ] Smoke tests successful

## 30. Final Source-of-Truth Rules

**Architecture hierarchy (non-negotiable):**

1. Webhook → validation only
2. Authentication/Authorization → security enforcement
3. Router → dispatch only
4. Features → business logic only
5. Telegram client → all API interactions
6. State layer → operational storage only

**Forbidden patterns:** business logic in the webhook layer, logic inside the router layer, direct Telegram API calls in features, persistent chat history storage, hidden side effects in the state layer.

> This system is a single Cloudflare Worker with a modular feature architecture, enforcing strict separation of concerns and deterministic execution flow.
