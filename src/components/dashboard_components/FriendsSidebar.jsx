import { NavLink } from 'react-router-dom'

export default function FriendsSidebar({
  friends,
  onMessage,
}) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Friends
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your matched connections
          </p>
        </div>

        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
          {friends.length}
        </span>
      </div>

      {friends.length === 0 ? (
        <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
          <p>You do not have any matched connections yet.</p>

          <p className="mt-2">
            When two people connect, they will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200">
          {friends.map((friend) => (
            <li
              className="flex items-center gap-3 py-3"
              key={friend.id}
            >
              <NavLink
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                to={`/profile/${friend.id}`}
                aria-label={`View ${friend.displayName}'s profile`}
              >
                {friend.avatarUrl ? (
                  <img
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                    src={friend.avatarUrl}
                    alt=""
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {friend.initials}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {friend.displayName}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {friend.location}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-green-600">
                    Connected
                  </p>
                </div>
              </NavLink>

              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-violet-600 transition hover:bg-violet-100"
                type="button"
                aria-label={`Message ${friend.displayName}`}
                onClick={() => onMessage(friend.id)}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NavLink
        className="mt-4 block w-full rounded-full border border-violet-600 px-4 py-2 text-center text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
        to="/messages"
      >
        Open messages
      </NavLink>
    </aside>
  )
}