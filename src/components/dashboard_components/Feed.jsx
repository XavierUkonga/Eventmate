function formatPostDate(dateString) {
  if (!dateString) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function Feed({ posts }) {
  if (posts.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-8 text-center text-gray-500">
        No posts yet. Create the first post!
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
        >
          <div className="p-5">
            <div className="mb-4 flex items-center gap-3">
              {post.authorAvatarUrl ? (
                <img
                  className="h-11 w-11 rounded-full object-cover"
                  src={post.authorAvatarUrl}
                  alt=""
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                  {post.authorInitials || post.initials}
                </div>
              )}

              <div>
                <h2 className="font-semibold text-white">
                  {post.author}
                </h2>

                <p className="text-sm text-slate-400">
                  {post.createdAt
                    ? formatPostDate(post.createdAt)
                    : post.time}
                </p>
              </div>
            </div>

            {post.content && (
              <p className="whitespace-pre-wrap text-slate-100">
                {post.content}
              </p>
            )}
          </div>

          {post.imageUrl && (
            <img
              className="max-h-150 w-full object-cover"
              src={post.imageUrl}
              alt="Posted content"
            />
          )}

          <div className="flex gap-5 border-t px-5 py-3 text-sm text-slate-300">
            <button type="button">Like</button>
            <button type="button">Comment</button>
            <button type="button">Share</button>
          </div>
        </article>
      ))}
    </section>
  )
}