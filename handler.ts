import { Composer } from "grammy";
import type { BotContext } from "../../types/index.ts";
import { sessionGuard } from "../../security/index.ts";
import { showMenu, showSupportMenu, handleSupportIntent } from "../user/navigation.ts";
import { handleStart } from "../user/start.ts";
import { showAdminPanel } from "../admin/auth.ts";
import { showBroadcastList, createDraft, sendBroadcast } from "../admin/broadcast.ts";
import { showCommunityList, showInbox, resolveInboxMessage } from "../admin/community.ts";
import { userRepo } from "../../database/repositories/userRepo.ts";
import { dataText, subscribersText, settingsText, helpText } from "../../ui/screens.ts";
import { adminPanelKeyboard, backKeyboard } from "../../ui/keyboards.ts";
import type { SupportIntent } from "../../types/index.ts";
import { kvList, KK } from "../../core/state.ts";
import type { Job, User } from "../../types/index.ts";

const SUPPORT_INTENTS: SupportIntent[] = ["payment", "order", "partnership", "report", "other"];

export const callbackRouter = new Composer<BotContext>();

callbackRouter.callbackQuery(/.*/, async (ctx) => {
  await ctx.answerCallbackQuery(); // always ack immediately

  const data = ctx.callbackQuery.data ?? "";
  const [ns, action, ...rest] = data.split(":");
  const param = rest.join(":");

  // Mark user seen on any interaction
  if (ctx.from) await userRepo.markSeen(ctx.from.id);

  // ─── Navigation ──────────────────────────────────────────────────────────
  if (ns === "nav") {
    if (action === "menu")      { await showMenu(ctx);        return; }
    if (action === "broadcast") { await handleStart(ctx);     return; }
    if (action === "support")   { await showSupportMenu(ctx); return; }
  }

  // ─── Support intent selection ─────────────────────────────────────────────
  if (ns === "support") {
    if (action === "open") { await showSupportMenu(ctx); return; }
    if (SUPPORT_INTENTS.includes(action as SupportIntent)) {
      await handleSupportIntent(ctx, action as SupportIntent);
      return;
    }
  }

  // ─── Admin panel navigation (requires session) ────────────────────────────
  if (ns === "admin") {
    const config = await import("../../database/repositories/adminRepo.ts")
      .then((m) => m.adminRepo.getConfig());
    if (!config?.adminIds.includes(ctx.from!.id)) {
      await ctx.answerCallbackQuery("⛔ Unauthorized");
      return;
    }

    // Validate session for all admin actions
    const session = await import("../../database/repositories/adminRepo.ts")
      .then((m) => m.adminRepo.getSession(ctx.from!.id));
    if (!session) {
      await ctx.reply("🔒 Session expired. Use /admin to login.");
      return;
    }

    switch (action) {
      case "panel":       await showAdminPanel(ctx);                          break;
      case "broadcast":   await showBroadcastList(ctx);                       break;
      case "community":   await showCommunityList(ctx);                       break;
      case "subscribers": await showSubscribersScreen(ctx);                   break;
      case "inbox":       await showInbox(ctx);                               break;
      case "data":        await showDataScreen(ctx);                          break;
      case "settings":    await ctx.reply(settingsText(), { parse_mode: "HTML", reply_markup: backKeyboard("admin:panel") }); break;
      case "help":        await ctx.reply(helpText(),     { parse_mode: "HTML", reply_markup: backKeyboard("admin:panel") }); break;
    }
    return;
  }

  // ─── Broadcast actions ────────────────────────────────────────────────────
  if (ns === "bc") {
    if (action === "new")       { await createDraft(ctx);                   return; }
    if (action === "send")      { await sendBroadcast(ctx, param);          return; }
    // Additional bc: actions (edit_text, set_media, etc.) handled by conversation flows
  }

  // ─── Inbox actions ────────────────────────────────────────────────────────
  if (ns === "inbox") {
    if (action === "resolve")   { await resolveInboxMessage(ctx, param);    return; }
    if (action === "archive")   { await resolveInboxMessage(ctx, param);    return; }
  }

  // ─── Confirm dialog ───────────────────────────────────────────────────────
  if (ns === "confirm") {
    if (action === "no") { await ctx.deleteMessage().catch(() => {}); return; }
    // "yes" with param handled by originating flow
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function showSubscribersScreen(ctx: BotContext): Promise<void> {
  const all = await userRepo.getAll();
  const active   = all.filter((u) => u.status === "active");
  const archived = all.filter((u) => u.status === "archived");
  await ctx.reply(subscribersText(active, archived), {
    parse_mode:   "HTML",
    reply_markup: backKeyboard("admin:panel"),
  });
}

async function showDataScreen(ctx: BotContext): Promise<void> {
  const users = await userRepo.getAll();
  const jobs  = await kvList<Job>(KK.allJobs());
  await ctx.reply(dataText(users, jobs), {
    parse_mode:   "HTML",
    reply_markup: backKeyboard("admin:panel"),
  });
}
