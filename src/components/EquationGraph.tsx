import { useId } from 'react'
import type { GraphC } from '../logic/lesson'
import { solveQuadratic } from '../logic/math'
import { MathFormula } from './MathFormula'

const plot = { left: 42, top: 20, width: 460, height: 240 }
const pointX = (x: number) => plot.left + ((x + 1) / 6) * plot.width
const pointY = (y: number) => plot.top + ((7 - y) / 9) * plot.height

export function EquationGraph({ c }: { c: GraphC }) {
  const clip = `${useId().replace(/:/g, '')}-graph`
  const { discriminant, roots } = solveQuadratic({ a: 1, b: -4, c })
  const points = Array.from({ length: 121 }, (_, index) => {
    const x = -1 + index * .05
    return `${pointX(x).toFixed(2)},${pointY(x * x - 4 * x + c).toFixed(2)}`
  }).join(' ')
  const caption = c === 3 ? 'Два действительных корня: x = 1 и x = 3. Парабола пересекает ось X в двух точках.'
    : c === 4 ? 'Один действительный корень: x = 2. Парабола касается оси X.'
    : 'Действительных корней нет. Парабола не пересекает ось X.'
  return <figure className="equation-graph">
    <div className="graph-formulas">
      <MathFormula tex={`y=x^2-4x+${c}`} label={`y = x² − 4x + ${c}`} />
      <span>D = 16 − {4 * c} = {discriminant < 0 ? '−4' : discriminant}</span>
    </div>
    <svg viewBox="0 0 540 296" role="img" aria-label={`График y = x² − 4x + ${c}. ${caption}`}>
      <defs><clipPath id={clip}><rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} /></clipPath></defs>
      <g stroke="#31506a" strokeWidth=".6">
        {[-1, 0, 1, 2, 3, 4, 5].map(x => <line key={x} x1={pointX(x)} y1={plot.top} x2={pointX(x)} y2={plot.top + plot.height} />)}
        {[-2, 0, 2, 4, 6].map(y => <line key={y} x1={plot.left} y1={pointY(y)} x2={plot.left + plot.width} y2={pointY(y)} />)}
      </g>
      <g stroke="#a4bfd5" strokeWidth="1.2">
        <path d={`M${plot.left} ${pointY(0)}H${plot.left + plot.width}m-6-4 6 4-6 4`} fill="none" />
        <path d={`M${pointX(0)} ${plot.top + plot.height}V${plot.top}m-4 6 4-6 4 6`} fill="none" />
      </g>
      <g className="graph-labels" fill="#c7dce9" fontSize="12" fontFamily="system-ui, sans-serif">
        {[-1, 0, 1, 2, 3, 4, 5].map(x => <text key={x} x={pointX(x)} y={pointY(0) + 18} textAnchor="middle">{x}</text>)}
        {[-2, 2, 4, 6].map(y => <text key={y} x={pointX(0) - 12} y={pointY(y) + 4} textAnchor="end">{y}</text>)}
        <text x="514" y={pointY(0) + 5}>X</text><text x={pointX(0) + 10} y="16">Y</text>
      </g>
      <polyline data-testid="parabola" points={points} fill="none" stroke="#62d9f2" strokeWidth="3" clipPath={`url(#${clip})`} />
      {roots.map(root => <circle data-testid="graph-root" key={root} cx={pointX(root)} cy={pointY(0)} r="5" fill="#ffbf69" stroke="#081527" strokeWidth="2" />)}
    </svg>
    <figcaption><strong>{discriminant > 0 ? 'D > 0' : discriminant === 0 ? 'D = 0' : 'D < 0'}</strong> · {caption}</figcaption>
  </figure>
}
