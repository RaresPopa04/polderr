/**
 * API client for connecting to Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

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

/**
 * Search API
 */
export const searchApi = {
  search: (query: string) => fetchApi<SearchResponse>('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  }),
};

/**
 * Forum API
 */
export const forumApi = {
  getForumPosts: (topicId: string) => fetchApi<{ posts: ForumPost[] }>(`/api/topics/${topicId}/forum`),
  createForumPost: (topicId: string, content: string) => fetchApi<ForumPost>(`/api/topics/${topicId}/forum`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  }),
};

/**
 * Type definitions
 */
export interface SearchResponse {
  topic_id: number;
  name: string;
  events: SearchEvent[];
  total_events_searched: number;
  similarity_threshold: number;
}

export interface SearchEvent {
  event_id: number;
  name: string;
  small_summary: string;
  big_summary: string;
  case_description?: string;
  date: string;
  keywords: string[];
  similarity_score?: number;
}

export interface ForumPost {
  id: number;
  content: string;
  timestamp: string;
}
