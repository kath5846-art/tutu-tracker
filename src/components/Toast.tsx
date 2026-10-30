interface Props {
  message: string | null
}

export function Toast({ message }: Props) {
  return (
    <div className={'toast' + (message ? ' show' : '')} role="status" aria-live="polite">
      {message ?? ''}
    </div>
  )
}
