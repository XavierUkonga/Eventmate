import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Enter the email associated with your account.')
      return
    }

    setStatus('loading')
    setError('')

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700)
      })

      setSubmittedEmail(normalizedEmail)
      setStatus('success')
    } catch (requestError) {
      console.error('Password reset failed:', requestError)

      setError(
        'We could not process your request. Please try again.',
      )
      setStatus('error')
    }
  }

  function handleTryAnotherEmail() {
    setEmail('')
    setSubmittedEmail('')
    setError('')
    setStatus('idle')
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">

      <video
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source
          src="/stock-video-landing.mp4"
          type="video/mp4"
        />
      </video>


      <div
        className="absolute inset-0 -z-20 bg-slate-950/45"
        aria-hidden="true"
      />

      <section className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-900/80 p-7 text-white shadow-2xl backdrop-blur-xl sm:p-10">
        {status === 'success' ? (
          <div aria-live="polite">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20 text-2xl text-violet-200">
              ✓
            </div>

            <h1 className="text-3xl font-bold">
              Check your email
            </h1>

            <p className="mt-4 leading-7 text-slate-200">
              If an EventMate account is associated with{' '}
              <strong className="text-white">
                {submittedEmail}
              </strong>
              , password-reset instructions will be sent to that
              address.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Remember to check your spam or junk folder.
            </p>

            <button
              className="mt-7 w-full rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
              type="button"
              onClick={handleTryAnotherEmail}
            >
              Try another email
            </button>

            <Link
              className="mt-4 block text-center font-semibold text-violet-200 hover:text-white"
              to="/"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">
              Forgot your password?
            </h1>

            <p className="mt-3 leading-7 text-slate-200">
              Enter the email associated with your EventMate
              account and we’ll send password-reset instructions.
            </p>

            <form
              className="mt-7"
              onSubmit={handleSubmit}
              noValidate
            >
              <label
                className="mb-2 block font-semibold"
                htmlFor="reset-email"
              >
                Email address
              </label>

              <input
                className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/25"
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)

                  if (error) {
                    setError('')
                  }
                }}
                autoComplete="email"
                autoFocus
                required
              />

              {error && (
                <p
                  className="mt-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? 'Sending...'
                  : 'Send reset instructions'}
              </button>
            </form>

            <Link
              className="mt-6 block text-center font-semibold text-violet-200 hover:text-white"
              to="/"
            >
              Return to login
            </Link>
          </>
        )}
      </section>
    </main>
  )
}