# Architecture

## Core Principle

> This system is a single Cloudflare Worker with a modular feature architecture, enforcing strict separation of concerns and deterministic execution flow.

## Design Characteristics

- **Stateless execution** — every webhook update is processed independently; no long-lived runtime is required.
- **Telegram-native philosophy** — the bot avoids duplicating data Telegram already provides (user profiles, member lists, join request history, message history, chat logs).
- **Minimal persistence** — KV stores only operational data: configuration, workflows, tickets, scheduled jobs, and counters.
- **Shared Telegram delivery layer** — all Telegram API calls go through a single client, giving one retry policy, centralized error handling, consistent telemetry, and easier testing.
- **Modular business logic** — feature modules never call Telegram directly; they only use the state layer and the Telegram client.

## Request Flow

```
Telegram
   │
Webhook
   │
Cloudflare Worker
   │
Process update
   │
KV (only if necessary)
   │
Return
```

## Layered Hierarchy (Non-Negotiable)

1. **Webhook** → validation only
2. **Authentication / Authorization** → security enforcement
3. **Router** → dispatch only
4. **Features** → business logic only
5. **Telegram client** → all API interactions
6. **State layer** → operational storage only

## Forbidden Patterns

- No business logic in the webhook layer
- No logic inside the router layer
- No direct Telegram API calls in feature modules
- No persistent chat history storage
- No hidden side effects in the state layer

## Telegram Delivery Layer

Instead of every module calling `fetch()` directly:

```
Support Module     → Telegram.sendMessage()
Community Module   → Telegram.approveJoin()
Scheduler          → Telegram.sendMessage()
```

Benefits: single retry policy, centralized error handling, consistent telemetry, easier testing, and a place to add future middleware (rate limiting, logging).

## KV Schema

```
config:*
content:*
ticket:*
sched:*
sched:failed:*
counter:*
state:<chat>:<flow>
```

Everything else is sourced from live Telegram updates rather than stored.

## Workflow State Example

```json
state:12345:support
{
  "flow": "awaiting_ticket_text",
  "createdAt": "..."
}
```

Advantages: no user table, no sessions, automatic expiration, supports interrupted/resumable conversations.

## Scheduler Flow

```
Cron
 │
Load sched:*
 │
Validate
 │
Publish
 │
Telegram Delivery
 │
Retry
 │
Move to sched:failed
```

Additional maintenance performed on each run: remove expired states, remove expired tickets, remove exhausted failed jobs — keeping KV clean without a separate maintenance service.

## Callback Validation Flow

```
callback_data
    │
  Parse
    │
toSafeInteger()
    │
   OK?
 ├── Yes → Telegram API
 └── No → graceful response
```

This prevents malformed callback payloads from propagating into privileged operations such as join-request approval.

## Source-of-Truth Folder Structure

```
src/
├── index.ts
├── webhook/
│   └── handler.ts
├── auth/
│   ├── authentication.ts
│   ├── authorization.ts
│   └── rate-limit.ts
├── router/
│   └── update-router.ts
├── features/
│   ├── panel/
│   ├── content/
│   ├── community/
│   ├── support/
│   ├── buttons/
│   ├── automation/
│   ├── schedule/
│   ├── broadcast/
│   ├── approvals/
│   ├── knowledge/
│   ├── tasks/
│   └── polls/
├── telegram/
│   ├── client.ts
│   ├── messages.ts
│   ├── keyboards.ts
│   └── types.ts
├── state/
│   ├── kv.ts
│   ├── workflows.ts
│   ├── tickets.ts
│   ├── jobs.ts
│   └── counters.ts
├── cron/
│   └── handler.ts
├── config/
│   └── config.ts
└── utils/
    ├── errors.ts
    └── logging.ts
```

Do not deviate from this structure without updating this document.
