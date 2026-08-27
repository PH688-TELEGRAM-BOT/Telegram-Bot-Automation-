import type {
  BroadcastRecord, InboxMessage, User,
  SystemConfig, Job
} from "../types/index.ts";
import { formatDate } from "../utils/index.ts";

// ─── User screens ─────────────────────────────────────────────────────────────

export function menuScreenText(config: SystemConfig): string {
  const items = config.menuItems.map((m) => `  • ${m.label}`).join("\n");
  return `<b>☰ Main Menu</b>\n\n${items || "No items configured."}\n\n<i>Tap a button below.</i>`;
}

export function supportOpenText(): string {
  return `<b>🎧 Support</b>\n\nWhat can we help you with?\nSelect a category below:`;
}

export function supportConfirmText(intent: string): string {
  return `<b>Category: ${intent.toUpperCase()}</b>\n\nPlease type your message and we'll forward it anonymously.\n\n<i>Session expires in 15 minutes.</i>`;
}

export function supportSentText(): string {
  return `✅ <b>Message received.</b>\n\nOur team will respond soon. This session has ended.`;
}

// ─── Admin screens ────────────────────────────────────────────────────────────

export function adminPanelText(adminName: string): string {
  return `<b>🔐 Admin Panel</b>\n\nWelcome, ${adminName}.\n\nSelect a section:`;
}

export function broadcastListText(records: BroadcastRecord[]): string {
  if (!records.length) return "<b>📢 Broadcasts</b>\n\nNo broadcasts yet.";
  const lines = records.slice(-5).reverse().map(
    (r) => `• ${r.isDraft ? "📝 Draft" : "✅ Sent"} — ${formatDate(r.createdAt)}`
  ).join("\n");
  return `<b>📢 Broadcasts</b>\n\nRecent:\n${lines}`;
}

export function broadcastDraftText(record: BroadcastRecord): string {
  const target = record.targets.map((t) => t.id ?? "All Users").join(", ");
  return [
    `<b>📝 Draft Broadcast</b>`,
    ``,
    `Text: ${record.content.text ? "✅ Set" : "❌ Empty"}`,
    `Media: ${record.content.photoFileId || record.content.videoFileId ? "✅ Set" : "❌ None"}`,
    `Buttons: ${record.content.buttons?.length ? "✅ Set" : "❌ None"}`,
    `Target: ${target || "❌ Not set"}`,
    `Silent: ${record.content.silent ? "Yes" : "No"}`,
    record.scheduledAt ? `Scheduled: ${formatDate(record.scheduledAt)}` : "",
  ].filter(Boolean).join("\n");
}

export function inboxListText(messages: InboxMessage[]): string {
  if (!messages.length) return "<b>📥 Inbox</b>\n\nNo messages.";
  const unread = messages.filter((m) => m.status === "unread").length;
  return `<b>📥 Inbox</b>\n\n${unread} unread / ${messages.length} total\n\nTap a message to manage:`;
}

export function inboxMessageText(msg: InboxMessage): string {
  return [
    `<b>📨 Support Message</b>`,
    ``,
    `Intent: <b>${msg.intent.toUpperCase()}</b>`,
    `From: ${msg.fromUsername ? "@" + msg.fromUsername : "Anonymous"} (<code>${msg.fromUserId}</code>)`,
    `Received: ${formatDate(msg.receivedAt)}`,
    ``,
    `Message:\n${msg.text}`,
  ].join("\n");
}

export function subscribersText(active: User[], archived: User[]): string {
  return [
    `<b>👥 Subscribers</b>`,
    ``,
    `🟢 Active:   ${active.length}`,
    `📦 Archived: ${archived.length}`,
    `📊 Total:    ${active.length + archived.length}`,
    ``,
    `<i>Users auto-archive after 3 days of inactivity.</i>`,
    `<i>They restore automatically on next activity.</i>`,
  ].join("\n");
}

export function dataText(users: User[], jobs: Job[]): string {
  const done = jobs.filter((j) => j.status === "done").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  return [
    `<b>📊 Data & Analytics</b>`,
    ``,
    `Users:     ${users.length}`,
    `Jobs Done: ${done}`,
    `Jobs Failed: ${failed}`,
    ``,
    `Storage: Deno KV (live)`,
  ].join("\n");
}

export function settingsText(): string {
  return `<b>⚙️ Settings</b>\n\nAll settings are editable live — no redeploy needed.`;
}

export function helpText(): string {
  return [
    `<b>❓ Help</b>`,
    ``,
    `<b>Broadcast:</b> Send content to all users, groups, or channels.`,
    `<b>Community:</b> Manage connected groups/channels. Accepts <code>-100xxxx</code> or <code>@username</code>.`,
    `<b>Subscribers:</b> View active/archived users. Users are never deleted.`,
    `<b>Inbox:</b> Support messages, tagged by intent. No history stored after resolve.`,
    `<b>Data:</b> Analytics and storage info.`,
    `<b>Settings:</b> Change secret key, archive rules, UI config.`,
  ].join("\n");
}
