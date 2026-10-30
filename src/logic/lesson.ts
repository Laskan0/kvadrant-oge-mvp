import { checkDiscriminant } from './math'

export type Coefficient = 'a' | 'b' | 'c'
export type GraphC = 3 | 4 | 5
export type Feedback = 'idle' | 'empty' | 'incorrect' | 'correct'
export interface LessonState {
  coefficients: Record<Coefficient, string>
  discriminant: string
  graphC: GraphC
  visited: GraphC[]
  revealed: number
  calibration: number | null
  feedback: [Feedback, Feedback, Feedback, Feedback, Feedback]
}
export type LessonAction =
  | { type: 'COEFFICIENT'; key: Coefficient; value: string }
  | { type: 'DISCRIMINANT'; value: string }
  | { type: 'GRAPH'; value: GraphC }
  | { type: 'REVEAL' }
  | { type: 'CALIBRATION'; value: number }
  | { type: 'CHECK'; step: 0 | 1 | 4 }

export function createLessonState(): LessonState {
  return { coefficients: { a: '', b: '', c: '' }, discriminant: '', graphC: 3, visited: [3], revealed: 0, calibration: null, feedback: ['idle', 'idle', 'idle', 'idle', 'idle'] }
}

function setFeedback(state: LessonState, step: number, value: Feedback): LessonState {
  const feedback: LessonState['feedback'] = [...state.feedback]
  feedback[step] = value
  return { ...state, feedback }
}

export function lessonReady(state: LessonState, step: number): boolean {
  if (step === 2) return state.visited.length === 3
  if (step === 3) return state.revealed === 3
  return state.feedback[step] === 'correct'
}

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'COEFFICIENT':
      return setFeedback({ ...state, coefficients: { ...state.coefficients, [action.key]: action.value } }, 0, 'idle')
    case 'DISCRIMINANT':
      return setFeedback({ ...state, discriminant: action.value }, 1, 'idle')
    case 'GRAPH':
      return { ...state, graphC: action.value, visited: state.visited.includes(action.value) ? state.visited : [...state.visited, action.value] }
    case 'REVEAL':
      return { ...state, revealed: Math.min(state.revealed + 1, 3) }
    case 'CALIBRATION':
      return setFeedback({ ...state, calibration: action.value }, 4, 'idle')
    case 'CHECK': {
      let feedback: Feedback
      if (action.step === 0) {
        const { a, b, c } = state.coefficients
        feedback = !a || !b || !c ? 'empty' : a === '1' && b === '-4' && c === '3' ? 'correct' : 'incorrect'
      } else if (action.step === 1) {
        const result = checkDiscriminant(state.discriminant, { a: 1, b: -4, c: 3 })
        feedback = result.status === 'correct' ? 'correct' : result.status === 'empty' ? 'empty' : 'incorrect'
      } else {
        feedback = state.calibration === null ? 'empty' : state.calibration === 0 ? 'correct' : 'incorrect'
      }
      return setFeedback(state, action.step, feedback)
    }
  }
}
