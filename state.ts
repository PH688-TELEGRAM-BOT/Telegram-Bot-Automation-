let _kv: Deno.Kv | null = null;

export async function getKv(): Promise<Deno.Kv> {
  if (!_kv) _kv = await Deno.openKv();
  return _kv;
}

export async function kvGet<T>(key: Deno.KvKey): Promise<T | null> {
  const kv = await getKv();
  const r = await kv.get<T>(key);
  return r.value ?? null;
}

export async function kvSet<T>(
  key: Deno.KvKey,
  value: T,
  options?: { expireIn?: number }
): Promise<void> {
  const kv = await getKv();
  await kv.set(key, value, options);
}

export async function kvDelete(key: Deno.KvKey): Promise<void> {
  const kv = await getKv();
  await kv.delete(key);
}

export async function kvList<T>(prefix: Deno.KvKey): Promise<T[]> {
  const kv = await getKv();
  const results: T[] = [];
  for await (const entry of kv.list<T>({ prefix })) {
    if (entry.value != null) results.push(entry.value);
  }
  return results;
}

// ─── Canonical key definitions ────────────────────────────────────────────────

export const KK = {
  user:           (id: number)     => ["user",         String(id)]  as const,
  allUsers:       ()               => ["user"]                      as const,

  adminSession:   (id: number)     => ["admin_session", String(id)] as const,
  adminConfig:    ()               => ["admin",         "config"]   as const,

  supportSession: (id: number)     => ["support",       String(id)] as const,

  job:            (id: string)     => ["job",           id]         as const,
  allJobs:        ()               => ["job"]                       as const,

  broadcastLatest: ()              => ["broadcast",     "latest"]   as const,
  broadcast:      (id: string)     => ["broadcast",     id]         as const,
  allBroadcasts:  ()               => ["broadcast"]                 as const,

  community:      (id: string)     => ["community",     id]         as const,
  allCommunities: ()               => ["community"]                 as const,

  inbox:          (id: string)     => ["inbox",         id]         as const,
  allInbox:       ()               => ["inbox"]                     as const,

  systemConfig:   ()               => ["config",        "system"]   as const,
};
