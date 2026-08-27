import type { BotContext, SupportIntent } from "../../types/index.ts";
import { userRepo } from "../../database/repositories/userRepo.ts";
import { kvGet, KK } from "../../core/state.ts";
import { createJob } from "../../core/queue.ts";
import {
  createSupportSession,
  getSupportSession,
  endSupportSession,
} from "../../services/support/sessionManager.ts";
import {
  mainMenuKeyboard,
  supportIntentKeyboard,
  backKeyboard,
} from "../../ui/keyboards.ts";
import {
  menuScreenText,
  supportOpenText,
  supportConfirmText,
  supportSentText,
} from "../../ui/screens.ts";
import type { SystemConfig } from "../../types/index.ts";
import { generateId } from "../../utils/index.ts";
import { handleStart } from "./start.ts";

// Handles incoming text/media from users (not commands)
export async function handleUserText(ctx: BotContext): Promise<void> {
  const userId = ctx.from!.id;
  await userRepo.markSeen(userId);

  // If user is in a support session, capture their message
  const supportSession = await getSupportSession(userId);
  if (supportSession && ctx.session.awaitingSupportMessage) {
    const text = ctx.message?.text ?? ctx.message?.caption ?? "";
    const mediaFileId =
      ctx.message?.photo?.at(-1)?.file_id ??
      ctx.message?.video?.file_id ??
      ctx.message?.document?.file_id;

    // Queue job to forward anonymously — no permanent storage
    const sessionId = generateId();
    await createJob("support_forward", {
      fromUserId: userId,
      username:   ctx.from!.username,
      intent:     supportSession.intent,
      text,
      mediaFileId,
      sessionId,
    });

    await endSupportSession(userId);
    ctx.session.awaitingSupportMessage = false;
    ctx.session.supportIntent = undefined;

    await ctx.reply(supportSentText(), { parse_mode: "HTML" });
    return;
  }

  // Default: show latest broadcast (home)
  await handleStart(ctx);
}

// ─── Menu screen ──────────────────────────────────────────────────────────────

export async function showMenu(ctx: BotContext): Promise<void> {
  const config = await kvGet<SystemConfig>(KK.systemConfig());
  const items = config?.menuItems ?? [];
  await ctx.reply(menuScreenText(config ?? { menuItems: [], archiveAfterDays: 3, broadcastDefaults: { silent: false } }), {
    parse_mode:   "HTML",
    reply_markup: mainMenuKeyboard(items),
  });
}

// ─── Support intent selection ─────────────────────────────────────────────────

export async function showSupportMenu(ctx: BotContext): Promise<void> {
  await ctx.reply(supportOpenText(), {
    parse_mode:   "HTML",
    reply_markup: supportIntentKeyboard(),
  });
}

export async function handleSupportIntent(
  ctx: BotContext,
  intent: SupportIntent
): Promise<void> {
  const userId = ctx.from!.id;
  await createSupportSession(userId, intent);
  ctx.session.awaitingSupportMessage = true;
  ctx.session.supportIntent = intent;

  await ctx.reply(supportConfirmText(intent), {
    parse_mode:   "HTML",
    reply_markup: backKeyboard("support:open"),
  });
}
