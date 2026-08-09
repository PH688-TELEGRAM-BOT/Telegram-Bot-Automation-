# Bot Commands

Command names follow Telegram's BotFather constraints: lowercase Latin letters, digits, and underscores only, 1–32 characters, with a description under 256 characters.

## Core Commands

| Command | Description |
|---|---|
| `/start` | Initialize the bot and show a welcome message |
| `/help` | List available commands and how to use them |
| `/panel` | Open the unified control panel |
| `/cancel` | Cancel the current multi-step workflow |
| `/status` | Show current bot/session status |

## Content

| Command | Description |
|---|---|
| `/content` | Open the content management menu |
| `/content_new` | Create a new content item |
| `/content_edit` | Edit an existing content item |
| `/content_publish` | Publish a content item |
| `/content_archive` | Archive a content item |
| `/content_list` | List content items and their status |

## Community

| Command | Description |
|---|---|
| `/community` | Open community management menu |
| `/members` | List or search group members |
| `/joinrequests` | Review pending join requests |
| `/ban` | Remove and block a member |
| `/unban` | Reinstate a previously banned member |
| `/mute` | Restrict a member from sending messages |
| `/unmute` | Restore a member's send permissions |

## Support

| Command | Description |
|---|---|
| `/support` | Open the support menu |
| `/ticket_new` | Open a new support ticket |
| `/ticket_view` | View a ticket by ID |
| `/ticket_reply` | Reply to an open ticket |
| `/ticket_close` | Close a support ticket |
| `/tickets` | List open tickets |

## Buttons

| Command | Description |
|---|---|
| `/buttons` | Open inline menu configuration |
| `/buttons_new` | Create a new inline menu |
| `/buttons_edit` | Edit an existing inline menu |
| `/buttons_delete` | Delete an inline menu |

## Automation

| Command | Description |
|---|---|
| `/automation` | Open automation rules menu |
| `/rule_new` | Create a keyword, event, or scheduled rule |
| `/rule_edit` | Edit an existing automation rule |
| `/rule_delete` | Delete an automation rule |
| `/rules` | List active automation rules |

## Schedule

| Command | Description |
|---|---|
| `/schedule` | Open the scheduling menu |
| `/schedule_new` | Schedule a publish, broadcast, or reminder |
| `/schedule_edit` | Edit a scheduled job |
| `/schedule_cancel` | Cancel a scheduled job |
| `/schedule_list` | List upcoming scheduled jobs |

## Broadcast

| Command | Description |
|---|---|
| `/broadcast` | Open the broadcast menu |
| `/broadcast_new` | Compose and send a broadcast |
| `/broadcast_status` | Check delivery status of a broadcast |

## Approvals

| Command | Description |
|---|---|
| `/approvals` | Open the approvals menu |
| `/approve` | Approve a pending request |
| `/reject` | Reject a pending request |
| `/pending` | List all pending requests |

## Knowledge

| Command | Description |
|---|---|
| `/knowledge` | Open the FAQ / knowledge base menu |
| `/faq_new` | Add a new FAQ entry |
| `/faq_edit` | Edit an existing FAQ entry |
| `/faq_delete` | Delete an FAQ entry |
| `/faq` | Search or view FAQ entries |

## Tasks

| Command | Description |
|---|---|
| `/tasks` | Open the task management menu |
| `/task_new` | Create a new task |
| `/task_assign` | Assign a task to a member |
| `/task_complete` | Mark a task as complete |
| `/task_list` | List tasks and their status |

## Polls

| Command | Description |
|---|---|
| `/polls` | Open the polls menu |
| `/poll_new` | Create a new poll |
| `/poll_close` | Close an active poll |
| `/poll_results` | View results of a poll |

## Admin-Only

| Command | Description |
|---|---|
| `/config` | View or update bot configuration |
| `/admins` | List or manage bot admins |
| `/allowlist` | Manage the allowed chat list |
| `/featureflags` | Toggle feature flags per chat |

## Naming Conventions

- All commands are lowercase with underscores separating words (e.g. `/task_new`, not `/taskNew` or `/task-new`).
- Feature-level commands (e.g. `/content`, `/support`) open that feature's menu via inline buttons rather than requiring memorized subcommands.
- Subcommands (e.g. `/content_new`) exist for power users and automation scripts but are not required for normal use through the panel.
- Routing dispatches first by update type, then by command name — see [ARCHITECTURE.md](./ARCHITECTURE.md).
