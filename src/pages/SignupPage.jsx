import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { register } from '../services/authService'

export default function SignupPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] =
    useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (
      form.password !== form.confirmPassword
    ) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSubmitting(true)

      await register(
        form.displayName,
        form.email,
        form.password,
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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <section className="w-full max-w-md rounded-xl border bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold">
          Create an account
        </h1>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full rounded-lg border p-3"
            name="displayName"
            placeholder="Full name"
            value={form.displayName}
            onChange={handleChange}
            disabled={submitting}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            disabled={submitting}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={6}
            disabled={submitting}
            required
          />

          {error && (
            <p
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="w-full rounded-full bg-violet-600 p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Creating account...'
              : 'Create account'}
          </button>
        </form>

        <Link
          className="mt-5 block text-center text-violet-600"
          to="/"
        >
          Already have an account?
        </Link>
      </section>
    </main>
  )
}