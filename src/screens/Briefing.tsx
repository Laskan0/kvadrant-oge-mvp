import { ComputerMascot, type MascotExpression } from '../components/ComputerMascot'

const dialogue: { title: string; message: string; expression: MascotExpression }[] = [
  { title: 'Привет, капитан!', message: 'Я БИП — бортовой компьютер. Буду сопровождать тебя в этой экспедиции.', expression: 'friendly' },
  { title: 'Разберёмся вместе', message: 'Я помогу понять дискриминант, увидеть связь с графиком и найти корни уравнения.', expression: 'thinking' },
  { title: 'Можно ошибаться', message: 'Во время полёта ты будешь решать задачи, а я подскажу, какой шаг проверить. Готов начать?', expression: 'encouraging' },
]

export function Briefing({ step, onNext, onBack }: { step: number; onNext: () => void; onBack: () => void }) {
  const current = dialogue[step]
  return <section className="briefing-content" aria-labelledby="briefing-title">
    <p className="eyebrow">Знакомство с экипажем · {step + 1} из {dialogue.length}</p>
    <h1 id="briefing-title">Перед стартом</h1>
    <div className="briefing-dialogue" aria-live="polite" aria-atomic="true">
      <ComputerMascot message={current.message} expression={current.expression} />
    </div>
    <nav className="actions briefing-actions" aria-label="Диалог с БИПом">
      {step > 0 ? <button className="secondary" onClick={onBack}>Назад</button> : <span />}
      <button className="briefing-next" onClick={onNext}>Далее<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-7 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
    </nav>
  </section>
}
