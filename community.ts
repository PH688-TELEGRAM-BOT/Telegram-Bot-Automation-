import type { BotContext, Community } from "../../types/index.ts";
import { communityRepo, inboxRepo } from "../../database/repositories/broadcastRepo.ts";
import { communityActionsKeyboard, inboxActionsKeyboard, backKeyboard } from "../../ui/keyboards.ts";
import { inboxListText, inboxMessageText } from "../../ui/screens.ts";
import { resolveTargetId } from "../../utils/index.ts";
import { getBotInstance } from "../../core/bot.ts";

// ─── Community management ─────────────────────────────────────────────────────

export async function showCommunityList(ctx: BotContext): Promise<void> {
  const all = await communityRepo.getAll();
  if (!all.length) {
    await ctx.reply("No communities added yet.\n\nSend a group/channel ID: <code>-100xxxx</code> or <code>@username</code>", {
      parse_mode: "HTML",
    });
    return;
  }
  for (const c of all) {
    await ctx.reply(`${c.type === "channel" ? "📢" : "👥"} <code>${c.id}</code> ${c.title ?? ""}`, {
      parse_mode:   "HTML",
      reply_markup: communityActionsKeyboard(c.id),
    });
  }
}

export async function addCommunity(ctx: BotContext, rawId: string): Promise<void> {
  const id = resolveTargetId(rawId);
  const bot = getBotInstance();

  let title: string | undefined;
  try {
    const chat = await bot.api.getChat(id);
    title = "title" in chat ? chat.title : undefined;
  } catch { /* ignore */ }

  const community: Community = {
    id,
    type:    rawId.startsWith("-100") ? "channel" : "group",
    title,
    addedAt: Date.now(),
  };
  await communityRepo.save(community);
  await ctx.reply(`✅ Added: <code>${id}</code>${title ? ` — ${title}` : ""}`, {
    parse_mode:   "HTML",
    reply_markup: communityActionsKeyboard(id),
  });
}

// Send a message to a specific community (OUTBOUND — no user trigger needed)
export async function sendToCommunity(
  ctx: BotContext,
  communityId: string,
  text: string,
  silent = false
): Promise<void> {
  const bot = getBotInstance();
  const id = resolveTargetId(communityId);
  await bot.api.sendMessage(id, text, {
    parse_mode:           "HTML",
    disable_notification: silent,
  });
  await ctx.reply(`✅ Sent to ${id}`);
}

// ─── Inbox management ─────────────────────────────────────────────────────────

export async function showInbox(ctx: BotContext): Promise<void> {
  const all = await inboxRepo.getAll();
  await ctx.reply(inboxListText(all), {
    parse_mode:   "HTML",
    reply_markup: backKeyboard("admin:panel"),
  });

  const unread = all.filter((m) => m.status === "unread");
  for (const msg of unread.slice(0, 5)) {
    await ctx.reply(inboxMessageText(msg), {
      parse_mode:   "HTML",
      reply_markup: inboxActionsKeyboard(msg.id),
    });
    await inboxRepo.update(msg.id, { status: "read" });
  }
}

export async function resolveInboxMessage(ctx: BotContext, msgId: string): Promise<void> {
  await inboxRepo.update(msgId, { status: "archived" });
  // Archive only — no history stored after resolve per blueprint
  await ctx.reply("✅ Resolved. No history stored.", {
    reply_markup: backKeyboard("admin:inbox"),
  });
}
