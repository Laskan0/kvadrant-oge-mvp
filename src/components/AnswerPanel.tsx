import type { ReactNode } from 'react'

export function AnswerPanel({ children, tone = 'neutral', flashKey = 0 }: { children: ReactNode; tone?: 'neutral' | 'warning' | 'success'; flashKey?: number }) {
  return <section className={`terminal terminal-${tone}`}>
    {tone !== 'neutral' ? <span key={`${tone}-${flashKey}`} className="feedback-flash" aria-hidden="true" /> : null}
    {children}
  </section>
}
