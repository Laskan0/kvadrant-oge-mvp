import { useId } from 'react'

export type MascotState = 'neutral' | 'warning' | 'success'
export type MascotExpression = 'friendly' | 'thinking' | 'encouraging'

const stateLabels: Record<MascotState, string> = {
  neutral: 'Объясняю',
  warning: 'Разберёмся',
  success: 'Получилось!',
}

export function ComputerMascot({ message, state = 'neutral', expression }: { message: string; state?: MascotState; expression?: MascotExpression }) {
  const glow = `${useId().replace(/:/g, '')}-bip`
  const face = expression ?? (state === 'warning' ? 'thinking' : state === 'success' ? 'encouraging' : 'friendly')
  return (
    <div className={`computer computer-${state} bip-expression-${face}`} data-state={state} data-expression={face}>
      <svg className="computer-icon" viewBox="0 0 100 100" aria-hidden="true">
        <defs><radialGradient id={glow}><stop stopColor="#163b55" /><stop offset="1" stopColor="#081e32" /></radialGradient></defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity=".3" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="80 8 24 6 35 130" transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r="39" fill={`url(#${glow})`} stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeOpacity=".3" />
        {face === 'encouraging' ? <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M31 48q6-12 12 0M57 48q6-12 12 0" />
          <path d="M39 59q11 16 22 0Z" fill="currentColor" strokeWidth="1.5" />
        </g> : <>
          <rect x="33" y={face === 'thinking' ? 42 : 40} width="7" height={face === 'thinking' ? 10 : 13} rx="3.5" fill="currentColor" />
          <rect x="60" y={face === 'thinking' ? 42 : 40} width="7" height={face === 'thinking' ? 10 : 13} rx="3.5" fill="currentColor" />
          {face === 'thinking' ? <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M32 34l10 1M59 35l10-2M44 63q6-4 12 0" /></g>
            : <path d="M41 59q9 9 18 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />}
        </>}
      </svg>
      <p><strong>БИП <small>· {stateLabels[state]}</small></strong><span>{message}</span></p>
    </div>
  )
}
