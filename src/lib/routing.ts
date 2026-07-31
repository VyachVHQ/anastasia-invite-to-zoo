import type { Animal } from '@/types'

interface Point {
  x: number
  y: number
}

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function findNearest(from: Point, remaining: Animal[]): Animal | null {
  let nearest: Animal | null = null
  let minDist = Infinity

  for (const candidate of remaining) {
    const d = distance(from, candidate.coordinates)
    if (d < minDist) {
      minDist = d
      nearest = candidate
    }
  }

  return nearest
}

export function buildOptimalRoute(
  animals: Animal[],
  entrance: Point = { x: 3, y: 50 },
  exit: Point = { x: 50, y: 92 },
): Animal[] {
  if (animals.length === 0) return []
  if (animals.length === 1) return [...animals]

  const unvisited = [...animals]
  const route: Animal[] = []
  let current: Point = entrance

  while (unvisited.length > 0) {
    const next = findNearest(current, unvisited)
    if (!next) break
    route.push(next)
    current = next.coordinates
    const idx = unvisited.indexOf(next)
    if (idx !== -1) unvisited.splice(idx, 1)
  }

  validateRoute(route, animals)
  return route
}

export function buildLongRoute(
  animals: Animal[],
  entrance: Point = { x: 3, y: 50 },
  exit: Point = { x: 50, y: 92 },
): Animal[] {
  if (animals.length === 0) return []
  if (animals.length <= 2) return [...animals]

  const optimal = buildOptimalRoute(animals, entrance, exit)

  if (optimal.length <= 3) return optimal

  const shuffled = [...optimal]
  const swapCount = Math.min(Math.floor(shuffled.length / 3), 4)

  for (let i = 0; i < swapCount; i++) {
    const a = 1 + Math.floor(Math.random() * (shuffled.length - 2))
    let b = 1 + Math.floor(Math.random() * (shuffled.length - 2))
    while (b === a) b = 1 + Math.floor(Math.random() * (shuffled.length - 2))
    ;[shuffled[a], shuffled[b]] = [shuffled[b], shuffled[a]]
  }

  validateRoute(shuffled, animals)
  return shuffled
}

function validateRoute(route: Animal[], allAnimals: Animal[]) {
  const routeIds = new Set(route.map((a) => a.id))
  const allIds = new Set(allAnimals.map((a) => a.id))
  if (routeIds.size < allIds.size) {
    const missing = allAnimals.filter((a) => !routeIds.has(a.id))
    route.push(...missing)
  }
}

export function getRoutePath(animals: Animal[], entrance: Point, exit: Point): Point[] {
  const points: Point[] = [entrance]
  for (const a of animals) points.push(a.coordinates)
  points.push(exit)
  return points
}
