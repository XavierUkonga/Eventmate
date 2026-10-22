import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  NavLink,
} from 'react-router-dom'
import Navigation from '../components/dashboard_components/Navigation'
import ConversationList from '../components/dashboard_components/ConversationList'
import MessageBubble from '../components/dashboard_components/MessageBubble'
import {
  getFriends,
  getMessages,
  sendMessage,
} from '../services/messagesService'
import {
  getCurrentUserId,
} from '../services/profileService'

export default function MessagesPage() {
  const [friends, setFriends] = useState([])

  const [
    selectedFriend,
    setSelectedFriend,
  ] = useState(null)

  const [messages, setMessages] =
    useState([])

  const [search, setSearch] = useState('')

  const [messageText, setMessageText] =
    useState('')

  const [loadingFriends, setLoadingFriends] =
    useState(true)

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false)

  const [sending, setSending] =
    useState(false)

  const [error, setError] = useState('')

  const messageEndRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function loadFriends() {
      try {
        setLoadingFriends(true)
        setError('')

        const friendData =
          await getFriends()

        if (!cancelled) {
          setFriends(friendData)

          setSelectedFriend(
            friendData[0] || null,
          )
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setLoadingFriends(false)
        }
      }
    }

    loadFriends()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedFriend) {
      setMessages([])
      return
    }

    let cancelled = false

    async function loadConversation() {
      try {
        setLoadingMessages(true)
        setError('')

        const messageData =
          await getMessages(
            selectedFriend.id,
          )

        if (!cancelled) {
          setMessages(messageData)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
          setMessages([])
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false)
        }
      }
    }

    loadConversation()

    return () => {
      cancelled = true
    }
  }, [selectedFriend])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage =
      messageText.trim()

    if (
      !trimmedMessage ||
      !selectedFriend ||
      sending
    ) {
      return
    }

    try {
      setSending(true)
      setError('')

      const newMessage =
        await sendMessage(
          selectedFriend.id,
          trimmedMessage,
        )

      setMessages((current) => [
        ...current,
        newMessage,
      ])

      setMessageText('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl p-4">
        {error && (
          <p
            className="mb-3 rounded-lg bg-red-50 p-3 text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <section className="grid h-full min-h-0 overflow-hidden rounded-xl border bg-white shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
          {loadingFriends ? (
            <p className="border-r p-6 text-gray-500">
              Loading friends...
            </p>
          ) : (
            <ConversationList
              friends={friends}
              selectedFriendId={
                selectedFriend?.id
              }
              search={search}
              onSearchChange={setSearch}
              onFriendSelect={
                setSelectedFriend
              }
            />
          )}

          <div className="flex min-h-0 flex-col">
            {!selectedFriend ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-3xl">
                    ✉
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold text-gray-900">
                    No conversation selected
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Accepted connections will
                    appear in the friends list.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="flex items-center justify-between border-b px-5 py-3">
                  <NavLink
                    className="flex items-center gap-3"
                    to={`/profile/${selectedFriend.id}`}
                  >
                    {selectedFriend.avatarUrl ? (
                      <img
                        className="h-11 w-11 rounded-full object-cover"
                        src={
                          selectedFriend.avatarUrl
                        }
                        alt=""
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                        {
                          selectedFriend.initials
                        }
                      </div>
                    )}

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {
                          selectedFriend.displayName
                        }
                      </h2>

                      <p className="text-sm text-green-600">
                        Connected
                      </p>
                    </div>
                  </NavLink>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
                  {loadingMessages ? (
                    <p className="text-center text-gray-500">
                      Loading messages...
                    </p>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        {selectedFriend.avatarUrl ? (
                          <img
                            className="mx-auto h-24 w-24 rounded-full object-cover"
                            src={
                              selectedFriend.avatarUrl
                            }
                            alt=""
                          />
                        ) : (
                          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
                            {
                              selectedFriend.initials
                            }
                          </div>
                        )}

                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                          Start a conversation with{' '}
                          {
                            selectedFriend.displayName
                          }
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map(
                        (message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            sentByCurrentUser={
                              message.senderId ===
                              getCurrentUserId()
                            }
                          />
                        ),
                      )}

                      <div ref={messageEndRef} />
                    </div>
                  )}
                </div>

                <form
                  className="border-t bg-white p-4"
                  onSubmit={handleSubmit}
                >
                  <div className="flex items-end gap-3">
                    <label className="flex-1">
                      <span className="sr-only">
                        Write a message
                      </span>

                      <textarea
                        className="max-h-32 min-h-12 w-full resize-none rounded-xl bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-violet-200"
                        placeholder="Write a message..."
                        value={messageText}
                        disabled={sending}
                        onChange={(event) =>
                          setMessageText(
                            event.target.value,
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                              'Enter' &&
                            !event.shiftKey
                          ) {
                            event.preventDefault()

                            event.currentTarget.form?.requestSubmit()
                          }
                        }}
                      />
                    </label>

                    <button
                      className="rounded-full bg-violet-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      type="submit"
                      disabled={
                        sending ||
                        !messageText.trim()
                      }
                    >
                      {sending
                        ? 'Sending...'
                        : 'Send'}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Press Enter to send. Use
                    Shift + Enter for a new line.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}