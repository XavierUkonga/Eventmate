export default function ConversationList({
  friends,
  selectedFriendId,
  search,
  onSearchChange,
  onFriendSelect,
}) {
  const filteredFriends = friends.filter((friend) =>
    friend.displayName
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )

  return (
    <aside className="flex min-h-0 flex-col border-r bg-white">
      <div className="border-b p-4">
        <h1 className="text-xl font-bold text-gray-900">
          Messaging
        </h1>

        <label className="mt-3 block">
          <span className="sr-only">Search friends</span>

          <input
            className="w-full rounded-lg bg-gray-100 px-4 py-2 outline-none focus:ring-2 focus:ring-violet-200"
            type="search"
            placeholder="Search messages"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredFriends.map((friend) => {
          const selected = friend.id === selectedFriendId

          return (
            <button
              key={friend.id}
              className={`flex w-full items-center gap-3 border-b p-4 text-left transition ${
                selected
                  ? 'border-l-4 border-l-violet-600 bg-violet-50'
                  : 'hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => onFriendSelect(friend)}
            >
              <div className="relative shrink-0">
                {friend.avatarUrl ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={friend.avatarUrl}
                    alt=""
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {friend.initials}
                  </div>
                )}

                <span
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
                  aria-label="Online"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {friend.displayName}
                </p>

                <p className="truncate text-sm text-gray-500">
                  Click to start a conversation
                </p>
              </div>
            </button>
          )
        })}

        {filteredFriends.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No friends match your search.
          </p>
        )}
      </div>
    </aside>
  )
}