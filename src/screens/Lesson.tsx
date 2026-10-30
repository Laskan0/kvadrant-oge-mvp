import { useReducer } from 'react'
import { calibrationChoices, coefficientChoices, lessonFeedback, lessons } from '../data/lessons'
import { ComputerMascot } from '../components/ComputerMascot'
import { EquationGraph } from '../components/EquationGraph'
import { MathFormula } from '../components/MathFormula'
import { createLessonState, lessonReady, lessonReducer } from '../logic/lesson'
import type { GraphC } from '../logic/lesson'

interface Props { step: number; onNext: () => void; onBack: () => void }

export function Lesson({ step, onNext, onBack }: Props) {
  const [state, dispatch] = useReducer(lessonReducer, undefined, createLessonState)
  const lesson = lessons[step]
  const ready = lessonReady(state, step)
  const feedback = state.feedback[step]
  const feedbackCopy = step === 0 || step === 1 || step === 4
    ? feedback === 'idle' ? '' : lessonFeedback[step][feedback]
    : ready ? step === 2 ? 'Знак D подсказывает число действительных корней: положительный — два, нулевой — один, отрицательный — ни одного.' : 'Корни — 1 и 3. Порядок записи не важен.' : ''

  return <div className="lesson-content">
    <div className="lesson-heading">
      <p className="eyebrow">Калибровка навигации · Шаг {step + 1} из {lessons.length}</p>
      <progress aria-label="Прогресс урока" value={step + 1} max={lessons.length} />
    </div>
    <h1>{lesson.title}</h1>
    <ComputerMascot message={feedbackCopy || lesson.description} state={ready ? 'success' : feedback === 'incorrect' || feedback === 'empty' ? 'warning' : 'neutral'} />

    {step === 0 ? <div className="lesson-task">
      <div className="coefficient-example">
        <p><span className="coefficient-a">ax²</span> + <span className="coefficient-b">bx</span> + <span className="coefficient-c">c</span> = 0 <small> a ≠ 0</small></p>
        <p aria-label="x² − 4x + 3 = 0"><span className="coefficient-a">x²</span> <span className="coefficient-b">− 4x</span> <span className="coefficient-c">+ 3</span> = 0</p>
      </div>
      <form onSubmit={event => { event.preventDefault(); dispatch({ type: 'CHECK', step: 0 }) }}>
        <div className="coefficient-options">
          {coefficientChoices.map(group => <fieldset key={group.key} className={`coefficient-${group.key}`}>
            <legend>{group.label}</legend>
            <div className="choice-row">{group.values.map(value => <label className="radio-option" key={value}>
              <input type="radio" name={group.key} value={value} checked={state.coefficients[group.key] === value} onChange={() => dispatch({ type: 'COEFFICIENT', key: group.key, value })} />
              <span>{value.replace('-', '−')}</span>
            </label>)}</div>
          </fieldset>)}
        </div>
        <button type="submit">Проверить коэффициенты</button>
      </form>
    </div> : null}

    {step === 1 ? <div className="lesson-task">
      <div className="formula-stack">
        <MathFormula tex={'D=b^2-4ac'} label="D = b² − 4ac" />
        <MathFormula tex={'D=(-4)^2-4\\cdot 1\\cdot 3'} label="D = (−4)² − 4 · 1 · 3" />
      </div>
      <p className="calculation-note">Квадрат отрицательного числа положителен: (−4)² = 16.<br />А 4 · 1 · 3 = 12.</p>
      <form className="discriminant-form" onSubmit={event => { event.preventDefault(); dispatch({ type: 'CHECK', step: 1 }) }}>
        <label htmlFor="lesson-d">D = 16 − 12 =</label>
        <input id="lesson-d" type="text" inputMode="decimal" autoComplete="off" spellCheck={false} value={state.discriminant} onChange={event => dispatch({ type: 'DISCRIMINANT', value: event.target.value })} aria-invalid={feedback === 'incorrect' || undefined} aria-describedby="lesson-feedback" />
        <button type="submit">Проверить D</button>
      </form>
    </div> : null}

    {step === 2 ? <div className="lesson-task graph-task">
      <div className="graph-controls" role="group" aria-label="Выбор свободного коэффициента c">
        {([3, 4, 5] as const).map((c: GraphC) => <button key={c} className="secondary graph-choice" aria-pressed={state.graphC === c} onClick={() => dispatch({ type: 'GRAPH', value: c })}>c = {c}<span>{state.visited.includes(c) ? 'Просмотрено' : 'Посмотреть'}</span></button>)}
      </div>
      <EquationGraph c={state.graphC} />
      {!ready ? <p className="task-guide">Посмотри все три случая, чтобы продолжить · {state.visited.length}/3</p> : null}
    </div> : null}

    {step === 3 ? <div className="lesson-task">
      <div className="formula-stack">
        <MathFormula tex={'x_{1,2}=\\frac{-b\\pm\\sqrt{D}}{2a}'} label="Корни равны: минус b плюс-минус квадратный корень из D, всё делённое на 2a" />
        {state.revealed >= 1 ? <div className="root-step"><span>1. Подставляем коэффициенты</span><MathFormula tex={'x_{1,2}=\\frac{4\\pm\\sqrt{4}}{2\\cdot1}'} label="x₁,₂ = (4 ± √4) / (2 · 1)" /><p>Здесь −b = −(−4) = 4.</p></div> : null}
        {state.revealed >= 2 ? <div className="root-step"><span>2. Вычисляем корень и знаменатель</span><MathFormula tex={'\\sqrt{4}=2,\\qquad x_{1,2}=\\frac{4\\pm2}{2}'} label="Квадратный корень из 4 равен 2; x₁,₂ = (4 ± 2) / 2" /></div> : null}
        {state.revealed >= 3 ? <div className="root-step"><span>3. Получаем два значения</span><MathFormula tex={'x_1=\\frac{4-2}{2}=1'} label="x₁ = (4 − 2) / 2 = 1" /><MathFormula tex={'x_2=\\frac{4+2}{2}=3'} label="x₂ = (4 + 2) / 2 = 3" /></div> : null}
      </div>
      {state.revealed < 3 ? <button onClick={() => dispatch({ type: 'REVEAL' })}>Показать следующий шаг</button> : null}
      <aside className="math-reminder"><p>При D = 0 — один действительный корень:</p><MathFormula tex={'x=\\frac{-b}{2a}'} label="x = −b / (2a)" /><p>При D &lt; 0 действительных корней нет.</p></aside>
    </div> : null}

    {step === 4 ? <div className="lesson-task">
      <div className="formula-stack"><MathFormula tex={'x^2-4x+3=0'} label="x² − 4x + 3 = 0" /></div>
      <form onSubmit={event => { event.preventDefault(); dispatch({ type: 'CHECK', step: 4 }) }}>
        <fieldset className="calibration-options"><legend>Выбери результат</legend>
          {calibrationChoices.map((choice, index) => <label className="radio-option calibration-option" key={choice}>
            <input type="radio" name="calibration" checked={state.calibration === index} onChange={() => dispatch({ type: 'CALIBRATION', value: index })} />
            <span>{choice}</span>
          </label>)}
        </fieldset>
        <button type="submit">Подтвердить</button>
      </form>
    </div> : null}

    <div id="lesson-feedback" role="status" aria-live="polite" aria-atomic="true" className={`lesson-feedback ${feedbackCopy ? ready ? 'feedback-success' : 'feedback-warning' : ''}`}>
      {feedbackCopy ? <><strong>{ready ? 'БИП · Верно' : feedback === 'empty' ? 'БИП · Нужен ответ' : 'БИП · Попробуем ещё раз'}</strong><p className="visually-hidden">{feedbackCopy}</p><p>{ready ? 'Можно продолжить обучение.' : 'Исправь ответ и проверь ещё раз.'}</p></> : null}
    </div>
    <nav className="actions lesson-actions" aria-label="Переходы по уроку">
      {step > 0 ? <button className="secondary" onClick={onBack}>Назад</button> : null}
      <button disabled={!ready} onClick={() => { if (ready) onNext() }}>{step === lessons.length - 1 ? 'К маршруту' : 'Далее'}</button>
    </nav>
  </div>
}
