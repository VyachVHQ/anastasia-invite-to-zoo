import type { AppState } from '@/types'
import animalsData from '@/data/animals.json'
import markersData from '@/../markers.json'
import { buildRanking } from './ranking'
import { cuisines } from '@/components/ui/CuisineModal'

const { animals } = animalsData

// Вставь сюда URL от Google Apps Script (см. шаги в инструкции)
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwGvJyVOdwuiLa4rV5NoaibdiYK0wEHxa7ZYJbefn_DY7Kq0mirFDszhOB037NEV-wNbA/exec'

export function buildReport(state: AppState): string {
  const lines: string[] = []
  lines.push('=== Ответ приглашённого ===')
  lines.push(`Дата: ${state.inviteData?.date || '—'}`)
  lines.push(`Время: ${state.inviteData?.time || '—'}`)
  if (state.inviteData?.comment) lines.push(`Комментарий: ${state.inviteData.comment}`)
  const cuisineNames = (state.inviteData?.cuisines || [])
    .map((id) => cuisines.find((c) => c.id === id)?.name || id)
  lines.push(`Кухни после прогулки: ${cuisineNames.length ? cuisineNames.join(', ') : 'не выбраны'}`)
  if (state.rejectionMessage) lines.push(`Отказ: ${state.rejectionMessage}`)

  lines.push('')
  lines.push('Ответы на опрос:')
  const markerIds = new Set(markersData.markers.map((m: any) => m.id))
  const excluded = new Set(['waterfowl', 'penguin', 'swan'])
  const liked = new Set(state.likedAnimals)
  const disliked = new Set(state.dislikedAnimals)
  const quizAnimals = animals.filter((a) => markerIds.has(a.id) && !excluded.has(a.id))
  for (const a of quizAnimals) {
    const verdict = liked.has(a.id) ? 'нравится' : disliked.has(a.id) ? 'не нравится' : 'не оценил(а)'
    lines.push(`${a.name} - ${verdict}`)
  }

  lines.push('')
  const ranking = buildRanking(state.likedAnimals)
  lines.push('Любимые животные: ' + ranking.slice(0, 10).map((a) => a.name).join(', '))

  return lines.join('\n')
}

export function sendReport(report: string) {
  if (!WEBHOOK_URL) return
  fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: report,
  }).catch(() => {})
}
