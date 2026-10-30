import { initialState } from './navigation'
import type { AppState, ProblemResult } from './navigation'
import type { LessonState } from './lesson'
import type { PracticeState } from './practice'

export const APP_STATE_STORAGE_KEY = 'kvadrant-progress-v3'

export interface ProgressStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function browserStorage(): ProgressStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLessonState(value: unknown): value is LessonState {
  if (!isRecord(value) || !isRecord(value.coefficients) || !Array.isArray(value.visited) || !Array.isArray(value.feedback)) return false
  const feedback = ['idle', 'empty', 'incorrect', 'correct']
  return typeof value.coefficients.a === 'string'
    && typeof value.coefficients.b === 'string'
    && typeof value.coefficients.c === 'string'
    && typeof value.discriminant === 'string'
    && [3, 4, 5].includes(value.graphC as number)
    && value.visited.every(item => [3, 4, 5].includes(item as number))
    && Number.isInteger(value.revealed) && (value.revealed as number) >= 0 && (value.revealed as number) <= 3
    && (value.calibration === null || (Number.isInteger(value.calibration) && (value.calibration as number) >= 0 && (value.calibration as number) <= 2))
    && value.feedback.length === 5 && value.feedback.every(item => feedback.includes(item as string))
}

function isPracticeState(value: unknown): value is PracticeState {
  if (!isRecord(value) || !isRecord(value.hints)) return false
  const feedback = ['idle', 'empty', 'invalid', 'incorrect', 'accepted']
  const coordinates = value.coordinates
  return ['discriminant', 'roots', 'solved'].includes(value.stage as string)
    && typeof value.discriminant === 'string' && typeof value.root1 === 'string' && typeof value.root2 === 'string'
    && feedback.includes(value.feedback as string)
    && Number.isInteger(value.attempts) && (value.attempts as number) >= 0
    && Number.isInteger(value.hints.discriminant) && (value.hints.discriminant as number) >= 0 && (value.hints.discriminant as number) <= 2
    && Number.isInteger(value.hints.roots) && (value.hints.roots as number) >= 0 && (value.hints.roots as number) <= 2
    && typeof value.fullSolution === 'boolean'
    && (coordinates === null || (isRecord(coordinates) && Number.isFinite(coordinates.x) && Number.isFinite(coordinates.y)))
}

function isResult(value: unknown): value is ProblemResult {
  if (!isRecord(value) || !isRecord(value.coordinates)) return false
  return Number.isInteger(value.problem) && (value.problem as number) >= 0 && (value.problem as number) < 2
    && typeof value.withSolution === 'boolean'
    && Number.isFinite(value.coordinates.x) && Number.isFinite(value.coordinates.y)
}

function isResults(value: unknown): value is ProblemResult[] {
  return Array.isArray(value) && value.length <= 2 && value.every(isResult)
}

export function isAppState(value: unknown): value is AppState {
  if (!isRecord(value) || typeof value.screen !== 'string') return false
  if (value.screen === 'briefing') return Number.isInteger(value.step) && (value.step as number) >= 0 && (value.step as number) <= 2
  if (value.screen === 'intro') return true
  if (value.screen === 'lesson') return Number.isInteger(value.step) && (value.step as number) >= 0 && (value.step as number) < 5 && isLessonState(value.lesson)
  if (value.screen === 'practice') return Number.isInteger(value.problem) && (value.problem as number) >= 0 && (value.problem as number) < 2 && isPracticeState(value.practice) && isResults(value.results)
  if (value.screen === 'flight') return Number.isInteger(value.problem) && (value.problem as number) >= 0 && (value.problem as number) < 2 && isResults(value.results)
  if (value.screen === 'finish') return isResults(value.results) && value.results.length === 2
  return false
}

export function loadAppState(storage: ProgressStorage | null = browserStorage()): AppState {
  if (!storage) return initialState
  try {
    const saved = storage.getItem(APP_STATE_STORAGE_KEY)
    if (!saved) return initialState
    const parsed: unknown = JSON.parse(saved)
    if (isAppState(parsed)) return parsed
    storage.removeItem(APP_STATE_STORAGE_KEY)
  } catch {
    try { storage.removeItem(APP_STATE_STORAGE_KEY) } catch { /* Storage can be unavailable in private contexts. */ }
  }
  return initialState
}

export function saveAppState(state: AppState, storage: ProgressStorage | null = browserStorage()): void {
  if (!storage) return
  try {
    storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Keep the app usable if browser storage is full or disabled.
  }
}
