interface TableRowProps {
  name: string
  content: React.ReactNode
  type?: 'good' | 'ok' | 'nok' | 'bad'
  message?: string
}

export function TableRow(props: TableRowProps): JSX.Element {
  const longValue = props.name === 'set-cookie'
  const color = props.type === 'good' ? 'text-green-600' : props.type === 'bad' ? 'text-red-600' : props.type === 'nok' ? 'text-yellow-600' : 'text-gray-500'
  return (
    <tr className="border-b border-gray-300">
      <td style={{ width: '240px' }} className={`pr-4 py-2 text-right text-xs font-medium ${color} uppercase whitespace-nowrap`}>
        {props.name}
      </td>
      <td className={`py-1 ${longValue && 'break-all'}`}>
        {props.content}
        {props.message && <p className={`text-xs ${color}`}>{props.message}</p>}
      </td>
    </tr>
  )
}

interface HeaderTableRowProps {
  name: string
  value: string | string[] | undefined
  showRecommendation?: boolean
}

export function HeaderTableRow(props: HeaderTableRowProps): JSX.Element | null {
  if (props.name === 'server') {
    return (
      <TableRow
        name={props.name}
        content={props.value}
        type="nok"
        message="A server might usually expose the technology used on your server and it's recommended to avoid using it if possible."
      />
    )
  }

  if (props.name === 'status') {
    return null
  }

  if (props.name === 'strict-transport-security') {
    return <TableRow name={props.name} content={props.value} type="good" message="Your site is using HSTS, great job!" />
  }

  if (props.name === 'x-content-type-options') {
    return <TableRow name={props.name} content={props.value} type="good" message="Nice one!" />
  }

  if (props.name === 'x-frame-options') {
    return <TableRow name={props.name} content={props.value} type="good" message="Well done!" />
  }

  if (props.name === 'content-security-policy') {
    return <TableRow name={props.name} content={props.value} type="good" message="Your site has a content security policy, well done!" />
  }

  return <TableRow {...props} content={props.value} type="ok" />
}
