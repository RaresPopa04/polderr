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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-[#4A8EC6]"></div>
          <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 text-xl font-bold mb-4">{error}</p>
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            {t('backendError')}
          </p>
          <code className="block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-mono mb-4">
            http://localhost:8000
          </code>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('runCommand')}
          </p>
          <code className="block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-mono mt-2">
            python -m api.main
          </code>
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-700 dark:text-slate-300 text-xl font-medium">{t('noTopics')}</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">{t('noTopicsDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        {/* Header with Search */}
        <div className="mb-12 space-y-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                <span className="bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                  {t('dashboardTitle')}
                </span>
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {/* Reports Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value === 'weekly') handleExportWeekly();
                    if (e.target.value === 'monthly') handleExportMonthly();
                    e.target.value = '';
                  }}
                  disabled={exportingWeekly || exportingMonthly}
                  className="h-10 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4A8EC6] font-semibold text-sm transition-all shadow-sm"
                >
                  <option value="">
                    {exportingWeekly || exportingMonthly ? t('generating') : t('exportReport')}
                  </option>
                  <option value="weekly">{t('weeklyReport')}</option>
                  <option value="monthly">{t('monthlyReport')}</option>
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
                  {uploading ? t('uploading') : t('upload')}
                </Button>
              </div>

              {/* Show Trends Button */}
              <Link href="/engagementtrends">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t('trends')}
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
            className="relative mx-auto max-w-3xl"
          >
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 pl-14 pr-6 text-base shadow-md border-2 border-slate-200 dark:border-slate-700 focus:border-[#4A8EC6] dark:focus:border-[#4A8EC6] rounded-xl bg-white dark:bg-slate-900 placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Topics Grid with Engagement Graphs */}
        <div className="grid gap-8 md:grid-cols-2">
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
                <Card className="group border-2 border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4A8EC6]/10 hover:border-[#4A8EC6]/50 dark:hover:border-[#4A8EC6]/50 hover:-translate-y-1 cursor-pointer bg-white dark:bg-slate-900">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                        <div>
                          <CardTitle className="text-2xl mb-1">
                            {topic.name === "Culture and Events" ? "Cultuur en Evenementen" :
                              topic.name === "Public Administration" ? "Openbaar Bestuur" :
                                topic.name}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                          <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                            {topic.actionables?.misinformation || 0} {t('misinformation')}
                          </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                            {topic.actionables?.questions || 0} {t('questions')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    {/* Engagement Chart */}
                    {chartData.length > 0 ? (
                      <div className="h-80 w-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" opacity={0.5} />
                            <XAxis
                              dataKey="date"
                              className="text-xs text-slate-600 dark:text-slate-400"
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                              stroke="#94a3b8"
                            />
                            <YAxis className="text-xs text-slate-600 dark:text-slate-400" stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl">
                                      <p className="font-bold text-slate-900 dark:text-slate-50 mb-3 text-sm">
                                        {new Date(payload[0].payload.date).toLocaleDateString()}
                                      </p>
                                      {payload.map((entry: any, index: number) => (
                                        <p key={index} className="text-sm font-medium mb-1" style={{ color: entry.color }}>
                                          {topic.top_events[index]?.name}: <span className="font-bold">{entry.value}</span> {t('interactions')}
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
                                <div className="flex flex-wrap gap-3 justify-center mt-4 px-2">
                                  {payload?.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                      <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
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
                                strokeWidth={3}
                                dot={{ fill: eventColors[idx], r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                                name={event.name}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noEngagementData')}</p>
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
