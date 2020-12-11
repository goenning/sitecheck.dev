import { useEffect, useState } from 'react'

interface ScoreRingProps {
  className: string
  radius: number
  stroke: number
  progress: number
}

export function ScoreRing(props: ScoreRingProps): JSX.Element {
  const { radius, stroke, progress } = props
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const [strokeDashoffset, setStrokeDashoffset] = useState(360)

  useEffect(() => {
    setStrokeDashoffset(circumference - (progress / 100) * circumference)
  }, [props.progress])

  const color = props.progress >= 80 ? 'green' : props.progress >= 50 ? 'orange' : 'red'

  return (
    <svg className={props.className} height={radius * 2} width={radius * 2}>
      <circle
        className="score-ring"
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text x="50%" y="50%" fontSize="30px" fill="#111827" strokeWidth="1px" textAnchor="middle" dy=".4em">
        {props.progress}
      </text>
    </svg>
  )
}
