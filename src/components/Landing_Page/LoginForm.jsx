import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { login } from '../../services/authService'

function LoginForm() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] =
    useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Enter your email and password.')
      return
    }

    try {
      setSubmitting(true)

      await login(
        formData.email,
        formData.password,
      )

      navigate('/dashboard', {
        replace: true,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-card">
      <div className="mobile-brand">
        <span className="brand-mark" />
      </div>

      <h2>Log in to EventMate</h2>

      <form onSubmit={handleSubmit}>
        <label
          className="sr-only"
          htmlFor="email"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={submitting}
          required
        />

        <label
          className="sr-only"
          htmlFor="password"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          disabled={submitting}
          required
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="login-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <Link
        className="forgot-link"
        to="/forgot-password"
      >
        Forgot password?
      </Link>

      <div className="divider" />

      <Link
        className="create-account-button"
        to="/signup"
      >
        Create new account
      </Link>
    </div>
  )
}

export default LoginForm