import { describe, expect, it } from 'vitest'
import { createPracticeState, practiceReducer } from './practice'
import { problems } from '../data/problems'
import type { PracticeAction, PracticeState } from './practice'
const coefficients = problems[0].coefficients
const reduce = (state: PracticeState, action: PracticeAction) => practiceReducer(state, action, coefficients)
function reachRoots() {
  return reduce(reduce(createPracticeState(), { type: 'EDIT', field: 'discriminant', value: '1' }), { type: 'CHECK' })
}
function solve() {
  let state = reachRoots()
  state = reduce(state, { type: 'EDIT', field: 'root1', value: '3' })
  state = reduce(state, { type: 'EDIT', field: 'root2', value: '2' })
  return reduce(state, { type: 'CHECK' })
}

describe('практика', () => {
  it('различает пустой, некорректный и неверный D, не открывая корни', () => {
    for (const [value, feedback] of [['', 'empty'], ['1abc', 'invalid'], ['-1', 'incorrect']] as const) {
      const state = reduce(reduce(createPracticeState(), { type: 'EDIT', field: 'discriminant', value }), { type: 'CHECK' })
      expect(state.stage).toBe('discriminant')
      expect(state.feedback).toBe(feedback)
      expect(state.coordinates).toBe(null)
    }
  })
  it('открывает корни только после D и блокирует редактирование принятого D', () => {
    const state = reachRoots()
    expect(state.stage).toBe('roots')
    expect(reduce(state, { type: 'EDIT', field: 'discriminant', value: '5' })).toEqual(state)
  })
  it('не принимает неверные, пустые или одинаковые корни; исправление сохраняет D', () => {
    let state = reachRoots()
    state = reduce(state, { type: 'EDIT', field: 'root1', value: '2' })
    expect(reduce(state, { type: 'CHECK' }).feedback).toBe('empty')
    state = reduce(state, { type: 'EDIT', field: 'root2', value: '2' })
    state = reduce(state, { type: 'CHECK' })
    expect(state.feedback).toBe('incorrect')
    expect(state.stage).toBe('roots')
    expect(state.coordinates).toBe(null)
    state = reduce(state, { type: 'EDIT', field: 'root2', value: '3' })
    expect(state.feedback).toBe('idle')
    expect(state.discriminant).toBe('1')
    expect(reduce(state, { type: 'CHECK' }).stage).toBe('solved')
  })
  it('принимает переставленные корни и возвращает координаты только после успеха', () => {
    expect(solve().coordinates).toEqual({ x: 2, y: 3 })
  })
  it('ограничивает подсказки двумя на стадию, не открывая полный разбор', () => {
    let state = createPracticeState()
    for (let i = 0; i < 4; i++) state = reduce(state, { type: 'HINT' })
    expect(state.hints).toEqual({ discriminant: 2, roots: 0 })
    expect(state.fullSolution).toBe(false)
    state = reduce(state, { type: 'EDIT', field: 'discriminant', value: '1' })
    state = reduce(state, { type: 'CHECK' })
    state = reduce(state, { type: 'HINT' })
    expect(state.hints).toEqual({ discriminant: 2, roots: 1 })
  })
  it('полный разбор не заполняет ответы, не пропускает стадии и сохраняется после ошибки', () => {
    let state = reduce(createPracticeState(), { type: 'SHOW_SOLUTION' })
    expect(state.stage).toBe('discriminant')
    expect([state.discriminant, state.root1, state.root2]).toEqual(['', '', ''])
    expect(state.coordinates).toBe(null)
    state = reduce(state, { type: 'CHECK' })
    expect(state.fullSolution).toBe(true)
  })
  it('после успеха повторные отправки, ввод и подсказки ничего не меняют', () => {
    const state = solve()
    expect(reduce(state, { type: 'CHECK' })).toBe(state)
    expect(reduce(state, { type: 'HINT' })).toBe(state)
    expect(reduce(state, { type: 'EDIT', field: 'root1', value: '0' })).toBe(state)
  })
  it('новая задача не наследует ответы, разбор или подсказки', () => {
    expect(createPracticeState()).toMatchObject({ discriminant: '', root1: '', root2: '', fullSolution: false, hints: { discriminant: 0, roots: 0 } })
  })
})
