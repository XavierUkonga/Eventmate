const firstNames = [
  'Maya',
  'Jordan',
  'Taylor',
  'Cameron',
  'Morgan',
  'Avery',
  'Riley',
  'Casey',
  'Drew',
  'Skyler',
]

const lastNames = [
  'Johnson',
  'Williams',
  'Brown',
  'Davis',
  'Wilson',
  'Anderson',
]

const interests = [
  ['Technology', 'Gaming'],
  ['Music', 'Photography'],
  ['Fitness', 'Travel'],
  ['Art', 'Food'],
  ['Sports', 'Movies'],
]

export const mockPeople = Array.from({ length: 60 }, (_, index) => ({
  id: `person-${index + 1}`,
  displayName: `${firstNames[index % firstNames.length]} ${
    lastNames[index % lastNames.length]
  }`,
  initials: `${firstNames[index % firstNames.length][0]}${
    lastNames[index % lastNames.length][0]
  }`,
  avatarUrl: `https://i.pravatar.cc/200?img=${(index % 60) + 1}`,
  bio: 'Interested in meeting new people and discovering local events.',
  location: 'Atlanta, GA',
  interests: interests[index % interests.length],
  distanceMiles: (index % 30) + 1,
  mutualCount: index % 5 === 0 ? 0 : (index % 9) + 1,
  attendingEventIds:
    index % 3 === 0 ? ['atl-tech-meetup'] : ['music-festival'],
}))