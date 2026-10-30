interface Props { completed: number; flying: boolean }

// Три композиции повторяют позиции корабля в responsive CSS.
// Это условная карта, её геометрия не зависит от значений корней.
const layouts = [
  { name: 'wide', x: [205, 570, 790], y: 225 },
  { name: 'medium', x: [390, 590, 650], y: 225 },
  { name: 'compact', x: [600, 650, 700], y: 210 },
] as const

export function RouteTrace({ completed, flying }: Props) {
  const visibleSegments = Math.min(completed + (flying ? 1 : 0), 2)
  if (visibleSegments === 0) return null
  return <g className="route-trace" aria-hidden="true">
    {layouts.map(layout => <g key={layout.name} className={`route-layout route-layout-${layout.name}`}>
      {[0, 1].slice(0, visibleSegments).map(segment => <g key={segment}>
        <path className={flying && segment === completed ? 'route-line route-line-drawing' : 'route-line'} d={`M${layout.x[segment]} ${layout.y}H${layout.x[segment + 1]}`} pathLength="1" />
        <circle className="route-point-halo" cx={layout.x[segment + 1]} cy={layout.y} r="12" />
        <circle className="route-point" cx={layout.x[segment + 1]} cy={layout.y} r="4" />
      </g>)}
    </g>)}
  </g>
}
