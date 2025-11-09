'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExternalLink, TrendingUp, Calendar, MessageCircle, AlertTriangle, HelpCircle } from 'lucide-react';
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

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const renderReturnDot = (color: string) => (props: any) => {
    const { cx, cy, payload } = props;
    if (payload?.prediction) {
      return (
        <rect
          x={cx - 5}
          y={cy - 5}
          width={10}
          height={10}
          fill="white"
          stroke={color}
          strokeWidth={2}
          transform={`rotate(45 ${cx} ${cy})`}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill={color} />;
  };

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
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {eventData.name}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {eventData.small_summary || 'No description available'}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Total Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {eventData.interaction_timeline && eventData.interaction_timeline.length > 0
                  ? eventData.interaction_timeline
                      .filter((point: any) => !point.prediction)
                      .reduce((max: number, point: any) => Math.max(max, point.total_interactions || 0), 0)
                      .toLocaleString()
                  : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {eventData.posts?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Interactions Timeline Chart */}
        {eventData.interaction_timeline && eventData.interaction_timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Total Interactions Over Time</CardTitle>
              <CardDescription>
                Cumulative interactions across all posts. Dashed line shows predicted trajectory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventData.interaction_timeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-zinc-600 dark:text-zinc-400"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis
                      className="text-xs text-zinc-600 dark:text-zinc-400"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                                {new Date(data.date).toLocaleString()}
                              </p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Total: {data.total_interactions?.toLocaleString()} interactions
                              </p>
                              {data.prediction && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  📈 Predicted
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    {/* Render actual data (solid line) */}
                    <Line
                      type="monotone"
                      dataKey="total_interactions"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Actual"
                      connectNulls={false}
                      data={eventData.interaction_timeline.filter((point: any) => !point.prediction)}
                      dot={(props: any) => {
                        const { cx, cy } = props;
                        return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" />;
                      }}
                    />
                    {/* Render prediction data (dashed line) - only if there's a prediction */}
                    {eventData.interaction_timeline.some((point: any) => point.prediction) && (
                      <Line
                        type="monotone"
                        dataKey="total_interactions"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted"
                        connectNulls={false}
                        data={[
                          ...eventData.interaction_timeline.filter((point: any) => !point.prediction).slice(-1),
                          ...eventData.interaction_timeline.filter((point: any) => point.prediction)
                        ]}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload?.prediction) {
                            return (
                              <rect
                                x={cx - 5}
                                y={cy - 5}
                                width={10}
                                height={10}
                                fill="white"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                transform={`rotate(45 ${cx} ${cy})`}
                              />
                            );
                          }
                          return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" />;
                        }}
                      />
                    )}
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

        {/* Actionables */}
        {eventData.actionables && eventData.actionables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Actionables</CardTitle>
              <CardDescription>
                Misinformation and questions that need responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.actionables.map((actionable: any, index: number) => (
                  <div
                    key={actionable.actionable_id || index}
                    className={`rounded-lg border p-4 ${
                      actionable.is_question
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {actionable.is_question ? (
                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`font-medium ${
                              actionable.is_question
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-red-900 dark:text-red-100'
                            }`}>
                              {actionable.is_question ? 'Question' : 'Misinformation'}
                            </p>
                            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                              "{actionable.content}"
                            </p>
                          </div>
                          <a
                            href={actionable.post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            title="View original post"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        {actionable.proposed_response && (
                          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                              Proposed Response:
                            </p>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">
                              {actionable.proposed_response}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        {eventData.posts && eventData.posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Related Posts</CardTitle>
              <CardDescription>
                All posts related to this event ({eventData.posts.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.posts.map((post: any, index: number) => (
                  <div
                    key={post.link || index}
                    className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                          >
                            View Post
                          </a>
                          <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {post.source} • {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                      {post.satisfaction_rating !== undefined && (
                        <div className="ml-4 flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${
                            post.satisfaction_rating >= 60
                              ? 'text-green-600 dark:text-green-400'
                              : post.satisfaction_rating >= 40
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {post.satisfaction_rating}% sentiment
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-zinc-700 dark:text-zinc-300 line-clamp-3">
                      {post.content}
                    </p>
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
