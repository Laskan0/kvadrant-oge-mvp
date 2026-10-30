import { describe, expect, it } from 'vitest'
import { createLessonState, lessonReady, lessonReducer } from './lesson'
import type { LessonState } from './lesson'

function coefficientsCorrect(): LessonState {
  let state = createLessonState()
  for (const [key, value] of [['a', '1'], ['b', '-4'], ['c', '3']] as const) {
    state = lessonReducer(state, { type: 'COEFFICIENT', key, value })
  }
  return lessonReducer(state, { type: 'CHECK', step: 0 })
}

describe('условия прохождения урока', () => {
  it('не открывает следующий шаг без выполненного действия', () => {
    const state = createLessonState()
    for (let step = 0; step < 5; step++) expect(lessonReady(state, step)).toBe(false)
    expect(lessonReducer(state, { type: 'CHECK', step: 0 }).feedback[0]).toBe('empty')
  })

  it('проверяет знаки коэффициентов и снимает успех при редактировании', () => {
    const correct = coefficientsCorrect()
    expect(lessonReady(correct, 0)).toBe(true)
    const edited = lessonReducer(correct, { type: 'COEFFICIENT', key: 'b', value: '4' })
    expect(lessonReady(edited, 0)).toBe(false)
    expect(lessonReducer(edited, { type: 'CHECK', step: 0 }).feedback[0]).toBe('incorrect')
  })

  it('проверяет D численно и сохраняет уже выполненные задания', () => {
    let state = coefficientsCorrect()
    state = lessonReducer(state, { type: 'DISCRIMINANT', value: '4,0' })
    state = lessonReducer(state, { type: 'CHECK', step: 1 })
    expect(lessonReady(state, 1)).toBe(true)
    expect(lessonReady(state, 0)).toBe(true)
    state = lessonReducer(state, { type: 'DISCRIMINANT', value: '-4' })
    expect(lessonReady(state, 1)).toBe(false)
    expect(lessonReducer(state, { type: 'CHECK', step: 1 }).feedback[1]).toBe('incorrect')
  })

  it('требует просмотреть три разных состояния графика', () => {
    let state = createLessonState()
    state = lessonReducer(state, { type: 'GRAPH', value: 3 })
    expect(state.visited).toEqual([3])
    state = lessonReducer(state, { type: 'GRAPH', value: 5 })
    expect(lessonReady(state, 2)).toBe(false)
    state = lessonReducer(state, { type: 'GRAPH', value: 4 })
    expect(lessonReady(state, 2)).toBe(true)
    expect(state.graphC).toBe(4)
  })

  it('раскрывает ровно три шага формулы', () => {
    let state = createLessonState()
    for (let index = 0; index < 2; index++) state = lessonReducer(state, { type: 'REVEAL' })
    expect(lessonReady(state, 3)).toBe(false)
    state = lessonReducer(state, { type: 'REVEAL' })
    expect(lessonReady(state, 3)).toBe(true)
    expect(lessonReducer(state, { type: 'REVEAL' }).revealed).toBe(3)
  })

  it('проверяет мини-калибровку, новый урок не наследует ответы', () => {
    let state = createLessonState()
    expect(lessonReducer(state, { type: 'CHECK', step: 4 }).feedback[4]).toBe('empty')
    state = lessonReducer(state, { type: 'CALIBRATION', value: 2 })
    expect(lessonReducer(state, { type: 'CHECK', step: 4 }).feedback[4]).toBe('incorrect')
    state = lessonReducer(state, { type: 'CALIBRATION', value: 0 })
    state = lessonReducer(state, { type: 'CHECK', step: 4 })
    expect(lessonReady(state, 4)).toBe(true)
    expect(createLessonState().calibration).toBe(null)
  })
})
