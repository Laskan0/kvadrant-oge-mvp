import { describe, expect, it } from 'vitest'
import { problems } from '../data/problems'
import { checkDiscriminant, checkRoots, getDiscriminant, parseNumber, solveQuadratic } from './math'

const lesson = { a: 1, b: -4, c: 3 }
const first = problems[0].coefficients
const second = problems[1].coefficients

describe('решение квадратных уравнений', () => {
  it.each([
    { coefficients: lesson, discriminant: 4, roots: [1, 3] },
    { coefficients: first, discriminant: 1, roots: [2, 3] },
    { coefficients: second, discriminant: 16, roots: [1, 3] },
    { coefficients: { a: 1, b: -4, c: 4 }, discriminant: 0, roots: [2] },
    { coefficients: { a: 1, b: -4, c: 5 }, discriminant: -4, roots: [] },
    { coefficients: { a: 1, b: 5, c: 6 }, discriminant: 1, roots: [-3, -2] },
    { coefficients: { a: -1, b: 4, c: -3 }, discriminant: 4, roots: [1, 3] },
    { coefficients: { a: 1, b: 0, c: 0 }, discriminant: 0, roots: [0] },
    { coefficients: { a: 1, b: -2, c: 0 }, discriminant: 4, roots: [0, 2] },
  ])('корректно решает $coefficients', ({ coefficients, discriminant, roots }) => {
    expect(solveQuadratic(coefficients)).toEqual({ discriminant, roots })
  })

  it('не округляет отрицательный дискриминант до нуля', () => {
    expect(solveQuadratic({ a: 1, b: 0, c: 1e-12 }).roots).toEqual([])
  })

  it('находит нецелые корни', () => {
    const { roots } = solveQuadratic({ a: 1, b: 0, c: -2 })
    expect(roots[0]).toBeCloseTo(-Math.sqrt(2), 12)
    expect(roots[1]).toBeCloseTo(Math.sqrt(2), 12)
  })

  it.each([
    { a: 0, b: 2, c: 3 },
    { a: NaN, b: 2, c: 3 },
    { a: 1, b: Infinity, c: 3 },
    { a: 1, b: 2, c: -Infinity },
    { a: 1, b: 1e200, c: 3 },
  ])('отклоняет некорректные или слишком большие коэффициенты: %j', coefficients => {
    expect(() => getDiscriminant(coefficients)).toThrow(RangeError)
  })
})

describe('числовой ввод', () => {
  it.each([
    ['  −2,5  ', -2.5], ['-2.5', -2.5], ['+3', 3], ['03', 3],
    ['.5', 0.5], [',5', 0.5], ['2.', 2], ['0', 0], ['-0', 0],
  ])('принимает %j как %s', (input, value) => {
    expect(parseNumber(input)).toEqual({ status: 'valid', value })
  })

  it.each(['', '   ', '\n\t'])('отличает пустое поле %j от нуля', input => {
    expect(parseNumber(input)).toEqual({ status: 'empty' })
  })

  it.each(['2abc', '2 3', '1,2.3', '1/2', '√4', '2+1', '0x10', '1e3', 'NaN', 'Infinity', '-', '.', '9'.repeat(400)])(
    'отклоняет некорректную строку %j', input => {
      expect(parseNumber(input)).toEqual({ status: 'invalid' })
    },
  )
})

describe('проверка ответов', () => {
  it('различает пустой, некорректный, неверный и верный D', () => {
    expect(checkDiscriminant('', first)).toEqual({ status: 'empty' })
    expect(checkDiscriminant('1abc', first)).toEqual({ status: 'invalid' })
    expect(checkDiscriminant('-1', first)).toEqual({ status: 'incorrect' })
    expect(checkDiscriminant(' 1,0 ', first)).toEqual({ status: 'correct', value: 1 })
    expect(checkDiscriminant('16', second)).toEqual({ status: 'correct', value: 16 })
  })

  it('принимает переставленные корни и выдаёт отсортированные координаты только после успеха', () => {
    expect(checkRoots(['3', '2'], first)).toEqual({ status: 'correct', coordinates: { x: 2, y: 3 } })
    expect(checkRoots(['1,0', '3.0'], second)).toEqual({ status: 'correct', coordinates: { x: 1, y: 3 } })
    expect(checkRoots(['2', '4'], first)).toEqual({ status: 'incorrect' })
  })

  it('не принимает дублирование одного корня за правильную пару', () => {
    expect(checkRoots(['2', '2'], first)).toEqual({ status: 'incorrect' })
    expect(checkRoots(['3', '3'], first)).toEqual({ status: 'incorrect' })
  })

  it('не принимает пустое поле за нулевой корень', () => {
    const zeroRoot = { a: 1, b: -2, c: 0 }
    expect(checkRoots(['', '2'], zeroRoot)).toEqual({ status: 'empty' })
    expect(checkRoots(['0', '2'], zeroRoot)).toEqual({ status: 'correct', coordinates: { x: 0, y: 2 } })
    expect(checkRoots(['3', 'oops'], first)).toEqual({ status: 'invalid' })
  })

  it('корректно принимает отрицательные корни', () => {
    expect(checkRoots(['−2', '-3'], { a: 1, b: 5, c: 6 })).toEqual({ status: 'correct', coordinates: { x: -3, y: -2 } })
  })

  it('принимает погрешность вычислений, но отклоняет заметно неверные ответы', () => {
    expect(checkDiscriminant('1.0000000001', first).status).toBe('correct')
    expect(checkDiscriminant('1.00001', first).status).toBe('incorrect')
    expect(checkRoots(['2.0000000001', '3'], first).status).toBe('correct')
    expect(checkRoots(['2.00001', '3'], first).status).toBe('incorrect')
  })

  it('не применяет форму двух разных корней к одному корню или отсутствию корней', () => {
    expect(checkRoots(['2', '2'], { a: 1, b: -4, c: 4 }).status).toBe('not-two-roots')
    expect(checkRoots(['1', '3'], { a: 1, b: -4, c: 5 }).status).toBe('not-two-roots')
  })
})
