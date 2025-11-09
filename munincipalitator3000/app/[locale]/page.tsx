'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search } from "lucide-react";
import { useEffect, useState } from 'react';
import { topicsApi } from '@/lib/api';

export default function Home() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await topicsApi.listTopics();
        setTrendingTopics(data.topics);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-50"></div>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Make sure the backend is running at{' '}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
              http://localhost:8000
            </code>
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Run: <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">python -m api.main</code>
          </p>
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-xl">No topics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-[1800px] p-8">
        {/* Header with Search */}
        <div className="mb-10 space-y-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t('dashboardTitle')}
            </h1>

          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="relative mx-auto max-w-2xl"
          >
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 text-base shadow-sm"
            />
          </form>
        </div>

        {/* Main Content Area */}
        <div className="space-y-10">
          {/* Topic Sections */}
          {trendingTopics.map((topic: any) => {
            // Find max value across all data points for scaling
            const allDataPoints = topic.events.flatMap((e: any) => e.data_points || e.dataPoints);
            const maxValue = Math.max(...allDataPoints);
            const minValue = Math.min(...allDataPoints);
            const range = maxValue - minValue;

            return (
              <Link key={topic.id} href={`/topics/${topic.id}`} className="block">
                <Card className="cursor-pointer border-2 shadow-lg transition-all hover:border-zinc-400 hover:shadow-2xl dark:hover:border-zinc-600">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{topic.icon}</span>
                      <div>
                        <CardTitle className="text-2xl">{topic.name}</CardTitle>
                        <CardDescription className="text-base">
                          {topic.events.length} {t('activeEventsInTopic')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-[350px_1fr_180px] gap-8">
                      {/* Left: Legend */}
                      <div className="space-y-4">
                        {topic.events.map((event: any) => (
                          <div key={event.id} className="flex items-center gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                            <div
                              className="h-4 w-4 shrink-0 rounded-full shadow-sm"
                              style={{ backgroundColor: event.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-medium text-zinc-900 dark:text-zinc-50 truncate">
                                {event.name}
                              </div>
                            </div>
                            {/* <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                              {event.engagement.toLocaleString()}
                            </div> */}
                          </div>
                        ))}
                      </div>

                      {/* Center: Line Graph */}
                      <div className="relative h-48 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                        <svg className="h-full w-full" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid meet">
                          {/* Background grid */}
                          <defs>
                            <pattern id={`grid-${topic.id}`} width="80" height="60" patternUnits="userSpaceOnUse">
                              <path d="M 80 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
                            </pattern>
                          </defs>
                          <rect width="800" height="240" fill={`url(#grid-${topic.id})`} />

                          {/* Lines for each event */}
                          {topic.events.map((event: any, eventIndex: number) => {
                            const padding = 20;
                            const graphWidth = 800 - (padding * 2);
                            const graphHeight = 240 - (padding * 2);

                            const dataPoints = event.data_points || event.dataPoints;
                            const points = dataPoints.map((value: number, index: number) => {
                              const x = padding + (index / (dataPoints.length - 1)) * graphWidth;
                              const normalizedValue = (value - minValue) / range;
                              const y = padding + graphHeight - (normalizedValue * graphHeight);
                              return `${x},${y}`;
                            }).join(' ');

                            return (
                              <g key={event.id}>
                                {/* Shadow/glow effect */}
                                <polyline
                                  points={points}
                                  fill="none"
                                  stroke={event.color}
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  opacity="0.2"
                                />

                                {/* Main line */}
                                <polyline
                                  points={points}
                                  fill="none"
                                  stroke={event.color}
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Data points */}
                                {dataPoints.map((value: number, index: number) => {
                                  const x = padding + (index / (dataPoints.length - 1)) * graphWidth;
                                  const normalizedValue = (value - minValue) / range;
                                  const y = padding + graphHeight - (normalizedValue * graphHeight);
                                  return (
                                    <circle
                                      key={index}
                                      cx={x}
                                      cy={y}
                                      r="5"
                                      fill={event.color}
                                      stroke="white"
                                      strokeWidth="2.5"
                                      className="drop-shadow-md"
                                    />
                                  );
                                })}
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Right: Actionables */}
                      <div className="flex flex-col justify-center space-y-6">
                        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20">
                          <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                            {topic.actionables.misinformation}
                          </div>
                          <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-2">
                            {t('misinformation')}
                          </div>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/20">
                          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            {topic.actionables.questions}
                          </div>
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-2">
                            {t('questions')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
