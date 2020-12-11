import React from 'react'

interface SpinnerProps {
  className?: string
}

export function Spinner(props: SpinnerProps): JSX.Element {
  return (
    <svg className={`mx-auto spinner ${props.className}`} viewBox="0 0 50 50" stroke="currentColor">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="2"></circle>
    </svg>
  )
}
