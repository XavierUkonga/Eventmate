import { apiRequest } from './apiClient'

const PROFILE_STORAGE_KEY = 'eventmateUser'

export const CURRENT_USER_ID = 'current-user'

export const defaultProfile = {
  id: CURRENT_USER_ID,
  displayName: 'EventMate User',
  email: '',
  avatarUrl: '',
  bio: '',
  city: '',
  interests: '',
  eventTypes: '',
  ageRange: '',
  distanceMiles: 15,
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value || ''
}

function listToArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeDistance(value) {
  const distance = Number(value)

  if (
    Number.isFinite(distance) &&
    distance >= 1 &&
    distance <= 100
  ) {
    return distance
  }

  return defaultProfile.distanceMiles
}

function normalizeProfile(
  user,
  localProfile = {},
) {
  return {
    ...defaultProfile,
    ...localProfile,

    id:
      user?.id ||
      localProfile.id ||
      CURRENT_USER_ID,

    displayName:
      user?.displayName ||
      localProfile.displayName ||
      defaultProfile.displayName,

    email:
      user?.email ||
      localProfile.email ||
      '',

    avatarUrl:
      user?.photoURL ??
      user?.avatarUrl ??
      localProfile.avatarUrl ??
      '',

    bio:
      user?.bio ??
      localProfile.bio ??
      '',

    city:
      user?.location ??
      user?.city ??
      localProfile.city ??
      localProfile.location ??
      '',

    interests: normalizeList(
      user?.interests ??
        localProfile.interests,
    ),

    eventTypes: normalizeList(
      user?.eventPreferences ??
        localProfile.eventTypes ??
        localProfile.eventPreferences,
    ),

    ageRange:
      user?.ageRangePreference ??
      localProfile.ageRange ??
      localProfile.ageRangePreference ??
      '',

    distanceMiles: normalizeDistance(
      user?.distancePreference ??
        localProfile.distanceMiles ??
        localProfile.distancePreference,
    ),
  }
}

function cacheProfile(profile) {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile),
  )

  window.dispatchEvent(
    new Event('eventmate-profile-updated'),
  )
}

export function getCurrentProfile() {
  try {
    const storedProfile = JSON.parse(
      localStorage.getItem(
        PROFILE_STORAGE_KEY,
      ) || 'null',
    )

    if (!storedProfile) {
      return defaultProfile
    }

    return normalizeProfile(
      storedProfile,
      storedProfile,
    )
  } catch {
    return defaultProfile
  }
}

export function getCurrentUserId() {
  return getCurrentProfile().id
}

export async function fetchCurrentProfile() {
  const cachedProfile = getCurrentProfile()

  const data = await apiRequest('/profile/me')

  const updatedProfile = normalizeProfile(
    data.user,
    cachedProfile,
  )

  cacheProfile(updatedProfile)

  return updatedProfile
}

export async function saveCurrentProfile(
  profile,
) {
  const data = await apiRequest('/profile/me', {
    method: 'PUT',
    body: JSON.stringify({
      displayName: profile.displayName,
      bio: profile.bio,
      location: profile.city,

      interests: listToArray(
        profile.interests,
      ),

      photoURL: profile.avatarUrl || '',

      eventPreferences: listToArray(
        profile.eventTypes,
      ),

      ageRangePreference:
        profile.ageRange || '',

      distancePreference:
        normalizeDistance(
          profile.distanceMiles,
        ),
    }),
  })

  const updatedProfile = normalizeProfile(
    data.user,
    profile,
  )

  cacheProfile(updatedProfile)

  return updatedProfile
}