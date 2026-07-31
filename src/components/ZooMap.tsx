const zones = [
  { label: 'Тропический лес', x: 10, y: 15, w: 35, h: 30, color: '#A8C5A0' },
  { label: 'Саванна', x: 45, y: 20, w: 30, h: 35, color: '#D4C5A9' },
  { label: 'Хищники', x: 60, y: 5, w: 35, h: 30, color: '#C8DFBF' },
  { label: 'Птицы', x: 5, y: 45, w: 25, h: 25, color: '#E8DFC8' },
  { label: 'Водный мир', x: 30, y: 50, w: 25, h: 35, color: '#B8D4D0' },
  { label: 'Приматы', x: 50, y: 50, w: 20, h: 25, color: '#A8C5A0' },
  { label: 'Рептилии', x: 65, y: 60, w: 30, h: 30, color: '#D4C5A9' },
  { label: 'Полярный', x: 60, y: 38, w: 25, h: 20, color: '#E0E8F0' },
]

const paths = [
  { x1: 27, y1: 30, x2: 50, y2: 37 },
  { x1: 50, y1: 37, x2: 77, y2: 20 },
  { x1: 17, y1: 30, x2: 17, y2: 57 },
  { x1: 17, y1: 57, x2: 42, y2: 67 },
  { x1: 42, y1: 67, x2: 65, y2: 75 },
  { x1: 50, y1: 37, x2: 60, y2: 48 },
  { x1: 60, y1: 48, x2: 80, y2: 75 },
]

const waterFeatures = [
  { x: 35, y: 55, w: 15, h: 10 },
  { x: 12, y: 48, w: 8, h: 6 },
]

const treePositions = [
  { x: 8, y: 12, r: 2.5 }, { x: 22, y: 8, r: 3 }, { x: 15, y: 25, r: 1.5 },
  { x: 42, y: 15, r: 2 }, { x: 55, y: 8, r: 2.5 }, { x: 78, y: 12, r: 3 },
  { x: 85, y: 35, r: 1.5 }, { x: 12, y: 42, r: 2.5 }, { x: 8, y: 65, r: 2 },
  { x: 35, y: 45, r: 3 }, { x: 52, y: 42, r: 1.5 }, { x: 75, y: 55, r: 2.5 },
]

export default function ZooMap() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="grass" patternUnits="userSpaceOnUse" width="3" height="3">
          <circle cx="1.5" cy="1.5" r="0.6" fill="#8BA88A" opacity={0.15} />
        </pattern>
      </defs>

      <rect x="0" y="0" width="100" height="100" fill="#F0EBE0" rx="4" />
      <rect x="0" y="0" width="100" height="100" fill="url(#grass)" />
      <path d="M 0 0 L 100 0 L 100 3 Q 50 0 0 3 Z" fill="#2D4A3E" opacity={0.08} />

      {waterFeatures.map((w, i) => (
        <ellipse key={`water-${i}`} cx={w.x + w.w / 2} cy={w.y + w.h / 2} rx={w.w / 2} ry={w.h / 2} fill="#A8D4D0" opacity={0.5} />
      ))}
      {waterFeatures.map((w, i) => (
        <ellipse key={`water-shine-${i}`} cx={w.x + w.w / 2} cy={w.y + w.h / 2} rx={w.w / 2.5} ry={w.h / 3} fill="#C8E8E4" opacity={0.3} />
      ))}

      {zones.map((zone, i) => (
        <g key={`zone-${i}`}>
          <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={4} fill={zone.color} opacity={0.25} />
          <rect x={zone.x + 0.5} y={zone.y + 0.5} width={zone.w - 1} height={zone.h - 1} rx={3.5} fill="none" stroke={zone.color} strokeWidth={0.3} opacity={0.5} />
        </g>
      ))}

      {zones.map((zone, i) => (
        <g key={`zone-label-${i}`}>
          <text x={zone.x + zone.w / 2} y={zone.y + 6} textAnchor="middle" fill="#2D4A3E" opacity={0.3} fontSize={2.5} fontFamily="Inter, sans-serif" fontWeight={500}>
            {zone.label}
          </text>
        </g>
      ))}

      {paths.map((p, i) => (
        <g key={`path-${i}`}>
          <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#EBE0D0" strokeWidth={2} strokeLinecap="round" />
          <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#D4C5A9" strokeWidth={0.6} strokeLinecap="round" strokeDasharray="0.8,0.8" />
        </g>
      ))}

      <g opacity={0.15}>
        {treePositions.map((t, i) => (
          <circle key={`tree-${i}`} cx={t.x} cy={t.y} r={t.r} fill="#6B8F6E" />
        ))}
      </g>
    </svg>
  )
}
