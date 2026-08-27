import type { AdminSession, AdminConfig } from "../../types/index.ts";
import { kvGet, kvSet, kvDelete, KK } from "../../core/state.ts";
import { C } from "../../config/index.ts";

export const adminRepo = {
  getSession:    (id: number)          => kvGet<AdminSession>(KK.adminSession(id)),
  saveSession:   (s: AdminSession)     => kvSet(KK.adminSession(s.adminId), s, { expireIn: C.ADMIN_SESSION_TTL_MS }),
  deleteSession: (id: number)          => kvDelete(KK.adminSession(id)),

  getConfig:     ()                    => kvGet<AdminConfig>(KK.adminConfig()),
  saveConfig:    (c: AdminConfig)      => kvSet(KK.adminConfig(), c),
};
