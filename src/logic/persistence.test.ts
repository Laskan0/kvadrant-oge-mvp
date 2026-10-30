import { describe, expect, it } from 'vitest'
import { appReducer, initialState } from './navigation'
import { APP_STATE_STORAGE_KEY, loadAppState, saveAppState } from './persistence'
import type { ProgressStorage } from './persistence'

class MemoryStorage implements ProgressStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

describe('сохранение прогресса в браузере', () => {
  it('восстанавливает тот же экран и состояние ответов после перезапуска', () => {
    const storage = new MemoryStorage()
    let state = appReducer(initialState, { type: 'BRIEFING_NEXT' })
    state = appReducer(state, { type: 'BRIEFING_NEXT' })
    state = appReducer(state, { type: 'BRIEFING_NEXT' })
    state = appReducer(state, { type: 'START_LESSON' })
    state = appReducer(state, { type: 'LESSON_ACTION', action: { type: 'COEFFICIENT', key: 'b', value: '-4' } })
    state = appReducer(state, { type: 'LESSON_ACTION', action: { type: 'CHECK', step: 0 } })
    state = appReducer(state, { type: 'LESSON_NEXT' })
    state = appReducer(state, { type: 'LESSON_ACTION', action: { type: 'DISCRIMINANT', value: '4' } })

    saveAppState(state, storage)

    expect(storage.getItem(APP_STATE_STORAGE_KEY)).toContain('"screen":"lesson"')
    expect(loadAppState(storage)).toEqual(state)
  })

  it('отбрасывает испорченное или неизвестное состояние и открывает знакомство', () => {
    const storage = new MemoryStorage()
    storage.setItem(APP_STATE_STORAGE_KEY, '{not valid json')
    expect(loadAppState(storage)).toEqual(initialState)
    expect(storage.getItem(APP_STATE_STORAGE_KEY)).toBeNull()
    storage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({ screen: 'lesson', step: 99 }))
    expect(loadAppState(storage)).toEqual(initialState)
  })
})
