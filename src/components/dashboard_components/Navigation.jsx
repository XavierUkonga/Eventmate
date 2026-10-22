import {
  useEffect,
  useState,
} from 'react'
import {
  NavLink,
  useNavigate,
} from 'react-router-dom'
import {
  logout,
} from '../../services/authService'
import {
  fetchCurrentProfile,
  getCurrentProfile,
} from '../../services/profileService'
import {
  getInitials,
} from '../../utils/profileUtils'
import ChatBox from './chatBox'

export default function Navigation() {
  const navigate = useNavigate()

  const [user, setUser] = useState(
    getCurrentProfile,
  )

  const [signingOut, setSigningOut] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    function refreshUser() {
      setUser(getCurrentProfile())
    }

    async function loadBackendProfile() {
      try {
        const profile =
          await fetchCurrentProfile()

        if (!cancelled) {
          setUser(profile)
        }
      } catch (error) {
        if (
          !cancelled &&
          error.message.includes('token')
        ) {
          await logout()
          navigate('/', {
            replace: true,
          })
        }
      }
    }

    window.addEventListener(
      'eventmate-profile-updated',
      refreshUser,
    )

    window.addEventListener(
      'storage',
      refreshUser,
    )

    loadBackendProfile()

    return () => {
      cancelled = true

      window.removeEventListener(
        'eventmate-profile-updated',
        refreshUser,
      )

      window.removeEventListener(
        'storage',
        refreshUser,
      )
    }
  }, [navigate])

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await logout()
    } finally {
      navigate('/', {
        replace: true,
      })
    }
  }

  return (
    <>
      <header className="app-header sticky top-0 z-40">
        <nav className="mx-auto flex h-16 max-w-375 items-center justify-between px-4">
          <NavLink
            className="group flex items-center gap-2 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
            to="/dashboard"
            aria-label="Go to the EventMate dashboard"
          >
            <img
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
              src="/generated_logo.png"
              alt=""
            />

            <span className="hidden text-xl font-bold text-violet-300 sm:inline">
              EventMate
            </span>
          </NavLink>

          <div className="flex items-center gap-2 sm:gap-5">
            <NavLink
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? 'text-violet-600'
                    : ''
                }`
              }
              to="/dashboard"
            >
              Home
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? 'text-violet-600'
                    : ''
                }`
              }
              to="/events"
            >
              Events
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? 'text-violet-600'
                    : ''
                }`
              }
              to="/connections"
            >
              Connections
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `nav-link ${
                  isActive
                    ? 'text-violet-600'
                    : ''
                }`
              }
              to="/messages"
            >
              Messages
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 font-semibold text-violet-700 ring-offset-2 transition hover:ring-2 hover:ring-violet-400 ${
                  isActive
                    ? 'ring-2 ring-violet-600'
                    : ''
                }`
              }
              to="/profile/me"
              aria-label="View your profile"
            >
              {user.avatarUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={user.avatarUrl}
                  alt=""
                />
              ) : (
                getInitials(user.displayName)
              )}
            </NavLink>

            <button
              className="nav-link disabled:opacity-50"
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              {signingOut
                ? 'Signing out...'
                : 'Sign out'}
            </button>
          </div>
        </nav>
      </header>

      <ChatBox />
    </>
  )
}