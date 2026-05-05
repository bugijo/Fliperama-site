const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// ── Simple in-memory cache ──────────────────────────────────────────────────
interface CacheEntry { data: unknown; ts: number }
const cache = new Map<string, CacheEntry>()

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body?.detail ?? body?.message ?? `HTTP ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

async function fetchCached<T>(path: string, ttlMs: number): Promise<T> {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.ts < ttlMs) return hit.data as T
  const data = await fetchJson<T>(path)
  cache.set(path, { data, ts: Date.now() })
  return data
}

export function clearCache(path?: string) {
  if (path) cache.delete(path)
  else cache.clear()
}

// ── Types (aligned with backend public schemas) ──────────────────────────────

/** GET /v1/machines — PublicMachineOut */
export interface Machine {
  id: string
  name: string
  location: string
  lat: number
  lng: number
  status: 'active' | 'maintenance'
  imageUrl?: string
}

/** GET /v1/ranking — PublicRankingEntryOut */
export interface RankingEntry {
  position: number
  nickname: string
  score: number
  machineName?: string
  location?: string
}

/** GET /v1/prizes — PublicPrizeOut */
export interface Prize {
  id: string
  name: string
  description: string
  imageUrl?: string
  machineName?: string
  location?: string
  value?: number
}

/** GET /v1/rewards/{id} — RewardOut */
export interface Reward {
  id: string
  prizeName: string
  prizeDescription?: string
  prizeImageUrl?: string
  machineName?: string
  location?: string
  status: 'pending' | 'redeemed' | 'expired'
  expiresAt: string   // ISO datetime
  createdAt: string   // ISO datetime
}

/** POST /v1/rewards/redeem — payload */
export interface RedeemPayload {
  reward_id: string
  name: string
  phone: string
}

/** POST /v1/rewards/redeem — PublicRedeemOut */
export interface RedeemResult {
  redeemed: boolean
  reward_id: string
  message: string
}

// ── API calls ────────────────────────────────────────────────────────────────
export const api = {
  // 5-minute cache — machines don't change often
  machines: () => fetchCached<Machine[]>('/v1/machines', 5 * 60_000),

  // always fresh — polled every 10 s by the Ranking page
  ranking: () => fetchJson<RankingEntry[]>('/v1/ranking'),

  // 5-minute cache
  prizes: () => fetchCached<Prize[]>('/v1/prizes', 5 * 60_000),

  // 30-second cache; returns null if 404 (voucher not found)
  reward: async (id: string): Promise<Reward | null> => {
    try {
      return await fetchCached<Reward>(`/v1/rewards/${id}`, 30_000)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('HTTP 404')) return null
      if (err instanceof Error && err.message === 'reward not found') return null
      throw err
    }
  },

  // raw fetch so callers can inspect status codes themselves
  redeem: (payload: RedeemPayload): Promise<Response> =>
    fetch(`${BASE_URL}/v1/rewards/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // Player prize history — returns null gracefully if endpoint not available
  playerHistory: async (query: string): Promise<PlayerHistory | null> => {
    try {
      return await fetchJson<PlayerHistory>(
        `/v1/player/history?query=${encodeURIComponent(query.trim())}`,
      )
    } catch {
      return null
    }
  },
}

/** GET /v1/player/history?query= */
export interface PlayerHistoryEntry {
  prizeName: string
  machineName?: string
  location?: string
  status: string
  date: string
}

export interface PlayerHistory {
  nickname: string
  prizes: PlayerHistoryEntry[]
  rankingPosition?: number
  bestScore?: number
}
