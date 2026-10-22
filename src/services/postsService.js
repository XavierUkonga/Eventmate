import { apiRequest } from './apiClient'
import {
  getCurrentProfile,
} from './profileService'

function adaptPost(post) {
  const currentProfile = getCurrentProfile()

  return {
    id: post.id,
    authorId: post.authorId,
    author: post.author,
    authorInitials:
      post.authorInitials ||
      post.initials ||
      'U',
    authorAvatarUrl:
      post.authorId === currentProfile.id
        ? currentProfile.avatarUrl
        : '',
    content: post.content || '',
    imageUrl: post.imageUrl || '',
    createdAt: post.createdAt,
  }
}

export async function getPosts() {
  const data = await apiRequest('/posts')

  return data.posts.map(adaptPost)
}

export async function getPostsByUser(userId) {
  const posts = await getPosts()

  return posts.filter(
    (post) => post.authorId === userId,
  )
}

export async function createPost({
  content,
}) {
  const data = await apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify({
      content,
    }),
  })

  const newPost = adaptPost(data.post)

  window.dispatchEvent(
    new Event('eventmate-posts-updated'),
  )

  return newPost
}