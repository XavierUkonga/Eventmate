function formatMessageTime(dateString) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function MessageBubble({
  message,
  sentByCurrentUser,
}) {
  return (
    <div
      className={`flex ${
        sentByCurrentUser
          ? 'justify-end'
          : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          sentByCurrentUser
            ? 'rounded-br-sm bg-violet-600 text-white'
            : 'rounded-bl-sm bg-gray-200 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">
          {message.text}
        </p>

        <p
          className={`mt-1 text-xs ${
            sentByCurrentUser
              ? 'text-violet-100'
              : 'text-gray-500'
          }`}
        >
          {formatMessageTime(
            message.createdAt,
          )}
        </p>
      </div>
    </div>
  )
}