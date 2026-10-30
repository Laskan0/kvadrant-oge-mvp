import { useEffect, useRef } from 'react'
import { problems } from '../data/problems'
import { ComputerMascot } from '../components/ComputerMascot'
import { MathFormula } from '../components/MathFormula'
import type { PracticeAction, PracticeState } from '../logic/practice'

interface Props { problemIndex: number; state: PracticeState; onAction: (action: PracticeAction) => void }

export function Practice({ problemIndex, state, onAction }: Props) {
  const problem = problems[problemIndex]
  const discriminantStage = state.stage === 'discriminant'
  const stage = discriminantStage ? 'discriminant' : 'roots'
  const hintCount = state.hints[stage]
  const invalid = ['empty', 'invalid', 'incorrect'].includes(state.feedback)
  const firstInput = useRef<HTMLInputElement>(null)
  useEffect(() => { firstInput.current?.focus({ preventScroll: true }) }, [state.stage, problemIndex])

  const message = state.feedback === 'empty' ? discriminantStage ? 'Введи значение D.' : 'Введи оба корня.'
    : state.feedback === 'invalid' ? 'Введи число. Например: −2 или 1,5.'
    : state.feedback === 'incorrect' ? discriminantStage ? 'Пока неверно. Проверь коэффициенты и вычисление b² − 4ac.' : `Эта пара корней пока не подходит. Используй D = ${state.discriminant} и формулу корней. Попробуй ещё раз.`
    : state.feedback === 'accepted' ? `Верно, D = ${state.discriminant}. Он положительный — найди два действительных корня.`
    : discriminantStage ? problem.greeting : `Дискриминант D = ${state.discriminant} уже найден. Теперь вычисли два корня по формуле.`

  return <div className="practice-content">
    <p className="eyebrow">Маршрут к планете · Участок {problemIndex + 1} из {problems.length}</p>
    <div className="cockpit-dashboard">
      <aside className="bip-comms" aria-label="Видеосвязь с БИПом">
        <div className="comms-heading"><span>ВИДЕОСВЯЗЬ · БИП</span><span className="comms-live"><i /> НА СВЯЗИ</span></div>
        <div className="comms-screen" role="status" aria-live="polite" aria-atomic="true" id="practice-feedback">
          <ComputerMascot message={message} state={invalid ? 'warning' : state.feedback === 'accepted' ? 'success' : 'neutral'} />
        </div>
        <p className="comms-caption">Бортовой компьютер · канал 01</p>
      </aside>
      <section className="cockpit-controls" aria-label="Приборная панель расчёта">
        <div className="practice-heading"><div><p className="cockpit-kicker">НАВИГАЦИОННЫЙ РАСЧЁТ</p><h1>{problem.title}</h1></div><span>Участок {problemIndex + 1}/{problems.length}</span></div>
        <p className="formula practice-equation">{problem.equation}</p>
        <div className="practice-workspace">
      <div>
        <p className="task-label">{discriminantStage ? 'Шаг 1 · Вычисли дискриминант' : 'Шаг 2 · Найди корни'}</p>
        {!discriminantStage ? <p className="accepted-discriminant">✓ D = {state.discriminant}</p> : null}
        <form onSubmit={event => { event.preventDefault(); onAction({ type: 'CHECK' }) }}>
          <div className="practice-fields">
            {discriminantStage ? <label htmlFor="practice-d">Дискриминант D<input ref={firstInput} id="practice-d" type="text" inputMode="decimal" autoComplete="off" value={state.discriminant} onChange={event => onAction({ type: 'EDIT', field: 'discriminant', value: event.target.value })} aria-invalid={invalid || undefined} aria-describedby="practice-feedback" /></label>
            : <>
              <label htmlFor="practice-root1">Первый корень x₁<input ref={firstInput} id="practice-root1" type="text" inputMode="text" autoComplete="off" value={state.root1} onChange={event => onAction({ type: 'EDIT', field: 'root1', value: event.target.value })} aria-invalid={invalid || undefined} aria-describedby="practice-feedback root-order" /></label>
              <label htmlFor="practice-root2">Второй корень x₂<input id="practice-root2" type="text" inputMode="text" autoComplete="off" value={state.root2} onChange={event => onAction({ type: 'EDIT', field: 'root2', value: event.target.value })} aria-invalid={invalid || undefined} aria-describedby="practice-feedback root-order" /></label>
            </>}
          </div>
          {!discriminantStage ? <p id="root-order" className="task-guide">Порядок корней не важен.</p> : null}
          <div className="actions practice-actions">
            <button type="submit">{discriminantStage ? 'Проверить D' : 'Проверить корни'}</button>
            {hintCount < 2 ? <button type="button" className="secondary" onClick={() => onAction({ type: 'HINT' })}>{hintCount === 0 ? 'Подсказка' : 'Ещё подсказка'}</button> : null}
          </div>
        </form>
      </div>
      <aside className="practice-reference"><p className="task-label">Памятка</p><MathFormula tex={discriminantStage ? 'D=b^2-4ac' : 'x_{1,2}=\\frac{-b\\pm\\sqrt D}{2a}'} label={discriminantStage ? 'D = b² − 4ac' : 'x₁,₂ = (−b ± √D)/(2a)'} /><p>{discriminantStage ? 'Коэффициенты бери вместе со знаками.' : 'На 2a делится весь числитель.'}</p></aside>
        </div>
      </section>
    </div>
    {hintCount > 0 ? <aside className="practice-hints" aria-label="Подсказки"><h2>БИП подсказывает</h2><ol>{problem.hints[stage].slice(0, hintCount).map(hint => <li key={hint}>{hint}</li>)}</ol></aside> : null}
    <div className="solution-control">
      {!state.fullSolution ? <><button type="button" className="text-button" onClick={() => onAction({ type: 'SHOW_SOLUTION' })}>Показать полный разбор</button><p>Участок можно завершить, но задача будет отмечена как выполненная с разбором.</p></>
      : <section className="full-solution" aria-label="Полный разбор"><h2>Полный разбор</h2><p>Теперь введи ответы и проверь их. Эта задача отмечена как выполненная с разбором.</p><div className="formula-stack">{problem.solution.map(line => <MathFormula key={line.tex} tex={line.tex} label={line.label} />)}</div></section>}
    </div>
  </div>
}
