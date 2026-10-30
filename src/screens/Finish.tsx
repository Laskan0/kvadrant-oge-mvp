import { ComputerMascot } from '../components/ComputerMascot'
import type { ProblemResult } from '../logic/navigation'

export function Finish({ results, onReplay, onTheory }: { results: ProblemResult[]; onReplay: () => void; onTheory: () => void }) {
  const withSolution = results.filter(result => result.withSolution).length
  return <>
    <p className="eyebrow">Экспедиция завершена · 2/2</p>
    <h1>Маршрут восстановлен!</h1>
    <ComputerMascot state="success" message="Мы у цели! Ты прошёл путь от коэффициентов до корней квадратного уравнения." />
    <div className="finish-results"><p>Участков пройдено: <strong>2/2</strong></p><p>Самостоятельно, без полного разбора: <strong>{results.length - withSolution} из 2</strong></p>
      {withSolution > 0 ? <><p>С полным разбором: <strong>{withSolution} из 2</strong></p><p className="task-guide">Можно пройти ещё раз и попробовать без разбора.</p></> : <p className="task-guide">Обе задачи решены без полного разбора.</p>}
    </div>
    <p className="finish-reminder">Коэффициенты → дискриминант → число действительных корней → формула корней</p>
    <div className="actions">
      <button onClick={onReplay}>Пройти снова</button>
      <button className="secondary" onClick={onTheory}>Повторить теорию</button>
    </div>
  </>
}
