import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import LandingPage from './components/Landing_Page/Video Background'
import ProtectedRoute from './components/ProtectedRoute'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import ConnectionsPage from './pages/ConnectionsPage'
import MessagesPage from './pages/MessagesPage'
import MyProfilePage from './pages/MyProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import ProfilePage from './pages/ProfilePage'

function protect(page) {
  return (
    <ProtectedRoute>
      {page}
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/dashboard"
        element={protect(<DashboardPage />)}
      />

      <Route
        path="/events"
        element={protect(<EventsPage />)}
      />

      <Route
        path="/events/:eventId"
        element={protect(
          <EventDetailsPage />,
        )}
      />

      <Route
        path="/connections"
        element={protect(
          <ConnectionsPage />,
        )}
      />

      <Route
        path="/messages"
        element={protect(<MessagesPage />)}
      />

      <Route
        path="/profile/me"
        element={protect(<MyProfilePage />)}
      />

      <Route
        path="/profile/edit"
        element={protect(
          <ProfileEditPage />,
        )}
      />

      <Route
        path="/profile/:userId"
        element={protect(<ProfilePage />)}
      />

      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />
    </Routes>
  )
}

export default App