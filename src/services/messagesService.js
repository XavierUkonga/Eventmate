import { apiRequest } from './apiClient'
import {
  getMatches,
} from './connectionsService'

function adaptMessage(message) {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text:
      message.text ||
      message.content ||
      '',
    createdAt:
      message.createdAt ||
      message.timestamp,
  }
}

export async function getFriends() {
  const matches = await getMatches()

  return matches
    .filter(
      (match) =>
        match.status === 'accepted',
    )
    .map((match) => match.person)
}

export async function getMessages(friendId) {
  const data = await apiRequest(
    `/messages/${friendId}`,
  )

  return data.messages.map(adaptMessage)
}

export async function sendMessage(
  friendId,
  messageText,
) {
  const data = await apiRequest(
    `/messages/${friendId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        content: messageText,
      }),
    },
  )

  return adaptMessage(data.message)
}