import type { SupportIntent, SupportPayload, SupportSession } from "../../types/index.ts";
import { kvGet, kvSet, kvDelete, KK } from "../../core/state.ts";
import { C, env } from "../../config/index.ts";
import { inboxRepo } from "../../database/repositories/broadcastRepo.ts";
import { logger } from "../../utils/index.ts";

// ─── Intent parser ────────────────────────────────────────────────────────────

const KEYWORDS: Record<SupportIntent, string[]> = {
  payment:     ["pay", "payment", "deposit", "withdraw", "wallet", "transfer", "refund"],
  order:       ["order", "buy", "purchase", "item", "product", "cancel"],
  partnership: ["partner", "affiliate", "promo", "deal", "collab", "sponsor"],
  report:      ["report", "fraud", "scam", "hack", "stolen", "abuse"],
  other:       [],
};

export function parseIntent(text: string): SupportIntent {
  const lower = text.toLowerCase();
  for (const [intent, kws] of Object.entries(KEYWORDS) as [SupportIntent, string[]][]) {
    if (intent !== "other" && kws.some((k) => lower.includes(k))) return intent;
  }
  return "other";
}

// ─── Session manager ──────────────────────────────────────────────────────────

export async function createSupportSession(
  userId: number,
  intent: SupportIntent
): Promise<string> {
  const sessionId = `${userId}-${Date.now()}`;
  const session: SupportSession = { userId, intent, startedAt: Date.now() };
  await kvSet(KK.supportSession(userId), session, {
    expireIn: C.SUPPORT_SESSION_TTL_MS,
  });
  return sessionId;
}

export async function getSupportSession(userId: number): Promise<SupportSession | null> {
  return kvGet<SupportSession>(KK.supportSession(userId));
}

export async function endSupportSession(userId: number): Promise<void> {
  await kvDelete(KK.supportSession(userId));
}

// ─── Forward to admin (INBOUND → OUTBOUND) ───────────────────────────────────
// This is a proactive outbound operation — no new user message required

export async function forwardToAdmin(payload: SupportPayload): Promise<void> {
  // Save to inbox
  await inboxRepo.add({
    fromUserId:    payload.fromUserId,
    fromUsername:  payload.username,
    intent:        payload.intent,
    text:          payload.text,
    mediaFileId:   payload.mediaFileId,
    receivedAt:    Date.now(),
    status:        "unread",
  });

  logger.info(`Support message forwarded: intent=${payload.intent} from=${payload.fromUserId}`);
  // Session is TEMP only — already expired/deleted by the time this runs
}
