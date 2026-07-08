export interface FuzzyMatchResult {
  matched: boolean
  score: number
  /** Array of [start, end] character index pairs that matched */
  ranges: [number, number][]
}

/**
 * Simple fuzzy substring matcher.
 * Returns matched=true if all query chars appear in order in text.
 * Score is higher for consecutive matches and prefix matches.
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatchResult {
  if (!query) {
    return { matched: true, score: 0, ranges: [] }
  }

  const q = query.toLowerCase()
  const t = text.toLowerCase()

  // Fast substring check first (highest score)
  const subIdx = t.indexOf(q)
  if (subIdx !== -1) {
    return {
      matched: true,
      score: subIdx === 0 ? 100 : 80,
      ranges: [[subIdx, subIdx + q.length]],
    }
  }

  // Fuzzy character-by-character matching
  const ranges: [number, number][] = []
  let qi = 0
  let rangeStart = -1
  let rangeEnd = -1
  let score = 0
  let consecutive = 0

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++
      if (rangeStart === -1) {
        rangeStart = ti
        rangeEnd = ti
      } else if (ti === rangeEnd + 1) {
        // Consecutive
        rangeEnd = ti
        consecutive++
        score += 10
      } else {
        ranges.push([rangeStart, rangeEnd + 1])
        rangeStart = ti
        rangeEnd = ti
        consecutive = 0
      }
      score += ti === 0 ? 5 : 1
    }
  }

  if (rangeStart !== -1) {
    ranges.push([rangeStart, rangeEnd + 1])
  }

  const matched = qi === q.length
  if (!matched) {
    return { matched: false, score: 0, ranges: [] }
  }

  // Penalize for gap width
  const totalGap = ranges.reduce((acc, [s, e], i) => {
    if (i === 0) return acc
    const prevEnd = (ranges[i - 1] as [number, number])[1]
    return acc + (s - prevEnd)
  }, 0)

  return { matched: true, score: Math.max(0, score - totalGap + consecutive * 5), ranges }
}
