const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function signup(data) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function getStories() {
  const res = await fetch(`${API_URL}/stories`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function createStory(data) {
  const res = await fetch(`${API_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createCollection(data) {
  const res = await fetch(`${API_URL}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createBook(data) {
  const res = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// AI Story Generation APIs (Ollama only)
export async function getAIStatus() {
  const res = await fetch(`${API_URL}/ai/status`);
  return res.json();
}

// Generate prompts with real-time progress tracking
export async function generatePrompts(data, onProgress = null) {
  // Check if progress tracking is requested
  if (onProgress && typeof onProgress === 'function') {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${API_URL}/ai/prompts`, {
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'progress') {
            onProgress(data);
          } else if (data.type === 'complete') {
            eventSource.close();
            resolve(data);
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        } catch (error) {
          eventSource.close();
          reject(error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        reject(error);
      };

      // Send the request data via POST
      fetch(`${API_URL}/ai/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(data)
      }).catch(reject);
    });
  }

  // Fallback to regular request
  const res = await fetch(`${API_URL}/ai/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Generate story with real-time progress tracking
export async function generateStory(data, onProgress = null) {
  // Check if progress tracking is requested
  if (onProgress && typeof onProgress === 'function') {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${API_URL}/ai/story`, {
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'progress') {
            onProgress(data);
          } else if (data.type === 'complete') {
            eventSource.close();
            resolve(data);
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        } catch (error) {
          eventSource.close();
          reject(error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        reject(error);
      };

      // Send the request data via POST
      fetch(`${API_URL}/ai/story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(data)
      }).catch(reject);
    });
  }

  // Fallback to regular request
  const res = await fetch(`${API_URL}/ai/story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}