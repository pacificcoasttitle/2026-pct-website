/**
 * HR-sync feature flag (Stage 5).
 *
 * The sync-down engine (lib/hr-sync/sync-down.ts) is wired into the HR
 * write paths but stays DORMANT until this flag is flipped ON in the
 * environment (Vercel, by the Director). Until then, the sync is never
 * called and HR writes behave exactly as they do today.
 *
 * ⚠️ FAIL-SAFE DEFAULT: OFF. Only the literal string 'true' enables it.
 * A missing, empty, or garbage value → OFF. There is no way to
 * accidentally turn this on with a typo.
 */
export function isHrSyncEnabled(): boolean {
  return process.env.HR_SYNC_ENABLED === 'true'
}

/** The env var name, exported so call sites / docs reference one source. */
export const HR_SYNC_FLAG = 'HR_SYNC_ENABLED'
