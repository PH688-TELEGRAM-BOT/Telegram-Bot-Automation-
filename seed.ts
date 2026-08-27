/**
 * Run once to bootstrap admin config into Deno KV.
 *
 * Usage:
 *   ADMIN_ID=123456789 SECRET_KEY=yourkey deno run --allow-env --unstable-kv scripts/seed.ts
 */

const adminId   = parseInt(Deno.env.get("ADMIN_ID")    ?? "0");
const secretKey = Deno.env.get("SECRET_KEY") ?? "";

if (!adminId || !secretKey) {
  console.error("Set ADMIN_ID and SECRET_KEY env vars");
  Deno.exit(1);
}

async function hashKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const kv = await Deno.openKv();

const hash = await hashKey(secretKey);

await kv.set(["admin", "config"], {
  adminIds:      [adminId],
  secretKeyHash: hash,
});

// Default system config
await kv.set(["config", "system"], {
  archiveAfterDays: 3,
  broadcastDefaults: { silent: false },
  menuItems: [
    { label: "🎰 Brand 1", action: "screen:brand1" },
    { label: "🎲 Brand 2", action: "screen:brand2" },
    { label: "♠️ Brand 3", action: "screen:brand3" },
  ],
});

console.log(`✅ Admin seeded. ID: ${adminId}`);
console.log(`   Key hash: ${hash.slice(0, 12)}...`);

await kv.close();
