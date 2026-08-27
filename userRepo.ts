import type { User } from "../../types/index.ts";
import { kvGet, kvSet, kvList, KK } from "../../core/state.ts";
import { C } from "../../config/index.ts";

export const userRepo = {
  async upsert(data: Pick<User, "id" | "firstName"> & Partial<User>): Promise<User> {
    const existing = await kvGet<User>(KK.user(data.id));
    const now = Date.now();
    const user: User = {
      id:            data.id,
      username:      data.username ?? existing?.username,
      firstName:     data.firstName,
      status:        "active",
      createdAt:     existing?.createdAt ?? now,
      lastSeenAt:    now,
      sourceGroupId: data.sourceGroupId ?? existing?.sourceGroupId,
    };
    await kvSet(KK.user(data.id), user);
    return user;
  },

  get: (id: number) => kvGet<User>(KK.user(id)),

  async getAll(): Promise<User[]> {
    return kvList<User>(KK.allUsers());
  },

  async getAllActive(): Promise<User[]> {
    return (await kvList<User>(KK.allUsers())).filter((u) => u.status === "active");
  },

  async markSeen(id: number): Promise<void> {
    const u = await kvGet<User>(KK.user(id));
    if (!u) return;
    await kvSet(KK.user(id), { ...u, lastSeenAt: Date.now(), status: "active" });
  },

  /** Auto-archive users inactive ≥ 3 days. Returns count archived. */
  async archiveInactive(): Promise<number> {
    const all = await kvList<User>(KK.allUsers());
    const cutoff = Date.now() - C.ARCHIVE_AFTER_MS;
    let n = 0;
    for (const u of all) {
      if (u.status === "active" && u.lastSeenAt < cutoff) {
        await kvSet(KK.user(u.id), { ...u, status: "archived" });
        n++;
      }
    }
    return n;
  },
};
