'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function EventPage({ params }: { params: { id: string } }) {
  const t = useTranslations('EventDetailPage');
  
  // Mock data - this would come from your API/backend
  const mockEventData = {
    id: 1,
    name: t('eventName'),
    small_summary: t('eventSmallSummary'),
    big_summary: t('eventBigSummary'),
    
    // Engagement data over time (actual + predicted)
    engagementData: [
      { date: '2025-11-01', engagement: 45, predicted: null },
      { date: '2025-11-02', engagement: 62, predicted: null },
      { date: '2025-11-03', engagement: 78, predicted: null },
      { date: '2025-11-04', engagement: 95, predicted: null },
      { date: '2025-11-05', engagement: 123, predicted: null },
      { date: '2025-11-06', engagement: 145, predicted: null },
      { date: '2025-11-07', engagement: 167, predicted: null },
      { date: '2025-11-08', engagement: 189, predicted: null },
      // Predicted future values
      { date: '2025-11-09', engagement: null, predicted: 210 },
      { date: '2025-11-10', engagement: null, predicted: 235 },
      { date: '2025-11-11', engagement: null, predicted: 258 },
      { date: '2025-11-12', engagement: null, predicted: 275 },
      { date: '2025-11-13', engagement: null, predicted: 285 },
    ],
    
    posts: [
      {
        id: 1,
        title: t('post1Title'),
        link: "https://facebook.com/rijswijk-nieuws/posts/123456",
        source: t('post1Source'),
        date: "2025-11-08",
        engagement: 89,
        content: t('post1Content')
      },
      {
        id: 2,
        title: t('post2Title'),
        link: "https://twitter.com/rijswijk_veilig/status/987654",
        source: t('post2Source'),
        date: "2025-11-07",
        engagement: 67,
        content: t('post2Content')
      },
      {
        id: 3,
        title: t('post3Title'),
        link: "https://instagram.com/p/abc123",
        source: t('post3Source'),
        date: "2025-11-06",
        engagement: 145,
        content: t('post3Content')
      },
      {
        id: 4,
        title: t('post4Title'),
        link: "https://youtube.com/watch?v=xyz789",
        source: t('post4Source'),
        date: "2025-11-05",
        engagement: 234,
        content: t('post4Content')
      },
      {
        id: 5,
        title: t('post5Title'),
        link: "https://linkedin.com/posts/gemeente-rijswijk_abc123",
        source: t('post5Source'),
        date: "2025-11-04",
        engagement: 56,
        content: t('post5Content')
      },
    ]
  };
  
  // In a real app, you would fetch data based on params.id
  const event = mockEventData;
  
  // Calculate total engagement
  const totalEngagement = event.posts.reduce((sum, post) => sum + post.engagement, 0);
  
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {event.name}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {event.small_summary}
          </p>
        </div>

        {/* Engagement Graph */}
        <Card>
          <CardHeader>
            <CardTitle>{t('engagementTitle')}</CardTitle>
            <CardDescription>
              {t('engagementDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={event.engagementData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis 
                    dataKey="date" 
                    className="text-zinc-600 dark:text-zinc-400"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis className="text-zinc-600 dark:text-zinc-400" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name={t('actualEngagement')}
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name={t('predictedEngagement')}
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('totalPosts')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{event.posts.length}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('totalEngagement')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalEngagement}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('averagePerPost')}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {Math.round(totalEngagement / event.posts.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-700 dark:text-zinc-300">{event.big_summary}</p>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('relatedPostsTitle')}</CardTitle>
            <CardDescription>
              {t('relatedPostsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {event.posts.map((post) => (
                <div 
                  key={post.id}
                  className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {post.title}
                      </h3>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('viewLink')}
                      </a>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                      <span className="font-medium">{post.source}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {post.engagement} engagement
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

