import { useId } from 'react'
import { RouteTrace } from './RouteTrace'

const stars = Array.from({ length: 100 }, (_, index) => ({
  x: (index * 137 + 19) % 1200,
  y: (index * 83 + 37) % 450,
  radius: index % 11 === 0 ? 1.8 : index % 3 === 0 ? 1 : 0.6,
  opacity: 0.25 + (index % 7) * 0.1,
}))
const asteroids = [
  { x: 400, y: 100, size: 57, rotation: -15 },
  { x: 460, y: 330, size: 40, rotation: 24 },
  { x: 650, y: 160, size: 26, rotation: -30 },
  { x: 690, y: 385, size: 61, rotation: 15 },
]

export function SpaceScene({ sector, arrived, learning, flying = false }: { sector: number; arrived: boolean; learning: boolean; flying?: boolean }) {
  const position = arrived ? 2 : flying ? sector + 1 : sector
  const id = useId().replace(/:/g, '')
  const planet = `${id}-planet`
  const clip = `${id}-clip`
  const flame = `${id}-flame`
  return (
    <section className="space-scene" aria-label={arrived ? 'Корабль прибыл к планете' : `Карта экспедиции. Участков пройдено: ${sector} из 2`}>
      <p className="scene-label"><span />Маршрут к планете</p>
      <svg className="space-art" viewBox="0 0 1200 450" role="img" aria-label="Корабль среди астероидов направляется к голубой планете" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={planet} cx="27%" cy="22%" r="85%">
            <stop stopColor="#8ce9ec" /><stop offset=".35" stopColor="#2398b2" />
            <stop offset=".73" stopColor="#145075" /><stop offset="1" stopColor="#0a2342" />
          </radialGradient>
          <clipPath id={clip}><circle cx="1020" cy="200" r="193" /></clipPath>
          <linearGradient id={flame}><stop stopColor="#62d9f2" stopOpacity="0" /><stop offset="1" stopColor="#90f2ff" /></linearGradient>
        </defs>
        <g aria-hidden="true">
          {stars.map((star, index) => <circle key={index} cx={star.x} cy={star.y} r={star.radius} fill={index % 4 === 0 ? '#62d9f2' : '#eaf5ff'} opacity={star.opacity} />)}
          <g stroke="#eaf5ff" strokeWidth=".8" opacity=".8">
            <path d="M240 70v18m-9-9h18M150 310v12m-6-6h12M745 260v14m-7-7h14" />
          </g>
          <g className="planet-art">
          <g fill="none" stroke="#246087" strokeWidth=".65" opacity=".5">
            <circle cx="1020" cy="200" r="240" /><circle cx="1020" cy="200" r="280" /><circle cx="1020" cy="200" r="335" />
          </g>
          <ellipse cx="1020" cy="205" rx="315" ry="69" transform="rotate(-22 1020 205)" fill="none" stroke="#388dad" strokeWidth="15" opacity=".5" />
          <ellipse cx="1020" cy="205" rx="320" ry="75" transform="rotate(-22 1020 205)" fill="none" stroke="#6bd2e3" strokeWidth="2" opacity=".65" />
          <circle cx="1020" cy="200" r="195" fill="#62d9f2" opacity=".08" />
          <circle cx="1020" cy="200" r="193" fill={`url(#${planet})`} stroke="#71d6e1" strokeOpacity=".5" />
          <g clipPath={`url(#${clip})`} transform="rotate(-18 1020 200)" fill="none">
            {Array.from({ length: 18 }, (_, index) => <path key={index} d={`M790 ${index * 25 - 5} Q1000 ${index * 25 + 28} 1250 ${index * 25 - 15}`} stroke={index % 3 === 0 ? '#9be4e1' : '#061c3b'} strokeOpacity={index % 3 === 0 ? '.12' : '.16'} strokeWidth={index % 2 === 0 ? 12 : 6} />)}
          </g>
          <path d="M743 309 Q930 337 1240 175" fill="none" stroke="#62d9f2" strokeWidth="6" opacity=".4" />
          <circle cx="805" cy="63" r="15" fill={`url(#${planet})`} stroke="#62d9f2" strokeOpacity=".3" />
          </g>
          <g className="asteroid-field">
            {asteroids.map((rock, index) => <g className={`asteroid asteroid-${index}`} key={index}>
              <g transform={`translate(${rock.x} ${rock.y}) rotate(${rock.rotation}) scale(${rock.size / 50})`}>
                <path d="M-41-21-18-47 13-43 43-19 47 12 20 43-13 48-43 20-48-1Z" fill="#30465e" stroke="#7089a2" strokeWidth="1.5" />
                <path d="M-41-21-18-47 13-43 0-17-24-7Z" fill="#7c91a7" />
                <path d="M13-43 43-19 20-7 0-17Z" fill="#566f89" />
                <path d="M-24-7 0-17 20-7 13 20-9 30-34 13Z" fill="#455e79" />
                <path d="M43-19 47 12 20 43 13 20 20-7Z" fill="#263c55" />
                <path d="M-43 20-13 48 20 43-9 30-34 13Z" fill="#23394f" />
                <path d="M-18-24-9-29-5-20-13-15ZM18 5 29 0 32 12 22 17ZM-18 17-9 13-7 22-16 27Z" fill="#172d45" opacity=".7" />
              </g>
            </g>)}
          </g>
          <RouteTrace completed={arrived ? 2 : sector} flying={flying} />
          <g className={`ship-location ship-location-${position}`} transform={`translate(${position === 2 ? 790 : position === 1 ? 570 : 205} 225)`}>
            <g className={arrived ? 'ship' : 'ship ship-idle'}>
              {!arrived ? <g className="ship-exhaust"><path d="M-190-4-54-10-54 11-190 7-120 1Z" fill={`url(#${flame})`} /><path d="M-115 0-53-5-53 5Z" fill="#b2f8ff" /></g> : null}
              <path d="M-42-18-27-41-9-39 20-12ZM-42 18-27 41-9 39 20 12Z" fill="#97b3c9" stroke="#dfedf7" />
              <path d="M-36-10-62-25-42-27-18-13ZM-36 10-62 25-42 27-18 13Z" fill="#6d8ba4" />
              <path d="M-56-17-10-22 32-13 60 0 32 13-10 22-56 17-42 0Z" fill="#eaf5ff" />
              <path d="M-42 0 60 0 32 13-10 22-56 17Z" fill="#a7bed0" />
              <path d="M9-14 29-10 44-2 10-2-1-6Z" fill="#0c3e5c" stroke="#62d9f2" strokeWidth=".7" />
              <path d="M-52-8-23-9-10-4-43-3ZM-52 8-23 9-10 4-43 3Z" fill="#47647d" />
              <path d="M-56-10-56 10" stroke="#62d9f2" strokeWidth="4" />
            </g>
          </g>
        </g>
      </svg>
      <ol className="route-stages" aria-label="Этапы экспедиции">
        <li aria-current={learning ? 'step' : undefined} className={learning ? 'active' : 'done'}>Обучение</li>
        <li aria-current={!learning && sector === 0 && !arrived ? 'step' : undefined} className={!learning && sector === 0 ? 'active' : sector >= 1 ? 'done' : ''}>Участок 1</li>
        <li aria-current={!learning && sector === 1 && !arrived ? 'step' : undefined} className={arrived ? 'done' : sector === 1 ? 'active' : ''}>Участок 2</li>
      </ol>
      <span className="visually-hidden">Участков пройдено: {sector}/2</span>
    </section>
  )
}
