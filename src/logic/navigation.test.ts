import { describe, expect, it } from 'vitest'
import { appReducer, initialState } from './navigation'
import type { AppState } from './navigation'
import { lessons } from '../data/lessons'
import { createLessonState } from './lesson'

function reachPractice(): AppState {
  let state = initialState
  for (let index = 0; index < 3; index++) state = appReducer(state, { type: 'BRIEFING_NEXT' })
  state = appReducer(state, { type: 'START_LESSON' })
  for (let index = 0; index < lessons.length; index++) state = appReducer(state, { type: 'LESSON_NEXT' })
  return state
}
function edit(state: AppState, field: 'discriminant' | 'root1' | 'root2', value: string): AppState {
  return appReducer(state, { type: 'PRACTICE', action: { type: 'EDIT', field, value } })
}
function solve(state: AppState, problem: number): AppState {
  let next = edit(state, 'discriminant', problem === 0 ? '1' : '16')
  next = appReducer(next, { type: 'PRACTICE', action: { type: 'CHECK' } })
  next = edit(next, 'root1', problem === 0 ? '2' : '1')
  next = edit(next, 'root2', '3')
  return appReducer(next, { type: 'PRACTICE', action: { type: 'CHECK' } })
}
function finishRoute(): AppState {
  const first = appReducer(solve(reachPractice(), 0), { type: 'FLIGHT_COMPLETE', problem: 0 })
  return appReducer(solve(first, 1), { type: 'FLIGHT_COMPLETE', problem: 1 })
}

describe('навигация с математической проверкой', () => {
  it('проводит через три реплики знакомства и позволяет вернуться к предыдущей', () => {
    expect(initialState).toEqual({ screen: 'briefing', step: 0 })
    const second = appReducer(initialState, { type: 'BRIEFING_NEXT' })
    expect(second).toEqual({ screen: 'briefing', step: 1 })
    expect(appReducer(second, { type: 'BRIEFING_BACK' })).toEqual(initialState)
    const third = appReducer(appReducer(second, { type: 'BRIEFING_NEXT' }), { type: 'BRIEFING_NEXT' })
    expect(appReducer(third, { type: 'BRIEFING_NEXT' })).toEqual({ screen: 'intro' })
  })
  it('не принимает корни до D и не завершает несуществующий полёт', () => {
    const practice = reachPractice()
    expect(edit(practice, 'root1', '2')).toEqual(practice)
    expect(appReducer(practice, { type: 'FLIGHT_COMPLETE', problem: 0 })).toEqual(practice)
  })
  it('создаёт ровно один результат и блокирует повторную проверку во время полёта', () => {
    const flight = solve(reachPractice(), 0)
    expect(flight.screen).toBe('flight')
    expect(appReducer(flight, { type: 'PRACTICE', action: { type: 'CHECK' } })).toEqual(flight)
    expect(appReducer(flight, { type: 'FLIGHT_COMPLETE', problem: 1 })).toEqual(flight)
    const next = appReducer(flight, { type: 'FLIGHT_COMPLETE', problem: 0 })
    expect(next.screen === 'practice' && next.problem === 1 && next.practice.stage === 'discriminant').toBe(true)
    expect(appReducer(next, { type: 'FLIGHT_COMPLETE', problem: 0 })).toEqual(next)
  })
  it('сохраняет полный разбор в результатах, подсказки не меняют самостоятельность', () => {
    let state = appReducer(reachPractice(), { type: 'PRACTICE', action: { type: 'HINT' } })
    state = appReducer(solve(state, 0), { type: 'FLIGHT_COMPLETE', problem: 0 })
    state = appReducer(state, { type: 'PRACTICE', action: { type: 'SHOW_SOLUTION' } })
    state = appReducer(solve(state, 1), { type: 'FLIGHT_COMPLETE', problem: 1 })
    expect(state.screen).toBe('finish')
    if (state.screen === 'finish') expect(state.results.map(result => result.withSolution)).toEqual([false, true])
  })
  it('повтор практики и теории сбрасывает прошлые результаты', () => {
    const finish = finishRoute()
    expect(finish.screen).toBe('finish')
    expect(appReducer(finish, { type: 'REPLAY_PRACTICE' })).toEqual(reachPractice())
    expect(appReducer(finish, { type: 'REPEAT_THEORY' })).toEqual({ screen: 'lesson', step: 0, lesson: createLessonState() })
  })
  it('не позволяет уйти назад за первый шаг урока', () => {
    const first = appReducer(appReducer(appReducer(initialState, { type: 'BRIEFING_NEXT' }), { type: 'BRIEFING_NEXT' }), { type: 'BRIEFING_NEXT' })
    const lesson = appReducer(first, { type: 'START_LESSON' })
    expect(appReducer(lesson, { type: 'LESSON_BACK' })).toEqual(lesson)
    expect(appReducer(appReducer(lesson, { type: 'LESSON_NEXT' }), { type: 'LESSON_BACK' })).toEqual(lesson)
  })

  it('сохраняет ответы и раскрытые шаги урока в общем состоянии приложения', () => {
    let state = appReducer({ screen: 'intro' }, { type: 'START_LESSON' })
    state = appReducer(state, { type: 'LESSON_ACTION', action: { type: 'DISCRIMINANT', value: '4' } })
    state = appReducer(state, { type: 'LESSON_ACTION', action: { type: 'REVEAL' } })
    expect(state.screen === 'lesson' && state.lesson.discriminant).toBe('4')
    const roots = appReducer({ ...state, screen: 'lesson', step: 3 } as AppState, { type: 'LESSON_ACTION', action: { type: 'REVEAL' } })
    expect(roots.screen === 'lesson' && roots.lesson.revealed).toBe(2)
  })
})
