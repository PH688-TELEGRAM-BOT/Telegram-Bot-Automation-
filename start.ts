import type { BotContext } from "../../types/index.ts";
import { userRepo } from "../../database/repositories/userRepo.ts";
import { broadcastRepo } from "../../database/repositories/broadcastRepo.ts";
import { kvGet, KK } from "../../core/state.ts";
import { broadcastKeyboard } from "../../ui/keyboards.ts";
import type { SystemConfig } from "../../types/index.ts";

export async function handleStart(ctx: BotContext): Promise<void> {
  const user = ctx.from!;

  // Upsert user — auto-restores archived users on activity
  await userRepo.upsert({
    id:        user.id,
    firstName: user.first_name,
    username:  user.username,
  });

  // Load latest broadcast — this IS the main screen
  const latest = await broadcastRepo.getLatest();

  if (!latest) {
    await ctx.reply("👋 Welcome! Stay tuned for updates.", {
      parse_mode: "HTML",
    });
    return;
  }

  const { content } = latest;
  const kb = content.buttons ? broadcastKeyboard(content.buttons) : undefined;

  const opts = {
    caption:      content.caption ?? content.text ?? "",
    parse_mode:   "HTML" as const,
    reply_markup: kb,
  };

  if (content.photoFileId) {
    await ctx.replyWithPhoto(content.photoFileId, opts);
  } else if (content.videoFileId) {
    await ctx.replyWithVideo(content.videoFileId, opts);
  } else {
    await ctx.reply(content.text ?? "Welcome!", {
      parse_mode:   "HTML",
      reply_markup: kb,
    });
  }
}
