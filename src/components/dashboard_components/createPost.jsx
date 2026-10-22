import { useState } from 'react'
import {
  getInitials,
} from '../../utils/profileUtils'

export default function CreatePost({
  user,
  onPostSubmit,
}) {
  const [inputText, setInputText] =
    useState('')

  const [error, setError] = useState('')

  const [submitting, setSubmitting] =
    useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const content = inputText.trim()

    if (!content) {
      setError(
        'Write something before posting.',
      )
      return
    }

    try {
      setSubmitting(true)

      await onPostSubmit({
        content,
      })

      setInputText('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="rounded-xl border bg-white p-4 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex items-start gap-3">
        {user.avatarUrl ? (
          <img
            className="h-11 w-11 shrink-0 rounded-full object-cover"
            src={user.avatarUrl}
            alt=""
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
            {getInitials(
              user.displayName,
            )}
          </div>
        )}

        <textarea
          className="min-h-20 flex-1 resize-none rounded-xl bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 caret-violet-600 outline-none focus:ring-2 focus:ring-violet-200" placeholder="What's on your mind?"
          value={inputText}
          disabled={submitting}
          onChange={(event) =>
            setInputText(event.target.value)
          }
        />
      </div>

      {error && (
        <p
          className="mt-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <p className="text-sm text-gray-500">
        </p>

        <button
          className="rounded-full bg-violet-600 px-6 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={
            submitting ||
            !inputText.trim()
          }
        >
          {submitting
            ? 'Posting...'
            : 'Post'}
        </button>
      </div>
    </form>
  )
}