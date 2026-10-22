import {
  useEffect,
  useState,
} from 'react'
import {
  NavLink,
  useParams,
} from 'react-router-dom'
import Navigation from '../components/dashboard_components/Navigation'
import {
  getPersonById,
} from '../services/connectionsService'
import {
  getConnectionStatus,
  sendConnectionRequest,
} from '../services/engagementService'

export default function ProfilePage() {
  const { userId } = useParams()

  const [
    person,
    setPerson,
  ] = useState(null)

  const [
    connectionStatus,
    setConnectionStatus,
  ] = useState(() =>
    getConnectionStatus(userId),
  )

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let requestCancelled = false

    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        // BACKEND LATER:
        // Request the public profile using userId.
        const profileData =
          await getPersonById(userId)

        if (!requestCancelled) {
          if (profileData) {
            setPerson(profileData)

            setConnectionStatus(
              getConnectionStatus(
                userId,
              ),
            )
          } else {
            setError(
              'This profile could not be found.',
            )
          }
        }
      } catch {
        if (!requestCancelled) {
          setError(
            'Unable to load this profile.',
          )
        }
      } finally {
        if (!requestCancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      requestCancelled = true
    }
  }, [userId])

  function handleConnect() {
    if (!person) {
      return
    }

    const updatedStatus =
      sendConnectionRequest(
        person.id,
      )

    setConnectionStatus(
      updatedStatus,
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <p className="p-10 text-center text-gray-500">
          Loading profile...
        </p>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />

        <main className="mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-2xl font-bold">
            Profile not found
          </h1>

          <p className="mt-2 text-gray-500">
            {error}
          </p>

          <NavLink
            className="mt-5 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white"
            to="/connections"
          >
            Return to connections
          </NavLink>
        </main>
      </div>
    )
  }

  const connected =
    connectionStatus === 'matched'

  const pending =
    connectionStatus === 'pending'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
          <div className="h-44 bg-linear-to-r from-violet-600 to-indigo-500" />

          <div className="px-7 pb-8">
            {person.avatarUrl ? (
              <img
                className="-mt-16 h-32 w-32 rounded-full border-4 border-white object-cover"
                src={person.avatarUrl}
                alt={`${person.displayName}'s profile`}
              />
            ) : (
              <div className="-mt-16 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-violet-100 text-3xl font-bold text-violet-700">
                {person.initials}
              </div>
            )}

            <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {person.displayName}
                </h1>

                <p className="mt-1 text-gray-500">
                  {person.location}
                </p>

                {person.mutualCount >
                  0 && (
                  <p className="mt-1 text-sm text-violet-600">
                    {
                      person.mutualCount
                    }{' '}
                    mutual{' '}
                    {person.mutualCount ===
                    1
                      ? 'connection'
                      : 'connections'}
                  </p>
                )}
              </div>

              <button
                className={`rounded-full px-6 py-3 font-semibold ${
                  connected
                    ? 'bg-green-100 text-green-700'
                    : pending
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
                type="button"
                disabled={
                  connected ||
                  pending
                }
                onClick={
                  handleConnect
                }
              >
                {connected
                  ? 'Connected'
                  : pending
                    ? 'Request sent'
                    : 'Connect'}
              </button>
            </div>

            <section className="mt-8 border-t border-gray-300 pt-7">
              <h2 className="text-xl font-semibold">
                About
              </h2>

              <p className="mt-3 text-gray-700">
                {person.bio ||
                  'No bio available.'}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">
                Interests
              </h2>

              {person.interests
                ?.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.interests.map(
                    (interest) => (
                      <span
                        key={
                          interest
                        }
                        className="rounded-full bg-violet-50 px-4 py-2 text-sm text-violet-700"
                      >
                        {interest}
                      </span>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  No interests
                  available.
                </p>
              )}
            </section>

            <section className="mt-8 rounded-xl bg-gray-50 p-5">
              <h2 className="font-semibold">
                Connection information
              </h2>

              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">
                    Distance
                  </dt>

                  <dd className="mt-1 font-semibold">
                    {
                      person.distanceMiles
                    }{' '}
                    miles away
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-gray-500">
                    Interested event
                  </dt>

                  <dd className="mt-1 font-semibold">
                    {person.attendingEventIds.includes(
                      'atl-tech-meetup',
                    )
                      ? 'Atlanta Technology Meetup'
                      : 'Community Music Festival'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}