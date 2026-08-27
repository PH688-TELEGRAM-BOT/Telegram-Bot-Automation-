import type { BroadcastRecord, Community, InboxMessage } from "../../types/index.ts";
import { kvGet, kvSet, kvList, kvDelete, KK } from "../../core/state.ts";
import { generateId } from "../../utils/index.ts";

// ─── Broadcast repo ───────────────────────────────────────────────────────────

export const broadcastRepo = {
  async save(record: BroadcastRecord): Promise<void> {
    await kvSet(KK.broadcast(record.id), record);
    if (!record.isDraft && record.sentAt) {
      await kvSet(KK.broadcastLatest(), record);
    }
  },

  get: (id: string) => kvGet<BroadcastRecord>(KK.broadcast(id)),

  getLatest: () => kvGet<BroadcastRecord>(KK.broadcastLatest()),

  async getAll(): Promise<BroadcastRecord[]> {
    return kvList<BroadcastRecord>(KK.allBroadcasts());
  },

  async create(data: Omit<BroadcastRecord, "id" | "createdAt">): Promise<BroadcastRecord> {
    const record: BroadcastRecord = { id: generateId(), createdAt: Date.now(), ...data };
    await kvSet(KK.broadcast(record.id), record);
    return record;
  },

  async update(id: string, patch: Partial<BroadcastRecord>): Promise<void> {
    const existing = await kvGet<BroadcastRecord>(KK.broadcast(id));
    if (!existing) throw new Error(`Broadcast ${id} not found`);
    const updated = { ...existing, ...patch };
    await kvSet(KK.broadcast(id), updated);
    // Keep latest in sync if this broadcast was sent
    if (updated.sentAt) await kvSet(KK.broadcastLatest(), updated);
  },
};

// ─── Community repo ───────────────────────────────────────────────────────────

export const communityRepo = {
  save: (c: Community) => kvSet(KK.community(c.id), c),
  get:  (id: string)   => kvGet<Community>(KK.community(id)),
  getAll: ()           => kvList<Community>(KK.allCommunities()),
  delete: (id: string) => kvDelete(KK.community(id)),
};

// ─── Inbox repo ───────────────────────────────────────────────────────────────

export const inboxRepo = {
  async add(data: Omit<InboxMessage, "id">): Promise<InboxMessage> {
    const msg: InboxMessage = { id: generateId(), ...data };
    await kvSet(KK.inbox(msg.id), msg);
    return msg;
  },

  get: (id: string) => kvGet<InboxMessage>(KK.inbox(id)),

  async getAll(): Promise<InboxMessage[]> {
    return kvList<InboxMessage>(KK.allInbox());
  },

  async getUnread(): Promise<InboxMessage[]> {
    return (await kvList<InboxMessage>(KK.allInbox()))
      .filter((m) => m.status === "unread");
  },

  async update(id: string, patch: Partial<InboxMessage>): Promise<void> {
    const m = await kvGet<InboxMessage>(KK.inbox(id));
    if (!m) return;
    await kvSet(KK.inbox(id), { ...m, ...patch });
  },
};
