import type { AppState } from '@/types'
import { buildRanking } from './ranking'
import animalsData from '@/data/animals.json'
import { cuisines } from '@/components/ui/CuisineModal'

const { animals } = animalsData

export interface SubmissionData {
  date: string
  time: string
  comment?: string
  route: string[]
  ranking: string[]
  cuisines: string[]
  rejectionMessage?: string
}

export function collectSubmissionData(state: AppState): SubmissionData {
  const ranking = buildRanking(state.likedAnimals)
  const routeOrder = state.routeOrder.length > 0
    ? state.routeOrder
    : ranking.slice(0, 10).map((a) => a.id)

  const cuisineNames = (state.inviteData?.cuisines || [])
    .map((id) => cuisines.find((c) => c.id === id)?.name || id)

  return {
    date: state.inviteData?.date || '',
    time: state.inviteData?.time || '',
    comment: state.inviteData?.comment,
    route: routeOrder,
    ranking: ranking.map((a) => a.id),
    cuisines: cuisineNames,
    rejectionMessage: state.rejectionMessage || undefined,
  }
}

export function submitData(data: SubmissionData) {
  console.log('=== Данные отправлены владельцу ===', JSON.stringify(data, null, 2))
}
