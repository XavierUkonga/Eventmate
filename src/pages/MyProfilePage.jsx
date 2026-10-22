import {
  useEffect,
  useState,
} from 'react'
import {
  NavLink,
} from 'react-router-dom'
import Navigation from '../components/dashboard_components/Navigation'
import {
  getCurrentProfile,
  getCurrentUserId,
} from '../services/profileService'
import {
  getPostsByUser,
} from '../services/postsService'
import {
  getInitials,
  splitCommaList,
} from '../utils/profileUtils'

function formatPostDate(dateString) {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(date)
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState(
    getCurrentProfile,
  )

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] =
    useState(true)

  const [postsError, setPostsError] =
    useState('')

  useEffect(() => {
    let requestCancelled = false

    function refreshProfile() {
      setProfile(getCurrentProfile())
    }

    async function refreshPosts() {
      try {
        setPostsError('')

        const userPosts =
          await getPostsByUser(
            getCurrentUserId(),
          )

        if (!requestCancelled) {
          setPosts(userPosts)
        }
      } catch (error) {
        if (!requestCancelled) {
          setPosts([])
          setPostsError(error.message)
        }
      } finally {
        if (!requestCancelled) {
          setPostsLoading(false)
        }
      }
    }

    function handleStorageChange() {
      refreshProfile()
      refreshPosts()
    }

    window.addEventListener(
      'eventmate-profile-updated',
      refreshProfile,
    )

    window.addEventListener(
      'eventmate-posts-updated',
      refreshPosts,
    )

    window.addEventListener(
      'storage',
      handleStorageChange,
    )

    refreshPosts()

    return () => {
      requestCancelled = true

      window.removeEventListener(
        'eventmate-profile-updated',
        refreshProfile,
      )

      window.removeEventListener(
        'eventmate-posts-updated',
        refreshPosts,
      )

      window.removeEventListener(
        'storage',
        handleStorageChange,
      )
    }
  }, [])

  const interests = splitCommaList(
    profile.interests,
  )

  const eventTypes = splitCommaList(
    profile.eventTypes,
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
          <div className="h-44 bg-linear-to-r from-violet-600 to-indigo-500" />

          <div className="px-7 pb-8">
            {profile.avatarUrl ? (
              <img
                className="-mt-16 h-32 w-32 rounded-full border-4 border-white object-cover"
                src={profile.avatarUrl}
                alt={`${profile.displayName}'s profile`}
              />
            ) : (
              <div className="-mt-16 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-violet-100 text-3xl font-bold text-violet-700">
                {getInitials(
                  profile.displayName,
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.displayName ||
                    'EventMate User'}
                </h1>

                <p className="mt-1 text-gray-500">
                  {profile.city ||
                    'City not added'}
                </p>
              </div>

              <NavLink
                className="flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
                to="/profile/edit"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />

                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>

                Edit profile
              </NavLink>
            </div>

            <section className="mt-8 border-t border-gray-300 pt-7">
              <h2 className="text-xl font-semibold text-gray-900">
                About
              </h2>

              <p className="mt-3 leading-relaxed text-white">
                {profile.bio ||
                  'No bio added yet.'}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Interests
              </h2>

              {interests.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map(
                    (interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
                      >
                        {interest}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  No interests added yet.
                </p>
              )}
            </section>

            <section className="mt-8 rounded-xl bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Event preferences
              </h2>

              <dl className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-gray-500">
                    Distance
                  </dt>

                  <dd className="mt-1 font-semibold text-gray-900">
                    Within{' '}
                    {profile.distanceMiles ||
                      25}{' '}
                    miles
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-gray-500">
                    Event types
                  </dt>

                  <dd className="mt-1 font-semibold text-gray-900">
                    {eventTypes.length > 0
                      ? eventTypes.join(', ')
                      : 'Not selected'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-gray-500">
                    Preferred age range
                  </dt>

                  <dd className="mt-1 font-semibold text-gray-900">
                    {profile.ageRange ||
                      'All ages'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your posts
              </h2>

              <p className="mt-1 text-gray-500">
                {posts.length}{' '}
                {posts.length === 1
                  ? 'post'
                  : 'posts'}
              </p>
            </div>

            <NavLink
              className="shrink-0 font-semibold text-violet-600 hover:text-violet-700"
              to="/dashboard"
            >
              Create a post
            </NavLink>
          </div>

          {postsLoading ? (
            <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading posts...
            </div>
          ) : postsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {postsError}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900">
                No posts yet
              </h3>

              <p className="mt-2 text-gray-500">
                Posts you create will appear here.
              </p>

              <NavLink
                className="mt-5 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
                to="/dashboard"
              >
                Create your first post
              </NavLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  {post.imageUrl ? (
                    <img
                      className="aspect-square w-full object-cover"
                      src={post.imageUrl}
                      alt="User post"
                    />
                  ) : (
                    <div className="flex aspect-square items-center bg-linear-to-br from-violet-50 to-indigo-50 p-6">
                      <p className="line-clamp-6 text-lg text-gray-700">
                        {post.content}
                      </p>
                    </div>
                  )}

                  <div className="p-4">
                    {post.imageUrl &&
                      post.content && (
                        <p className="line-clamp-3 text-gray-700">
                          {post.content}
                        </p>
                      )}

                    <p className="mt-2 text-sm text-gray-500">
                      {formatPostDate(
                        post.createdAt,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}