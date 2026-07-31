'use client'

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { AppState, Screen, RouteMode, InviteData } from '@/types'

const initialState: AppState = {
  screen: 'loading',
  likedAnimals: [],
  dislikedAnimals: [],
  currentAnimalIndex: 0,
  routeMode: 'optimal',
  routeOrder: [],
  inviteData: null,
  rejectionMessage: '',
  rejectionCount: 0,
}

type Action =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'ADD_LIKE'; payload: string }
  | { type: 'ADD_DISLIKE'; payload: string }
  | { type: 'NEXT_ANIMAL' }
  | { type: 'RESET_LIKES' }
  | { type: 'SET_ROUTE_MODE'; payload: RouteMode['id'] }
  | { type: 'SET_ROUTE_ORDER'; payload: string[] }
  | { type: 'SET_INVITE'; payload: InviteData }
  | { type: 'SET_REJECTION'; payload: string }
  | { type: 'INCREMENT_REJECTION' }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }
    case 'ADD_LIKE':
      return { ...state, likedAnimals: [...state.likedAnimals, action.payload] }
    case 'ADD_DISLIKE':
      return { ...state, dislikedAnimals: [...state.dislikedAnimals, action.payload] }
    case 'NEXT_ANIMAL':
      return { ...state, currentAnimalIndex: state.currentAnimalIndex + 1 }
    case 'RESET_LIKES':
      return { ...state, likedAnimals: [], dislikedAnimals: [], currentAnimalIndex: 0 }
    case 'SET_ROUTE_MODE':
      return { ...state, routeMode: action.payload }
    case 'SET_ROUTE_ORDER':
      return { ...state, routeOrder: action.payload }
    case 'SET_INVITE':
      return { ...state, inviteData: action.payload }
    case 'SET_REJECTION':
      return { ...state, rejectionMessage: action.payload }
    case 'INCREMENT_REJECTION':
      return { ...state, rejectionCount: state.rejectionCount + 1 }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  goTo: (screen: Screen) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const goTo = useCallback((screen: Screen) => {
    dispatch({ type: 'SET_SCREEN', payload: screen })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, goTo }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
