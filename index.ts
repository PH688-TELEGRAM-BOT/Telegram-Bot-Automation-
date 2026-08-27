// ─── logger ──────────────────────────────────────────────────────────────────

type Level = "debug" | "info" | "warn" | "error";

function log(level: Level, msg: string, data?: unknown) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (data !== undefined) {
    console[level === "debug" ? "log" : level](line, data);
  } else {
    console[level === "debug" ? "log" : level](line);
  }
}

export const logger = {
  debug: (msg: string, data?: unknown) => log("debug", msg, data),
  info:  (msg: string, data?: unknown) => log("info",  msg, data),
  warn:  (msg: string, data?: unknown) => log("warn",  msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
};

// ─── idParser ────────────────────────────────────────────────────────────────
// Accepts -100xxxx or @username and returns as-is for Telegram API

export function resolveTargetId(id: string): string {
  const trimmed = id.trim();
  // Numeric supergroup/channel IDs start with -100
  if (/^-100\d+$/.test(trimmed)) return trimmed;
  // Username — ensure @-prefix
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function isNumericId(id: string): boolean {
  return /^-?\d+$/.test(id.trim());
}

// ─── formatter ───────────────────────────────────────────────────────────────

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", { timeZone: "UTC" });
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ─── misc ─────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
