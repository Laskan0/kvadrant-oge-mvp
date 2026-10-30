import { checkDiscriminant, checkRoots } from './math'
import type { QuadraticCoefficients } from './math'

export interface PracticeState {
  stage: 'discriminant' | 'roots' | 'solved'
  discriminant: string
  root1: string
  root2: string
  feedback: 'idle' | 'empty' | 'invalid' | 'incorrect' | 'accepted'
  attempts: number
  hints: { discriminant: number; roots: number }
  fullSolution: boolean
  coordinates: { x: number; y: number } | null
}
export type PracticeAction =
  | { type: 'EDIT'; field: 'discriminant' | 'root1' | 'root2'; value: string }
  | { type: 'CHECK' }
  | { type: 'HINT' }
  | { type: 'SHOW_SOLUTION' }

export function createPracticeState(): PracticeState {
  return { stage: 'discriminant', discriminant: '', root1: '', root2: '', feedback: 'idle', attempts: 0, hints: { discriminant: 0, roots: 0 }, fullSolution: false, coordinates: null }
}

export function practiceReducer(state: PracticeState, action: PracticeAction, coefficients: QuadraticCoefficients): PracticeState {
  if (state.stage === 'solved') return state
  switch (action.type) {
    case 'EDIT':
      if ((state.stage === 'discriminant') !== (action.field === 'discriminant')) return state
      return { ...state, [action.field]: action.value, feedback: 'idle' }
    case 'HINT':
      return { ...state, hints: { ...state.hints, [state.stage]: Math.min(state.hints[state.stage] + 1, 2) } }
    case 'SHOW_SOLUTION':
      return { ...state, fullSolution: true }
    case 'CHECK': {
      const attempts = state.attempts + 1
      if (state.stage === 'discriminant') {
        const result = checkDiscriminant(state.discriminant, coefficients)
        return result.status === 'correct'
          ? { ...state, stage: 'roots', discriminant: String(result.value), feedback: 'accepted', attempts }
          : { ...state, feedback: result.status, attempts }
      }
      const result = checkRoots([state.root1, state.root2], coefficients)
      if (result.status === 'correct') return { ...state, stage: 'solved', feedback: 'accepted', coordinates: result.coordinates, attempts }
      return { ...state, feedback: result.status === 'not-two-roots' ? 'incorrect' : result.status, attempts }
    }
  }
}
