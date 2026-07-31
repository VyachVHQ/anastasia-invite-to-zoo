export interface Animal {
  id: string
  name: string
  latinName: string
  image: string
  imageFit?: string
  fact: string
  legend: string
  category: string
  coordinates: { x: number; y: number }
}

export interface Exhibition {
  id: string
  name: string
  type: 'exhibition'
  emoji: string
  image?: string
  category?: string
  fact: string
  legend: string
  animals: string[]
  residents?: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
}

export interface LikeResult {
  animalId: string
  liked: boolean
}

export interface RouteMode {
  id: 'optimal' | 'long'
  name: string
  description: string
}

export type Screen =
  | 'loading'
  | 'welcome'
  | 'likes'
  | 'map'
  | 'invitation'
  | 'final'

export interface InviteData {
  date: string
  time: string
  comment?: string
  cuisines?: string[]
}

export interface AppState {
  screen: Screen
  likedAnimals: string[]
  dislikedAnimals: string[]
  currentAnimalIndex: number
  routeMode: RouteMode['id']
  routeOrder: string[]
  inviteData: InviteData | null
  rejectionMessage: string
  rejectionCount: number
}
