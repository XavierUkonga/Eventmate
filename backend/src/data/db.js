import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../../data/db.json')

const seedEvents = [
  {
    id: 'event-1',
    title: 'Atlanta Technology Meetup',
    description: 'Meet local developers and technology professionals.',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-08-01T12:00:00-04:00',
    venue: 'Atlanta Convention Center',
    address: '123 Peachtree Street',
    city: 'Atlanta',
    state: 'GA',
    category: 'Technology',
    priceCents: 0,
    status: 'Going fast',
  },
  {
    id: 'event-2',
    title: 'Community Music Festival',
    description: 'An outdoor festival featuring local musicians.',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-08-02T17:00:00-04:00',
    venue: 'Piedmont Park',
    address: '1320 Monroe Drive',
    city: 'Atlanta',
    state: 'GA',
    category: 'Music',
    priceCents: 2500,
    status: 'Almost full',
  },
  {
    id: 'event-3',
    title: 'Local Art Workshop',
    description: 'Learn painting techniques from local artists.',
    imageUrl:
      'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-08-03T10:30:00-04:00',
    venue: 'Midtown Arts Center',
    address: '75 Fifth Street',
    city: 'Atlanta',
    state: 'GA',
    category: 'Art',
    priceCents: 1800,
    status: '',
  },
  {
    id: 'event-4',
    title: 'Young Professionals Networking Night',
    description: 'Connect with professionals from across Atlanta.',
    imageUrl:
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&q=80',
    startDate: '2026-08-05T18:30:00-04:00',
    venue: 'The Gathering Spot',
    address: '384 Northyards Boulevard',
    city: 'Atlanta',
    state: 'GA',
    category: 'Networking',
    priceCents: 1500,
    status: 'Sales end soon',
  },
]

const initialDb = {
  users: [],
  events: seedEvents,
  attendance: [],
  matches: [],
  messages: [],
  posts: [
    {
      id: 'post-1',
      authorId: 'system',
      author: 'EventMate Team',
      initials: 'EM',
      content:
        'Welcome to EventMate! Find events, meet people with similar interests, and share what you are attending.',
      createdAt: new Date().toISOString(),
    },
  ],
}

export async function readDb() {
  try {
    return JSON.parse(await readFile(dbPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    await writeDb(initialDb)
    return structuredClone(initialDb)
  }
}

export async function writeDb(db) {
  await mkdir(dirname(dbPath), { recursive: true })
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`)
}

export async function updateDb(updater) {
  const db = await readDb()
  const result = await updater(db)
  await writeDb(db)
  return result
}
