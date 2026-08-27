import { userRepo } from "../../database/repositories/userRepo.ts";
import { processJobs } from "../../core/queue.ts";
import { C } from "../../config/index.ts";
import { logger } from "../../utils/index.ts";

// ─── Archive inactive users every hour ───────────────────────────────────────

export function startScheduler(): void {
  // Archive check
  setInterval(async () => {
    try {
      const n = await userRepo.archiveInactive();
      if (n > 0) logger.info(`Archived ${n} inactive users`);
    } catch (e) {
      logger.error("Archive cron error", e);
    }
  }, C.CLEANUP_INTERVAL_MS);

  // Scheduled job check (runs with worker already, but explicit for clarity)
  setInterval(async () => {
    try {
      await processJobs();
    } catch (e) {
      logger.error("Scheduler job error", e);
    }
  }, 60_000); // check scheduled jobs every minute

  logger.info("Scheduler started");
}

// ─── PROACTIVE outbound: run any action without an incoming message ───────────
// Example: update buttons on a schedule, send reminders, etc.

export async function runProactiveUpdate(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    logger.error("Proactive update error", e);
  }
}
