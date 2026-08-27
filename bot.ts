import { Bot, session } from "grammy";
import type { BotContext, SessionData } from "../types/index.ts";
import { env } from "../config/index.ts";

let _bot: Bot<BotContext> | null = null;

export function getBotInstance(): Bot<BotContext> {
  if (!_bot) throw new Error("Bot not initialized — call createBot() first");
  return _bot;
}

export function createBot(): Bot<BotContext> {
  if (_bot) return _bot;

  _bot = new Bot<BotContext>(env.BOT_TOKEN);

  // grammY session backed by Deno KV
  _bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: denoKvStorage(),
    })
  );

  return _bot;
}

// ─── Deno KV session storage adapter for grammY ───────────────────────────────

import { kvGet, kvSet, kvDelete } from "./state.ts";

function denoKvStorage() {
  return {
    async read(key: string): Promise<SessionData | undefined> {
      return (await kvGet<SessionData>(["session", key])) ?? undefined;
    },
    async write(key: string, value: SessionData): Promise<void> {
      await kvSet(["session", key], value);
    },
    async delete(key: string): Promise<void> {
      await kvDelete(["session", key]);
    },
  };
}
