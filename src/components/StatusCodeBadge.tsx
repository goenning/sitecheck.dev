interface StatusCodeBadgeProps {
  statusCode: number
}

export function StatusCodeBadge(props: StatusCodeBadgeProps): JSX.Element {
  const statusCode = props.statusCode
  const colors =
    statusCode >= 200 && statusCode <= 299
      ? 'bg-green-200 text-green-800'
      : statusCode >= 300 && statusCode <= 399
      ? 'bg-yellow-200 text-yellow-800'
      : statusCode >= 400 && statusCode <= 499
      ? 'bg-blue-200 text-blue-800'
      : 'bg-red-200 text-red-800'

  return <span className={`px-3 py-1 ${colors} rounded-full`}>{statusCode}</span>
}
