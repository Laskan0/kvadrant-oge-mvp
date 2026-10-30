export interface QuadraticCoefficients {
  a: number
  b: number
  c: number
}

export type ParsedNumber =
  | { status: 'valid'; value: number }
  | { status: 'empty' | 'invalid' }

export type QuadraticSolution =
  | { discriminant: number; roots: [] }
  | { discriminant: number; roots: [number] }
  | { discriminant: number; roots: [number, number] }

export type DiscriminantCheck =
  | { status: 'correct'; value: number }
  | { status: 'empty' | 'invalid' | 'incorrect' }

export type RootsCheck =
  | { status: 'correct'; coordinates: { x: number; y: number } }
  | { status: 'empty' | 'invalid' | 'incorrect' | 'not-two-roots' }

// Абсолютная погрешность подходит для небольших чисел в заданиях MVP.
// Она не увеличивается вместе с введённым учеником значением.
const ANSWER_TOLERANCE = 1e-9
const DECIMAL_NUMBER = /^[+\-−]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/u

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value
}

/** Десятичное число, без формул, дробей, экспонент и разделителей тысяч. */
export function parseNumber(input: string): ParsedNumber {
  const trimmed = input.trim()
  if (trimmed === '') return { status: 'empty' }
  if (!DECIMAL_NUMBER.test(trimmed)) return { status: 'invalid' }

  const value = Number(trimmed.replace('−', '-').replace(',', '.'))
  return Number.isFinite(value)
    ? { status: 'valid', value: normalizeZero(value) }
    : { status: 'invalid' }
}

export function getDiscriminant({ a, b, c }: QuadraticCoefficients): number {
  if (![a, b, c].every(Number.isFinite) || a === 0) {
    throw new RangeError('Ожидаются конечные коэффициенты квадратного уравнения, a ≠ 0.')
  }
  const discriminant = b * b - 4 * a * c
  if (!Number.isFinite(discriminant)) {
    throw new RangeError('Коэффициенты слишком велики для вычисления дискриминанта.')
  }
  return normalizeZero(discriminant)
}

export function solveQuadratic(coefficients: QuadraticCoefficients): QuadraticSolution {
  const discriminant = getDiscriminant(coefficients)
  const { a, b, c } = coefficients
  if (discriminant < 0) return { discriminant, roots: [] }
  if (discriminant === 0) {
    const root = normalizeZero((-b / a) / 2)
    if (!Number.isFinite(root)) throw new RangeError('Корень выходит за допустимый диапазон чисел.')
    return { discriminant, roots: [root] }
  }

  // Эквивалент формулы корней, уменьшающий потерю точности при вычитании
  // близких чисел. В уроке показывается привычная формула с ±.
  const squareRoot = Math.sqrt(discriminant)
  const q = -0.5 * b - 0.5 * (b >= 0 ? squareRoot : -squareRoot)
  const roots: [number, number] = [normalizeZero(q / a), normalizeZero(c / q)]
  if (!roots.every(Number.isFinite)) throw new RangeError('Корни выходят за допустимый диапазон чисел.')
  roots.sort((left, right) => left - right)
  return { discriminant, roots }
}

function answersEqual(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) <= ANSWER_TOLERANCE
}

export function checkDiscriminant(input: string, coefficients: QuadraticCoefficients): DiscriminantCheck {
  const expected = getDiscriminant(coefficients)
  const parsed = parseNumber(input)
  if (parsed.status !== 'valid') return parsed
  return answersEqual(parsed.value, expected)
    ? { status: 'correct', value: expected }
    : { status: 'incorrect' }
}

/** Проверка пары применяется только к заданиям с двумя различными корнями. */
export function checkRoots(
  inputs: readonly [string, string],
  coefficients: QuadraticCoefficients,
): RootsCheck {
  const { roots } = solveQuadratic(coefficients)
  if (roots.length !== 2) return { status: 'not-two-roots' }

  const first = parseNumber(inputs[0])
  const second = parseNumber(inputs[1])
  if (first.status === 'empty' || second.status === 'empty') return { status: 'empty' }
  if (first.status !== 'valid' || second.status !== 'valid') return { status: 'invalid' }

  const supplied = [first.value, second.value].sort((left, right) => left - right)
  if (!answersEqual(supplied[0], roots[0]) || !answersEqual(supplied[1], roots[1])) {
    return { status: 'incorrect' }
  }
  // Эталонные значения используются для условных координат только после успеха.
  return { status: 'correct', coordinates: { x: roots[0], y: roots[1] } }
}
