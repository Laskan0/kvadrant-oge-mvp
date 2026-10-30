import { lazy, Suspense, useCallback, useEffect, useReducer, useRef } from 'react'
import { appReducer } from './logic/navigation'
import { loadAppState, saveAppState } from './logic/persistence'
import { AnswerPanel } from './components/AnswerPanel'
import { SpaceScene } from './components/SpaceScene'
import { Intro } from './screens/Intro'
import { Briefing } from './screens/Briefing'
import { Flight } from './screens/Flight'
import { Finish } from './screens/Finish'

const Lesson = lazy(() => import('./screens/Lesson').then(module => ({ default: module.Lesson })))

const Practice = lazy(() => import('./screens/Practice').then(module => ({ default: module.Practice })))

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, loadAppState)
  const contentRef = useRef<HTMLElement>(null)
  const locationKey = state.screen === 'briefing' ? `briefing-${state.step}`
    : state.screen === 'lesson' ? `lesson-${state.step}`
    : state.screen === 'practice' ? `practice-${state.problem}`
    : state.screen === 'flight' ? `flight-${state.problem}` : state.screen

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true })
  }, [locationKey])

  useEffect(() => {
    saveAppState(state)
  }, [state])

  const flightProblem = state.screen === 'flight' ? state.problem : -1
  const finishFlight = useCallback(() => dispatch({ type: 'FLIGHT_COMPLETE', problem: flightProblem }), [flightProblem])
  const tone = state.screen === 'flight' ? 'success' : state.screen === 'practice'
    ? state.practice.feedback === 'incorrect' ? 'warning' : state.practice.feedback === 'accepted' ? 'success' : 'neutral' : 'neutral'

  const completed = state.screen === 'finish' ? 2
    : state.screen === 'practice' || state.screen === 'flight' ? state.problem : 0

  return (
    <div className={`app-shell ${state.screen === 'lesson' ? 'lesson-mode' : ''} ${state.screen === 'briefing' ? 'briefing-mode' : ''} ${state.screen === 'practice' ? 'practice-mode' : ''}`}>
      <div className="mission-frame">
      <header className="topbar">
        <span className="brand"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>КВАДРАНТ</span>
      </header>
      <SpaceScene sector={completed} arrived={state.screen === 'finish'} learning={state.screen === 'briefing' || state.screen === 'intro' || state.screen === 'lesson'} flying={state.screen === 'flight'} />
      <main ref={contentRef} tabIndex={-1} id="main-content">
        <AnswerPanel tone={tone} flashKey={state.screen === 'practice' ? state.practice.attempts : 0}>
          {state.screen === 'briefing' ? <Briefing step={state.step} onNext={() => dispatch({ type: 'BRIEFING_NEXT' })} onBack={() => dispatch({ type: 'BRIEFING_BACK' })} /> : null}
          {state.screen === 'intro' ? <Intro onStart={() => dispatch({ type: 'START_LESSON' })} /> : null}
          {state.screen === 'lesson' ? <Suspense fallback={<p role="status">Загружаю урок…</p>}><Lesson step={state.step} state={state.lesson} onAction={action => dispatch({ type: 'LESSON_ACTION', action })} onNext={() => dispatch({ type: 'LESSON_NEXT' })} onBack={() => dispatch({ type: 'LESSON_BACK' })} /></Suspense> : null}
          {state.screen === 'practice' ? <Suspense fallback={<p role="status">Загружаю практику…</p>}><Practice problemIndex={state.problem} state={state.practice} onAction={action => dispatch({ type: 'PRACTICE', action })} /></Suspense> : null}
          {state.screen === 'flight' ? <Flight result={state.results[state.results.length - 1]} onComplete={finishFlight} /> : null}
          {state.screen === 'finish' ? <Finish results={state.results} onReplay={() => dispatch({ type: 'REPLAY_PRACTICE' })} onTheory={() => dispatch({ type: 'REPEAT_THEORY' })} /> : null}
        </AnswerPanel>
      </main>
      </div>
    </div>
  )
}
