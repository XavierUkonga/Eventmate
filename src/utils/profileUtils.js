/*Used to generate initials to display on the default icon from user's full name */

export function getInitials(displayName = '') {
    const names = displayName.trim().split(/\s+/).filter(Boolean)

    if (names.length === 0) {
        return 'U'
    }

    const firstInitial = names[0][0]
    const lastInitial =
        names.length > 1 ? names[names.length - 1][0] : ''

    return `${firstInitial}${lastInitial}`.toUpperCase()
}

export function splitCommaList(value = '') {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}