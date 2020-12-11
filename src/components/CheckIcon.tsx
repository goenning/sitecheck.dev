interface CheckIconProps {
  positive: boolean
}

export function CheckIcon(props: CheckIconProps): JSX.Element {
  const bgColor = props.positive ? 'text-green-500' : 'text-red-500'

  return (
    <span className={`w-6 h-6 mr-2 inline-flex items-center justify-center ${bgColor} text-white rounded-full flex-shrink-0`}>
      {props.positive && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="w-full h-full" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {!props.positive && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="w-full h-full" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </span>
  )
}
