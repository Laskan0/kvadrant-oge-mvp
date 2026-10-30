import { ComputerMascot } from '../components/ComputerMascot'

export function Intro({ onStart }: { onStart: () => void }) {
  return <div className="intro-layout">
    <div className="intro-copy">
      <h1>КВАДРАНТ</h1>
      <p className="lead">Научись решать квадратные уравнения через дискриминант</p>
      <p className="intro-summary">Короткий урок, две задачи и маршрут к планете</p>
    </div>
    <div className="intro-launch">
      <ComputerMascot message="Привет! Я БИП. Начнём с одного примера — я покажу каждый шаг." />
      <button className="start-button" onClick={onStart}>Начать обучение<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-7 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      <p className="launch-note">Можно ошибаться. Попробуй ещё раз — я помогу.</p>
    </div>
  </div>
}
