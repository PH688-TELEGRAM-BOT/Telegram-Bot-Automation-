import type { BotContext, AdminSession } from "../../types/index.ts";
import { adminRepo } from "../../database/repositories/adminRepo.ts";
import { verifyKey } from "../../security/index.ts";
import { adminPanelKeyboard } from "../../ui/keyboards.ts";
import { adminPanelText } from "../../ui/screens.ts";
import { C } from "../../config/index.ts";

export async function startAdminLogin(ctx: BotContext): Promise<void> {
  const config = await adminRepo.getConfig();
  if (!config) {
    await ctx.reply("⚠️ Admin not configured. Set up via KV seed script.");
    return;
  }

  if (!config.adminIds.includes(ctx.from!.id)) {
    await ctx.reply("⛔ Unauthorized.");
    return;
  }

  // Check for existing valid session
  const existing = await adminRepo.getSession(ctx.from!.id);
  if (existing && existing.expiresAt > Date.now()) {
    await showAdminPanel(ctx);
    return;
  }

  ctx.session.awaitingSecretKey = true;
  await ctx.reply("🔐 Enter admin secret key:");
}

export async function handleSecretKeyInput(ctx: BotContext): Promise<void> {
  const config = await adminRepo.getConfig();
  const input = ctx.message?.text ?? "";

  // Delete the user's key message for security
  await ctx.deleteMessage().catch(() => {});

  if (!config || !await verifyKey(input, config.secretKeyHash)) {
    ctx.session.awaitingSecretKey = false;
    await ctx.reply("❌ Invalid key.");
    return;
  }

  const now = Date.now();
  const session: AdminSession = {
    adminId:          ctx.from!.id,
    createdAt:        now,
    lastActivityAt:   now,
    expiresAt:        now + C.ADMIN_SESSION_TTL_MS,
  };
  await adminRepo.saveSession(session);
  ctx.session.awaitingSecretKey = false;

  await showAdminPanel(ctx);
}

export async function showAdminPanel(ctx: BotContext): Promise<void> {
  const name = ctx.from!.first_name;
  await ctx.reply(adminPanelText(name), {
    parse_mode:   "HTML",
    reply_markup: adminPanelKeyboard(),
  });
}
