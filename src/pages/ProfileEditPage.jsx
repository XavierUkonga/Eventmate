import {
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'
import Navigation from '../components/dashboard_components/Navigation'
import {
  fetchCurrentProfile,
  getCurrentProfile,
  saveCurrentProfile,
} from '../services/profileService'
import {
  getInitials,
} from '../utils/profileUtils'

export default function ProfileEditPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(
    getCurrentProfile,
  )

  const [error, setError] = useState('')
  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const profile =
          await fetchCurrentProfile()

        if (!cancelled) {
          setForm(profile)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image.',
      )
      return
    }

    if (file.size > 1_000_000) {
      setError(
        'Please select an image smaller than 1 MB.',
      )
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        avatarUrl: reader.result,
      }))
    }

    reader.readAsDataURL(file)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setSaving(true)

      await saveCurrentProfile(form)

      navigate('/profile/me')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto max-w-2xl p-4 py-8">
        <section className="rounded-xl border bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold">
            Edit profile
          </h1>

          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center gap-5">
              {form.avatarUrl ? (
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={form.avatarUrl}
                  alt="Profile preview"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
                  {getInitials(
                    form.displayName,
                  )}
                </div>
              )}

              <div>
                <label className="inline-block cursor-pointer rounded-full border border-violet-600 px-4 py-2 font-semibold text-violet-600">
                  Upload photo

                  <input
                    className="hidden"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    disabled={saving}
                  />
                </label>

                {form.avatarUrl && (
                  <button
                    className="ml-3 text-sm text-red-600"
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        avatarUrl: '',
                      }))
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block font-medium">
                Display name
              </span>

              <input
                className="w-full rounded-lg border p-3"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                disabled={saving}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Email address
              </span>

              <input
                className="w-full cursor-not-allowed rounded-lg border bg-gray-100 p-3 text-gray-500"
                name="email"
                type="email"
                value={form.email}
                disabled
              />

              <span className="mt-1 block text-xs text-gray-500">
                Email changes are not currently
                supported by the backend.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Short bio
              </span>

              <textarea
                className="min-h-28 w-full rounded-lg border p-3"
                name="bio"
                maxLength={250}
                value={form.bio}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                City
              </span>

              <input
                className="w-full rounded-lg border p-3"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Interests
              </span>

              <input
                className="w-full rounded-lg border p-3"
                name="interests"
                placeholder="Technology, music, hiking"
                value={form.interests}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Preferred event types
              </span>

              <input
                className="w-full rounded-lg border p-3"
                name="eventTypes"
                placeholder="Concerts, workshops, sports"
                value={form.eventTypes}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Preferred age range
              </span>

              <select
                className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white"
                name="ageRange"
                value={form.ageRange}
                onChange={handleChange}
              >
                <option
                  className="bg-white text-slate-900"
                  value="18–25"
                >
                  18–25
                </option>

                <option
                  className="bg-white text-slate-900"
                  value="18–35"
                >
                  18–35
                </option>

                <option
                  className="bg-white text-slate-900"
                  value="25–40"
                >
                  25–40
                </option>

                <option
                  className="bg-white text-slate-900"
                  value="35–50"
                >
                  35–50
                </option>

                <option
                  className="bg-white text-slate-900"
                  value="All ages"
                >
                  All ages
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">
                Event distance:{' '}
                {form.distanceMiles} miles
              </span>

              <input
                className="w-full accent-violet-600"
                name="distanceMiles"
                type="range"
                min="1"
                max="50"
                value={form.distanceMiles}
                onChange={handleChange}
                disabled={saving}
              />
            </label>

            <p className="text-xs text-gray-500">
            </p>

            {error && (
              <p
                className="text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                className="rounded-full bg-violet-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save changes'}
              </button>

              <button
                className="rounded-full border px-6 py-3"
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate('/profile/me')
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}