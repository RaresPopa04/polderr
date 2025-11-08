/**
 * API client for connecting to Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Topics API
 */
export const topicsApi = {
  listTopics: () => fetchApi<{ topics: any[] }>('/api/topics'),
  getTopic: (topicId: string) => fetchApi<any>(`/api/topics/${topicId}`),
};

/**
 * Events API
 */
export const eventsApi = {
  listEvents: () => fetchApi<{ events: any[] }>('/api/events'),
  getEvent: (eventId: number) => fetchApi<any>(`/api/events/${eventId}`),
};

