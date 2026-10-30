import { useEffect } from 'react'
import { ComputerMascot } from '../components/ComputerMascot'
import type { ProblemResult } from '../logic/navigation'

export function Flight({ result, onComplete }: { result: ProblemResult; onComplete: () => void }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelector('.space-scene')?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
    const timer = window.setTimeout(onComplete, reduced ? 700 : 2500)
    return () => window.clearTimeout(timer)
  }, [onComplete])
  return <div className="flight-content" role="status">
    <p className="eyebrow">Участок {result.problem + 1} из 2 · Расчёт принят</p>
    <h1>Прокладываю маршрут…</h1>
    <ComputerMascot state="success" message={`Корни — ${result.coordinates.x} и ${result.coordinates.y}. Меньший задаёт X, больший — Y. ${result.problem === 0 ? 'Первая точка' : 'Точка назначения'}: (${result.coordinates.x}; ${result.coordinates.y}). ${result.problem === 0 ? 'Продолжаем полёт!' : 'Курс на планету!'}`} />
    <p className="task-guide">{result.withSolution ? 'Задача выполнена с полным разбором.' : 'Задача решена без полного разбора.'}</p>
  </div>
}
