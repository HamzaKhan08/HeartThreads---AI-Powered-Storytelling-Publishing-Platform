const API_URL = 'http://localhost:3000/api/social';

export async function followUser(userId, token) {
  const res = await fetch(`${API_URL}/follow/${userId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function likeStory(storyId, token) {
  const res = await fetch(`${API_URL}/stories/${storyId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function likeCollection(collectionId, token) {
  const res = await fetch(`${API_URL}/collections/${collectionId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function addComment(storyId, content, token, parentCommentId = null) {
  const requestBody = { content, parentCommentId };
  
  const res = await fetch(`http://localhost:3000/api/stories/${storyId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Failed to add comment');
  }
  
  return data;
}

export async function getComments(storyId) {
  const res = await fetch(`http://localhost:3000/api/stories/${storyId}/comments`);
  return res.json();
}

export async function deleteComment(storyId, commentId, token, replyId = null) {
  const url = replyId 
    ? `http://localhost:3000/api/stories/${storyId}/comments/${commentId}/replies/${replyId}`
    : `http://localhost:3000/api/stories/${storyId}/comments/${commentId}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function updateComment(storyId, commentId, content, token, replyId = null) {
  const url = replyId 
    ? `http://localhost:3000/api/stories/${storyId}/comments/${commentId}/replies/${replyId}`
    : `http://localhost:3000/api/stories/${storyId}/comments/${commentId}`;
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  return res.json();
}

export async function toggleCommentLike(storyId, commentId, token, replyId = null) {
  const url = replyId 
    ? `http://localhost:3000/api/stories/${storyId}/comments/${commentId}/replies/${replyId}/like`
    : `http://localhost:3000/api/stories/${storyId}/comments/${commentId}/like`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getFollowers(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/followers`);
  return res.json();
}

export async function getFollowing(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/following`);
  return res.json();
}

export async function sendFollowRequest(userId, token) {
  const res = await fetch(`${API_URL}/follow-request/${userId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getPendingFollowRequests(token) {
  const res = await fetch(`${API_URL}/pending-follow-requests`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function approveFollowRequest(requesterId, token) {
  const res = await fetch(`${API_URL}/approve-follow-request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requesterId })
  });
  return res.json();
}

export async function rejectFollowRequest(requesterId, token) {
  const res = await fetch(`${API_URL}/reject-follow-request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requesterId })
  });
  return res.json();
}

export async function getNotifications(token) {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function markNotificationsRead(token) {
  const res = await fetch(`${API_URL}/notifications/mark-read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
} 

export const getAuthorProfile = async (authorId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/users/author/${authorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch author profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching author profile:', error);
    throw error;
  }
}; 