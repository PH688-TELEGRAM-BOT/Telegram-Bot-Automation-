import type { BotContext, BroadcastRecord, BroadcastTarget } from "../../types/index.ts";
import { broadcastRepo } from "../../database/repositories/broadcastRepo.ts";
import { createJob } from "../../core/queue.ts";
import {
  broadcastActionsKeyboard,
  confirmKeyboard,
  backKeyboard,
} from "../../ui/keyboards.ts";
import { broadcastDraftText, broadcastListText } from "../../ui/screens.ts";
import { generateId } from "../../utils/index.ts";
import { resolveTargetId } from "../../utils/index.ts";
import { updateBroadcastButtons, updateBroadcastText } from "../../services/broadcast/dispatcher.ts";

// ─── List broadcasts ──────────────────────────────────────────────────────────

export async function showBroadcastList(ctx: BotContext): Promise<void> {
  const all = await broadcastRepo.getAll();
  await ctx.reply(broadcastListText(all), {
    parse_mode:   "HTML",
    reply_markup: broadcastActionsKeyboard("new"),
  });
}

// ─── Create new draft ─────────────────────────────────────────────────────────

export async function createDraft(ctx: BotContext): Promise<void> {
  const draft = await broadcastRepo.create({
    content:  {},
    targets:  [],
    isDraft:  true,
  });
  ctx.session.broadcastDraft   = {};
  ctx.session.broadcastTargets = [];

  await ctx.reply(broadcastDraftText(draft), {
    parse_mode:   "HTML",
    reply_markup: broadcastActionsKeyboard(draft.id),
  });
}

// ─── Send broadcast now ───────────────────────────────────────────────────────

export async function sendBroadcast(ctx: BotContext, draftId: string): Promise<void> {
  const record = await broadcastRepo.get(draftId);
  if (!record) { await ctx.reply("Draft not found."); return; }

  if (!record.targets.length) {
    await ctx.reply("⚠️ Set a target first (all users / group / channel).");
    return;
  }

  await broadcastRepo.update(draftId, { isDraft: false, sentAt: Date.now() });

  await createJob("broadcast", {
    content:      record.content,
    targets:      record.targets,
    batchIndex:   0,
    totalBatches: 1,
  });

  await ctx.reply(`✅ Broadcast queued. Workers will deliver in batches of 25.`, {
    reply_markup: backKeyboard("admin:broadcast"),
  });
}

// ─── Schedule broadcast ───────────────────────────────────────────────────────

export async function scheduleBroadcast(
  ctx: BotContext,
  draftId: string,
  scheduledAt: number
): Promise<void> {
  const record = await broadcastRepo.get(draftId);
  if (!record) { await ctx.reply("Draft not found."); return; }

  await broadcastRepo.update(draftId, { scheduledAt });

  await createJob(
    "broadcast",
    { content: record.content, targets: record.targets, batchIndex: 0, totalBatches: 1 },
    scheduledAt
  );

  await ctx.reply(`⏰ Scheduled for ${new Date(scheduledAt).toUTCString()}`, {
    reply_markup: backKeyboard("admin:broadcast"),
  });
}

// ─── PROACTIVE: update buttons on sent broadcast (no user trigger needed) ─────

export async function handleUpdateButtons(
  ctx: BotContext,
  broadcastId: string
): Promise<void> {
  await ctx.reply("🔄 Updating buttons on all sent messages...");
  const record = await broadcastRepo.get(broadcastId);
  if (!record) { await ctx.reply("Broadcast not found."); return; }

  await updateBroadcastButtons(broadcastId, record.content.buttons);
  await ctx.reply("✅ Buttons updated on all previously sent messages.");
}
