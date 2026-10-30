import { lessons } from '../data/lessons'
import { problems } from '../data/problems'
import { createPracticeState, practiceReducer } from './practice'
import type { PracticeAction, PracticeState } from './practice'

export interface ProblemResult {
  problem: number
  withSolution: boolean
  coordinates: { x: number; y: number }
}

export type AppState =
  | { screen: 'intro' }
  | { screen: 'lesson'; step: number }
  | { screen: 'practice'; problem: number; practice: PracticeState; results: ProblemResult[] }
  | { screen: 'flight'; problem: number; results: ProblemResult[] }
  | { screen: 'finish'; results: ProblemResult[] }

export type AppAction =
  | { type: 'START_LESSON' }
  | { type: 'LESSON_NEXT' }
  | { type: 'LESSON_BACK' }
  | { type: 'PRACTICE'; action: PracticeAction }
  | { type: 'FLIGHT_COMPLETE'; problem: number }
  | { type: 'REPLAY_PRACTICE' }
  | { type: 'REPEAT_THEORY' }

export const initialState: AppState = { screen: 'intro' }

function startPractice(): AppState {
  return { screen: 'practice', problem: 0, practice: createPracticeState(), results: [] }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_LESSON':
      return state.screen === 'intro' ? { screen: 'lesson', step: 0 } : state
    case 'LESSON_NEXT':
      if (state.screen !== 'lesson') return state
      return state.step < lessons.length - 1 ? { screen: 'lesson', step: state.step + 1 } : startPractice()
    case 'LESSON_BACK':
      return state.screen === 'lesson' && state.step > 0 ? { screen: 'lesson', step: state.step - 1 } : state
    case 'PRACTICE': {
      if (state.screen !== 'practice') return state
      const practice = practiceReducer(state.practice, action.action, problems[state.problem].coefficients)
      if (practice.stage !== 'solved' || !practice.coordinates) return { ...state, practice }
      return { screen: 'flight', problem: state.problem, results: [...state.results, { problem: state.problem, withSolution: practice.fullSolution, coordinates: practice.coordinates }] }
    }
    case 'FLIGHT_COMPLETE':
      if (state.screen !== 'flight' || state.problem !== action.problem) return state
      return state.problem < problems.length - 1
        ? { screen: 'practice', problem: state.problem + 1, practice: createPracticeState(), results: state.results }
        : { screen: 'finish', results: state.results }
    case 'REPLAY_PRACTICE':
      return state.screen === 'finish' ? startPractice() : state
    case 'REPEAT_THEORY':
      return state.screen === 'finish' ? { screen: 'lesson', step: 0 } : state
  }
}
