import animalsData from '@/data/animals.json'
import type { Animal } from '@/types'

const { animals } = animalsData

export function getAnimalsByCategory(categoryIds: string[]): Animal[] {
  if (categoryIds.length === 0) return animals as Animal[]
  return (animals as Animal[]).filter((a) => categoryIds.includes(a.category))
}

export function buildRanking(likedIds: string[]): Animal[] {
  const liked = new Set(likedIds)
  const all = animals as Animal[]
  const likedAnimals = all.filter((a) => liked.has(a.id))
  const dislikedAnimals = all.filter((a) => !liked.has(a.id))
  return [...likedAnimals, ...dislikedAnimals]
}
