const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get all stories with optional filters
export const getStories = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.tags && filters.tags.length > 0) {
      queryParams.append('tags', filters.tags.join(','));
    }
    
    if (filters.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page);
    }

    const url = `${API_URL}/stories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

// Get a single story by ID
export const getStoryById = async (storyId) => {
  try {
    const response = await fetch(`${API_URL}/stories/${storyId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch story');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

// Create a new story
export const createStory = async (storyData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(storyData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create story');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

// Update a story
export const updateStory = async (storyId, storyData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/stories/${storyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(storyData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update story');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

// Delete a story
export const deleteStory = async (storyId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/stories/${storyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete story');
    }

    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Like/unlike a story
export const toggleLike = async (storyId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/stories/${storyId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle like');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get all unique tags
export const getAllTags = async () => {
  try {
    const response = await fetch(`${API_URL}/stories/tags`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    const data = await response.json();
    return data.tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

// Get tag counts (number of stories per tag)
export const getTagCounts = async () => {
  try {
    const response = await fetch(`${API_URL}/stories/tags/counts`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tag counts');
    }
    const data = await response.json();
    return data.tagCounts;
  } catch (error) {
    console.error('Error fetching tag counts:', error);
    throw error;
  }
};

// Search stories, collections, authors, and tags
export const searchContent = async (searchParams = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (searchParams.query) {
      queryParams.append('query', searchParams.query);
    }
    
    if (searchParams.type) {
      queryParams.append('type', searchParams.type);
    }
    
    if (searchParams.limit) {
      queryParams.append('limit', searchParams.limit);
    }
    
    if (searchParams.page) {
      queryParams.append('page', searchParams.page);
    }
    
    if (searchParams.sortBy) {
      queryParams.append('sortBy', searchParams.sortBy);
    }

    const url = `${API_URL}/stories/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

// Get all collections for series selection
export const getCollections = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit);
    if (options.author) params.append('author', options.author);
    if (options.likedBy) params.append('likedBy', options.likedBy);
    const url = `${API_URL}/collections${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

// Create a new collection
export const createCollection = async (collectionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    const response = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(collectionData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create collection');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// Get a single collection by ID
export const getCollectionById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/collections/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch collection');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

// React to a story
export const reactToStory = async (storyId, emoji) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/stories/${storyId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ emoji })
  });
  if (!response.ok) {
    throw new Error('Failed to react to story');
  }
  return await response.json();
};

// Toggle bookmark for a story
export const toggleBookmark = async (storyId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/stories/${storyId}/bookmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle bookmark');
  }
  
  return await response.json();
};

// Get user's bookmarked stories
export const getBookmarkedStories = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/stories/bookmarks/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch bookmarked stories');
  }
  
  return await response.json();
};

// Check if a specific story is bookmarked
export const checkStoryBookmarked = async (storyId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/stories/bookmarks/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check bookmark status');
  }
  
  const data = await response.json();
  return data.stories.some(story => story.id === storyId || story._id === storyId);
};

// Book (Storybook Collection) API functions
export const getBooks = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit);
    if (options.author) params.append('author', options.author);
    
    const url = `${API_URL}/books${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const createBook = async (bookData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create book');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/books/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

export const likeBook = async (bookId, token) => {
  try {
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Making like request to:', `${API_URL}/books/${bookId}/like`);
    
    const response = await fetch(`${API_URL}/books/${bookId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error liking book:', error);
    throw error;
  }
}; 