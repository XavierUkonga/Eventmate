import { NavLink } from 'react-router-dom'

export default function ConnectionCard({
  person,
  reason,
  selectedEventId,
  connectionStatus,
  updating,
  onConnect,
  onCancel,
  onAccept,
}) {
  const attending =
    person.attendingEventIds?.includes(
      selectedEventId,
    )

  const connected =
    connectionStatus === 'matched'

  const pending =
    connectionStatus === 'pending'

  const incoming =
    connectionStatus === 'incoming'

  function handleAction() {
    if (incoming) {
      onAccept(person.id)
    } else if (pending) {
      onCancel(person.id)
    } else {
      onConnect(person.id)
    }
  }

  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <NavLink
        className="block"
        to={`/profile/${person.id}`}
        aria-label={`View ${person.displayName}'s profile`}
      >
        <div className="relative mx-auto w-fit">
          {person.avatarUrl ? (
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={person.avatarUrl}
              alt=""
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">
              {person.initials}
            </div>
          )}

          <span
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold text-white ${
              attending
                ? 'bg-green-600'
                : 'bg-gray-500'
            }`}
          >
            {attending
              ? 'Attending'
              : 'Not attending'}
          </span>
        </div>

        <div className="mt-5 text-center">
          <h3 className="font-semibold text-gray-900">
            {person.displayName}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {person.location ||
              'Location not added'}
          </p>

          <p className="mt-2 min-h-10 text-sm text-violet-700">
            {reason}
          </p>
        </div>
      </NavLink>

      <button
        className={`mt-3 w-full rounded-full px-4 py-2 font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
          connected
            ? 'bg-green-100 text-green-700'
            : incoming
              ? 'bg-violet-600 text-white'
              : pending
                ? 'border border-red-500 text-red-600'
                : 'border border-violet-600 text-violet-600'
        }`}
        type="button"
        disabled={connected || updating}
        onClick={handleAction}
      >
        {updating
          ? 'Saving...'
          : connected
            ? 'Connected'
            : incoming
              ? 'Accept request'
              : pending
                ? 'Cancel request'
                : 'Connect'}
      </button>
    </article>
  )
}