import { useEffect, useMemo, useState } from 'react'
import { getEvents } from '../../services/eventsService'

const TILE_COUNT = 10
const ROTATION_TIME = 7000

export default function EventBackdropGallery({
  city = '',
}) {
  const [events, setEvents] = useState([])
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let requestCancelled = false

    async function loadEventImages() {
      try {
        const eventData = await getEvents(
          city ? { city } : {},
        )

        const eventsWithImages = eventData.filter(
          (event) => event.imageUrl,
        )

        if (!requestCancelled) {
          setEvents(eventsWithImages)
        }
      } catch (error) {
        console.error(
          'Unable to load dashboard event images:',
          error,
        )
      }
    }

    loadEventImages()

    return () => {
      requestCancelled = true
    }
  }, [city])

  useEffect(() => {
    if (events.length < 2) {
      return undefined
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setFrame((currentFrame) => currentFrame + 1)
    }, ROTATION_TIME)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [events.length])

  const tiles = useMemo(() => {
    if (events.length === 0) {
      return []
    }

    return Array.from(
      { length: TILE_COUNT },
      (_, index) => {
        return events[(index + frame) % events.length]
      },
    )
  }, [events, frame])

  if (tiles.length === 0) {
    return (
      <div
        className="event-backdrop-gallery event-backdrop-fallback"
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className="event-backdrop-gallery"
      aria-hidden="true"
    >
      <div className="event-backdrop-grid">
        {tiles.map((event, index) => (
          <div
            className="event-backdrop-tile"
            key={`${frame}-${event.id}-${index}`}
          >
            <img
              src={event.imageUrl}
              alt=""
              draggable="false"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="event-backdrop-scrim" />
    </div>
  )
}