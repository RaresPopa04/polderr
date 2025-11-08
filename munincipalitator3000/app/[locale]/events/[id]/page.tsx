'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExternalLink, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const t = useTranslations('EventDetailPage');
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await eventsApi.getEvent(parseInt(eventId));
        setEventData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('Failed to load event data');
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-50"></div>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error || 'Event not found'}</p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Make sure the backend is running at{' '}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
              http://localhost:8000
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: eventData.color || '#3b82f6' }}
            />
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {eventData.name}
            </h1>
          </div>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {eventData.small_summary || 'No description available'}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Total Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {eventData.engagement?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          {eventData.totalPosts !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {eventData.totalPosts}
                </div>
              </CardContent>
            </Card>
          )}

          {eventData.date && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {new Date(eventData.date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Engagement Timeline Chart */}
        {eventData.engagementData && eventData.engagementData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Engagement Over Time</CardTitle>
              <CardDescription>
                Historical engagement with predicted future trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventData.engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-zinc-600 dark:text-zinc-400"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Actual Engagement"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted Engagement"
                      dot={{ fill: '#f59e0b', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {eventData.big_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                {eventData.big_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        {eventData.posts && eventData.posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Related Posts</CardTitle>
              <CardDescription>
                All social media posts related to this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {post.source} • {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                      {post.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>{post.engagement} engagement</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
