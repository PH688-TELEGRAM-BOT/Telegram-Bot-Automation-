import type { BotContext } from "../../types/index.ts";
import { startAdminLogin, handleSecretKeyInput } from "./auth.ts";
import { adminRepo } from "../../database/repositories/adminRepo.ts";

// Entry point for /admin command
export async function handleAdminCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  const config = await adminRepo.getConfig();
  if (!config?.adminIds.includes(userId)) {
    await ctx.reply("⛔ Unauthorized.");
    return;
  }

  await startAdminLogin(ctx);
}

// Called from main text handler when admin is awaiting key
export async function handleAdminTextInput(ctx: BotContext): Promise<boolean> {
  if (ctx.session.awaitingSecretKey) {
    await handleSecretKeyInput(ctx);
    return true;
  }
  return false;
}
