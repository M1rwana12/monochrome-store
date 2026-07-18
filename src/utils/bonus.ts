// MONO Club levels — keep in sync with server/auth.mjs
export type LevelName = 'silver' | 'graphite' | 'black'

export interface Level {
  name: LevelName
  rate: number
  minUsd: number
}

export const LEVELS: Level[] = [
  { name: 'silver', rate: 0.03, minUsd: 0 },
  { name: 'graphite', rate: 0.05, minUsd: 120 },
  { name: 'black', rate: 0.07, minUsd: 480 },
]

export function levelFor(totalSpentUsd: number): Level {
  return [...LEVELS].reverse().find(l => totalSpentUsd >= l.minUsd) ?? LEVELS[0]
}

export function nextLevel(totalSpentUsd: number): { level: Level; remainingUsd: number } | null {
  const next = LEVELS.find(l => l.minUsd > totalSpentUsd)
  return next ? { level: next, remainingUsd: next.minUsd - totalSpentUsd } : null
}
