import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import Navigation from '../components/dashboard_components/Navigation'
import CreatePost from '../components/dashboard_components/createPost'
import Feed from '../components/dashboard_components/Feed'

import {
  createPost,
  getPosts,
} from '../services/postsService'

import {
  getCurrentProfile,
} from '../services/profileService'

import {
  getMatchedConnections,
  getSelectedEvents,
  removeEventInterest,
} from '../services/engagementService'

import {
  getEvents,
} from '../services/eventsService'

import {
  mockGroups,
} from '../data/mockGroups'

function SidebarCard({
  title,
  children,
  className = '',
}) {
  return (
    <section
      className={`glass-card hover-lift p-5 ${className}`}
    >
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </section>
  )
}

function formatEventDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function DashboardPage() {
  const [user] = useState(getCurrentProfile)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] =
    useState(true)

  const [
    selectedEvents,
    setSelectedEvents,
  ] = useState(getSelectedEvents)

  const [
    matchedConnections,
    setMatchedConnections,
  ] = useState(getMatchedConnections)

  const [localEvents, setLocalEvents] = useState([])

  const userCity =
    user.city ||
    user.location?.split(',')[0]?.trim() ||
    'Atlanta'

  useEffect(() => {
    function refreshEngagement() {
      setSelectedEvents(getSelectedEvents())

      setMatchedConnections(
        getMatchedConnections(),
      )
    }

    window.addEventListener(
      'eventmate-engagement-updated',
      refreshEngagement,
    )

    window.addEventListener(
      'storage',
      refreshEngagement,
    )

    return () => {
      window.removeEventListener(
        'eventmate-engagement-updated',
        refreshEngagement,
      )

      window.removeEventListener(
        'storage',
        refreshEngagement,
      )
    }
  }, [])

  useEffect(() => {
    let requestCancelled = false

    async function loadBackendPosts() {
      try {
        const postData = await getPosts()

        if (!requestCancelled) {
          setPosts(postData)
        }
      } catch (error) {
        console.error(
          'Unable to load posts:',
          error,
        )

        if (!requestCancelled) {
          setPosts([])
        }
      } finally {
        if (!requestCancelled) {
          setPostsLoading(false)
        }
      }
    }

    loadBackendPosts()

    return () => {
      requestCancelled = true
    }
  }, [])

  async function addPost(postDraft) {
    const newPost = await createPost(
      postDraft,
    )

    setPosts((currentPosts) => [
      newPost,
      ...currentPosts,
    ])

    return newPost
  }

  function handleRemoveInterest(eventId) {
    removeEventInterest(eventId)
    setSelectedEvents(getSelectedEvents())
  }

  function openChat(personId) {
    window.dispatchEvent(
      new CustomEvent('eventmate-open-chat', {
        detail: {
          personId,
        },
      }),
    )
  }

  return (
    <div className="app-shell">
      <Navigation />



      {/* This class keeps all dashboard content above the gallery. */}
      <main className="dashboard-content-layer mx-auto grid max-w-375 grid-cols-1 gap-6 px-4 py-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Left column */}
        <aside className="order-2 xl:order-1">
          <SidebarCard
            title="Connections & Groups"
            className="min-h-162.5 xl:sticky xl:top-20"
          >
            <section>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Matched connections
                </h3>

                <NavLink
                  className="text-sm font-semibold text-violet-600 dark:text-violet-300"
                  to="/connections"
                >
                  View all
                </NavLink>
              </div>

              {matchedConnections.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                  No matches yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {matchedConnections.map((person) => (
                    <li
                      key={person.id}
                      className="rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <NavLink
                          className="flex min-w-0 flex-1 items-center gap-3"
                          to={`/profile/${person.id}`}
                        >
                          {person.avatarUrl ? (
                            <img
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                              src={person.avatarUrl}
                              alt=""
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                              {person.initials}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {person.displayName}
                            </p>

                            <p className="text-xs text-green-600 dark:text-green-400">
                              Matched
                            </p>
                          </div>
                        </NavLink>

                        <button
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-violet-600 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-slate-700"
                          type="button"
                          aria-label={`Message ${person.displayName}`}
                          onClick={() =>
                            openChat(person.id)
                          }
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-7 border-t border-gray-200 pt-6 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Your groups
              </h3>

              <ul className="mt-3 space-y-3">
                {mockGroups.map((group) => (
                  <li
                    key={group.id}
                    className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {group.initials}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
                        {group.description}
                      </p>

                      <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">
                        {group.memberCount} members
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                className="mt-4 w-full rounded-full border border-violet-600 px-4 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 dark:border-violet-400 dark:text-violet-300 dark:hover:bg-slate-800"
                type="button"
                onClick={() => {
                  console.log('Discover groups')
                }}
              >
                Discover groups
              </button>
            </section>
          </SidebarCard>
        </aside>

        {/* Center column */}
        <div className="order-1 min-w-0 space-y-4 xl:order-2 fade-in">
          <CreatePost
            user={user}
            onPostSubmit={addPost}
          />

          {postsLoading ? (
            <section className="rounded-xl border bg-white p-8 text-center text-gray-500">
              Loading posts...
            </section>
          ) : (
            <Feed posts={posts} />
          )}        
          </div>

        {/* Right column */}
        <aside className="order-3 space-y-4">
          <SidebarCard title="Selected Events">
            {selectedEvents.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-slate-400">
                <p>No selected events yet.</p>

                <NavLink
                  className="mt-3 inline-block font-semibold text-violet-600 dark:text-violet-300"
                  to="/events"
                >
                  Browse events
                </NavLink>
              </div>
            ) : (
              <ul className="space-y-4">
                {selectedEvents.map((event) => (
                  <li
                    key={event.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 dark:border-slate-700"
                  >
                    <div className="flex gap-3">
                      <img
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        src={event.imageUrl}
                        alt=""
                      />

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          {formatEventDate(
                            event.startDate,
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400"
                      type="button"
                      onClick={() =>
                        handleRemoveInterest(event.id)
                      }
                    >
                      Remove interest
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SidebarCard>

          <SidebarCard title="EventMate News">
            {localEvents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">
                No local event updates available.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                {localEvents.map((event) => (
                  <li
                    key={event.id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <NavLink
                      className="block text-gray-900 hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
                      to="/events"
                    >
                      <p className="line-clamp-2 font-semibold">
                        {event.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {formatEventDate(
                          event.startDate,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                        {event.venue}
                      </p>

                      {event.status && (
                        <span className="mt-2 inline-block rounded bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          {event.status}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </SidebarCard>
        </aside>
      </main>
    </div>
  )
}