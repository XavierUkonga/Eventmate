import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useLocation,
} from 'react-router-dom'
import {
  getMatchedConnections,
} from '../../services/engagementService'
import {
  getMessages,
  sendMessage,
} from '../../services/messagesService'
import {
  getCurrentUserId,
} from '../../services/profileService'

export default function ChatBox() {
  const location = useLocation()

  const [
    matchedConnections,
    setMatchedConnections,
  ] = useState(getMatchedConnections)

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)

  const messageEndRef = useRef(null)

  const selectedPerson =
    matchedConnections.find(
      (person) => person.id === selectedId,
    ) ?? matchedConnections[0]

  useEffect(() => {
    function refreshConnections() {
      const updatedConnections =
        getMatchedConnections()

      setMatchedConnections(updatedConnections)

      setSelectedId((currentId) => {
        const currentStillExists =
          updatedConnections.some(
            (person) => person.id === currentId,
          )

        return currentStillExists
          ? currentId
          : updatedConnections[0]?.id ?? ''
      })
    }

    function handleOpenChat(event) {
      refreshConnections()

      if (event.detail?.personId) {
        setSelectedId(event.detail.personId)
      }

      setOpen(true)
    }

    refreshConnections()

    window.addEventListener(
      'eventmate-engagement-updated',
      refreshConnections,
    )

    window.addEventListener(
      'eventmate-open-chat',
      handleOpenChat,
    )

    return () => {
      window.removeEventListener(
        'eventmate-engagement-updated',
        refreshConnections,
      )

      window.removeEventListener(
        'eventmate-open-chat',
        handleOpenChat,
      )
    }
  }, [])

  useEffect(() => {
    if (!open || !selectedPerson) {
      return
    }

    let requestCancelled = false

    async function loadConversation() {
      setLoading(true)

      const savedMessages = await getMessages(
        selectedPerson.id,
      )

      if (!requestCancelled) {
        setMessages(savedMessages)
        setLoading(false)
      }
    }

    loadConversation()

    return () => {
      requestCancelled = true
    }
  }, [open, selectedPerson?.id])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  async function handleSend(event) {
    event.preventDefault()

    const trimmedMessage = messageText.trim()

    if (!trimmedMessage || !selectedPerson) {
      return
    }

    const newMessage = await sendMessage(
      selectedPerson.id,
      trimmedMessage,
    )

    setMessages((current) => [
      ...current,
      newMessage,
    ])

    setMessageText('')
  }

  if (location.pathname === '/messages') {
    return null
  }

  if (!open) {
    return (
      <button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl transition hover:scale-105 hover:bg-violet-700"
        type="button"
        aria-label="Open messages"
        onClick={() => setOpen(true)}
      >
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        </svg>
      </button>
    )
  }

  return (
    <section className="fixed bottom-6 right-6 z-50 flex h-125 w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-violet-600 p-3 text-white">
        <div className="flex items-center gap-3">
          {selectedPerson && (
            <img
              className="h-9 w-9 rounded-full object-cover"
              src={selectedPerson.avatarUrl}
              alt=""
            />
          )}

          <div>
            <h2 className="font-semibold">
              {selectedPerson
                ? selectedPerson.displayName
                : 'Messages'}
            </h2>

            <p className="text-xs text-violet-100">
              Matched connection
            </p>
          </div>
        </div>

        <button
          className="rounded-full px-2 py-1 hover:bg-white/20"
          type="button"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </header>

      {matchedConnections.length > 1 && (
        <div className="border-b p-2">
          <select
            className="w-full rounded-lg border p-2 text-sm text-gray-900"
            value={selectedPerson?.id ?? ''}
            onChange={(event) =>
              setSelectedId(event.target.value)
            }
          >
            {matchedConnections.map((person) => (
              <option
                key={person.id}
                value={person.id}
              >
                {person.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-3">
        {!selectedPerson ? (
          <p className="p-5 text-center text-sm text-gray-500">
            You do not have any matched connections yet.
          </p>
        ) : loading ? (
          <p className="p-5 text-center text-sm text-gray-500">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">
            Start a conversation with {selectedPerson.displayName}.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const sentByCurrentUser =
                message.senderId === getCurrentUserId()
              return (
                <div
                  key={message.id}
                  className={`flex ${sentByCurrentUser
                    ? 'justify-end'
                    : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${sentByCurrentUser
                      ? 'rounded-br-sm bg-violet-600 text-white'
                      : 'rounded-bl-sm bg-gray-200 text-gray-800'
                      }`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            })}

            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      <form
        className="flex gap-2 border-t p-3"
        onSubmit={handleSend}
      >
        <input
          className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-2 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-violet-200" type="text"
          placeholder="Write a message..."
          value={messageText}
          disabled={!selectedPerson}
          onChange={(event) =>
            setMessageText(event.target.value)
          }
        />

        <button
          className="rounded-full bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          type="submit"
          disabled={
            !selectedPerson ||
            !messageText.trim()
          }
        >
          Send
        </button>
      </form>
    </section>
  )
}