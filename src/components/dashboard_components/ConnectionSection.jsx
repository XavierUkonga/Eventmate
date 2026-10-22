import ConnectionCard from './ConnectionCard'

export default function ConnectionSection({
  title,
  description,
  people,
  getReason,
  selectedEventId,
  getConnectionStatus,
  updatingPersonIds,
  onConnect,
  onCancel,
  onAccept,
}) {
  if (people.length === 0) {
    return null
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <ConnectionCard
            key={person.id}
            person={person}
            reason={getReason(person)}
            selectedEventId={selectedEventId}
            connectionStatus={
              getConnectionStatus(person.id)
            }
            updating={updatingPersonIds.includes(
              person.id,
            )}
            onConnect={onConnect}
            onCancel={onCancel}
            onAccept={onAccept}
          />
        ))}
      </div>
    </section>
  )
}