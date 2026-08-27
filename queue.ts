import type { Job, BroadcastPayload, SupportPayload, JobType, JobStatus } from "../types/index.ts";
import { kvGet, kvSet, kvList } from "./state.ts";
import { KK } from "./state.ts";
import { C } from "../config/index.ts";
import { generateId, sleep, logger } from "../utils/index.ts";

// ─── Batcher ──────────────────────────────────────────────────────────────────

export function chunk<T>(arr: T[], size = C.BATCH_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ─── Backoff retry ────────────────────────────────────────────────────────────

export async function withRetry<T>(fn: () => Promise<T>, label = "op"): Promise<T> {
  let last: unknown;
  for (let i = 0; i < C.MAX_RETRIES; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      const delay = C.RETRY_BACKOFF_BASE_MS * 2 ** i;
      logger.warn(`${label} failed attempt ${i + 1}, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw last;
}

// ─── Job manager ──────────────────────────────────────────────────────────────

export async function createJob(
  type: JobType,
  payload: Job["payload"],
  scheduledAt?: number
): Promise<Job> {
  const job: Job = {
    id: generateId(),
    type,
    status: "pending",
    payload,
    createdAt: Date.now(),
    scheduledAt,
    attempts: 0,
  };
  await kvSet(KK.job(job.id), job);
  logger.info(`Job created: ${job.id} (${type})`);
  return job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<void> {
  const job = await kvGet<Job>(KK.job(id));
  if (!job) return;
  await kvSet(KK.job(id), { ...job, ...patch });
}

export async function getPendingJobs(): Promise<Job[]> {
  const all = await kvList<Job>(KK.allJobs());
  const now = Date.now();
  return all.filter(
    (j) => j.status === "pending" && (!j.scheduledAt || j.scheduledAt <= now)
  );
}

// ─── Worker ───────────────────────────────────────────────────────────────────

let workerBusy = false;

export async function processJobs(): Promise<void> {
  if (workerBusy) return;
  workerBusy = true;
  try {
    const jobs = await getPendingJobs();
    for (const job of jobs) {
      await updateJob(job.id, { status: "running", startedAt: Date.now() });
      try {
        // Lazily import to avoid circular deps
        if (job.type === "broadcast") {
          const { dispatchBroadcast } = await import("../services/broadcast/dispatcher.ts");
          await dispatchBroadcast(job.payload as BroadcastPayload);
        } else if (job.type === "support_forward") {
          const { forwardToAdmin } = await import("../services/support/sessionManager.ts");
          await forwardToAdmin(job.payload as SupportPayload);
        }
        await updateJob(job.id, { status: "done", completedAt: Date.now() });
        logger.info(`Job done: ${job.id}`);
      } catch (err) {
        const attempts = (job.attempts ?? 0) + 1;
        const status: JobStatus = attempts >= C.MAX_RETRIES ? "failed" : "pending";
        await updateJob(job.id, { status, attempts, error: String(err) });
        logger.error(`Job ${job.id} failed (${attempts})`, err);
      }
    }
  } finally {
    workerBusy = false;
  }
}

export function startWorker(): void {
  setInterval(processJobs, C.WORKER_POLL_MS);
  logger.info("Queue worker started");
}
