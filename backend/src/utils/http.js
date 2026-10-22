export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export function sendError(res, status, message) {
  return res.status(status).json({ error: message })
}

export function publicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    bio: user.bio || '',
    location: user.location || '',
    interests: user.interests || [],
    photoURL: user.photoURL || '',
    eventPreferences: user.eventPreferences || [],
    ageRangePreference: user.ageRangePreference || '',
    distancePreference: Number.isFinite(user.distancePreference) 
    ? user.distancePreference : 15,
    createdAt: user.createdAt,
  }
}
