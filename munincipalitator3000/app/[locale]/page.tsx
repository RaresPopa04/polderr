'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, Upload, TrendingUp } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import { topicsApi } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingWeekly, setExportingWeekly] = useState(false);
  const [exportingMonthly, setExportingMonthly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Color palette for different events
  const eventColors = ['#4A8EC6', '#6BC04A', '#F59E0B'];

  const loadDashboard = async () => {
    try {
      const data = await topicsApi.listTopics();
      console.log('Loaded topics:', data.topics);

      // Log top_events for each topic
      data.topics.forEach((topic: any) => {
        console.log(`Topic ${topic.name} has ${topic.top_events?.length || 0} top events`);
        if (topic.top_events) {
          topic.top_events.forEach((event: any, idx: number) => {
            console.log(`  Event ${idx}: ${event.name}, Timeline points: ${event.timeline?.length || 0}`);
          });
        }
      });

      // Sort topics by total_posts in descending order
      const sortedTopics = [...data.topics].sort((a, b) =>
        (b.total_posts || 0) - (a.total_posts || 0)
      );
      setTrendingTopics(sortedTopics);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Function to merge timelines for multiple events
  const mergeTimelines = (topEvents: any[]) => {
    console.log('mergeTimelines called with:', topEvents.length, 'events');

    if (!topEvents || topEvents.length === 0) {
      console.log('No top events provided');
      return [];
    }

    // Create a map of all unique timestamps
    const timestampMap = new Map();

    topEvents.forEach((event, idx) => {
      // Support both 'timeline' and 'engagement_timeline' field names
      const timeline = event.timeline || event.engagement_timeline;

      console.log(`Processing event ${idx}: ${event.name}`, {
        has_timeline: !!event.timeline,
        has_engagement_timeline: !!event.engagement_timeline,
        timeline_length: timeline?.length || 0,
        first_point: timeline?.[0]
      });

      // Check if event has timeline data
      if (!timeline || timeline.length === 0) {
        console.warn(`Event ${event.name} has no timeline data`);
        return;
      }

      timeline.forEach((point: any) => {
        const timestamp = point.timestamp;
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, {
            date: point.date,
            timestamp: timestamp
          });
        }
        // Add this event's data
        timestampMap.get(timestamp)[`event_${idx}`] = point.total_interactions;
      });
    });

    // Convert to array and sort by timestamp
    const merged = Array.from(timestampMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    console.log('Merged timeline has', merged.length, 'points');
    console.log('Sample merged points:', merged.slice(0, 2));

    // Forward-fill missing values for each event
    topEvents.forEach((_, idx) => {
      let lastValue = 0;
      merged.forEach(point => {
        if (point[`event_${idx}`] !== undefined) {
          lastValue = point[`event_${idx}`];
        } else {
          point[`event_${idx}`] = lastValue;
        }
      });
    });

    console.log('After forward-fill:', merged.slice(0, 2));
    return merged;
  };

  const handleExportWeekly = async () => {
    setExportingWeekly(true);
    try {
      const response = await fetch(`http://localhost:8000/api/reports/weekly/pdf`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      alert(err.message || 'Failed to export PDF');
    } finally {
      setExportingWeekly(false);
    }
  };

  const handleExportMonthly = async () => {
    setExportingMonthly(true);
    try {
      const response = await fetch(`http://localhost:8000/api/reports/monthly/pdf`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      alert(err.message || 'Failed to export PDF');
    } finally {
      setExportingMonthly(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Trigger upload after state updates
    setTimeout(() => uploadFile(file), 0);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('upload', file);

      const response = await fetch('http://localhost:8000/api/upload-file-as-post', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload file');
      }

      const result = await response.json();
      alert(`File uploaded successfully! UUID: ${result.uuid}`);

      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload the dashboard to show updated data
      await loadDashboard();
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</p>
          <p className="text-zinc-700 dark:text-zinc-300">
            Make sure the backend is running at{' '}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
              http://localhost:8000
            </code>
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Run: <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">python -m api.main</code>
          </p>
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-zinc-700 dark:text-zinc-300 text-xl">No topics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header with Search */}
        <div className="mb-10 space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('dashboardTitle')}
            </h1>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Reports Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value === 'weekly') handleExportWeekly();
                    if (e.target.value === 'monthly') handleExportMonthly();
                    e.target.value = '';
                  }}
                  disabled={exportingWeekly || exportingMonthly}
                  className="h-10 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                >
                  <option value="">
                    {exportingWeekly || exportingMonthly ? 'Generating...' : '📊 Export Report'}
                  </option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>

              {/* Show Trends Button */}
              <Link href="/engagementtrends">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trends
                </Button>
              </Link>
            </div>
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

        {/* Topics Grid with Engagement Graphs */}
        <div className="grid gap-6 md:grid-cols-2">
          {trendingTopics.map((topic) => {
            const chartData = topic.top_events && topic.top_events.length > 0
              ? mergeTimelines(topic.top_events)
              : [];

            console.log(`Topic ${topic.name}:`, {
              top_events_count: topic.top_events?.length || 0,
              chartData_length: chartData.length,
              chartData: chartData.slice(0, 3) // Log first 3 points
            });

            return (
              <Link key={topic.id} href={`/topics/${topic.id}`}>
                <Card className="border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-900">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{topic.icon}</span>
                        <CardTitle className="text-2xl">{topic.name}</CardTitle>
                      </div>
                      <div className="flex flex-col gap-1 text-right text-sm text-zinc-600 dark:text-zinc-400">
                        <span>
                          {topic.actionables?.misinformation || 0} misinformation
                        </span>
                        <span>
                          {topic.actionables?.questions || 0} questions
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Engagement Chart */}
                    {chartData.length > 0 ? (
                      <div className="h-80 w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                            <XAxis
                              dataKey="date"
                              className="text-xs text-zinc-600 dark:text-zinc-400"
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                            />
                            <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e4e4e7',
                                borderRadius: '8px'
                              }}
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                                        {new Date(payload[0].payload.date).toLocaleDateString()}
                                      </p>
                                      {payload.map((entry: any, index: number) => (
                                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                                          {topic.top_events[index]?.name}: {entry.value} interactions
                                        </p>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend
                              content={({ payload }) => (
                                <div className="flex flex-wrap gap-3 justify-center mt-4">
                                  {payload?.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">
                                        {topic.top_events[index]?.name || `Event ${index + 1}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            />
                            {topic.top_events?.map((event: any, idx: number) => (
                              <Line
                                key={idx}
                                type="monotone"
                                dataKey={`event_${idx}`}
                                stroke={eventColors[idx]}
                                strokeWidth={2}
                                dot={{ fill: eventColors[idx], r: 3 }}
                                name={event.name}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 w-full flex items-center justify-center">
                        <p className="text-zinc-400 dark:text-zinc-600">No engagement data available</p>
                      </div>
                    )}
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
