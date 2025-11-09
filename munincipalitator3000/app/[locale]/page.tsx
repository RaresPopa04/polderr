'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, Calendar, CalendarRange, Upload, TrendingUp } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import { topicsApi } from '@/lib/api';

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

  const loadDashboard = async () => {
    try {
      const data = await topicsApi.listTopics();
      setTrendingTopics(data.topics);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
        <div className="text-center">
          <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-[#4A8EC6] dark:border-[#7CB8E8] polderr-glow-blue"></div>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️ {error}</p>
          <p className="text-zinc-700 dark:text-zinc-300">
            Make sure the backend is running at{' '}
            <code className="bg-[#4A8EC6]/10 dark:bg-[#5B9ED3]/20 px-2 py-1 rounded">
              http://localhost:8000
            </code>
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Run: <code className="bg-[#4A8EC6]/10 dark:bg-[#5B9ED3]/20 px-2 py-1 rounded">python -m api.main</code>
          </p>
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
        <div className="text-center">
          <p className="text-zinc-700 dark:text-zinc-300 text-xl">No topics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
      <div className="mx-auto max-w-[1800px] p-8">
        {/* Header with Search */}
        <div className="mb-10 space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
              {t('dashboardTitle')}
            </h1>

            {/* Report Export Buttons and Upload */}
            <div className="flex gap-3">
              <Button
                onClick={handleExportWeekly}
                disabled={exportingWeekly}
                variant="outline"
                className="flex items-center gap-2 border-[#4A8EC6] text-[#4A8EC6] hover:bg-[#4A8EC6]/10 dark:border-[#7CB8E8] dark:text-[#7CB8E8] dark:hover:bg-[#7CB8E8]/10"
              >
                <Calendar className="h-4 w-4" />
                {exportingWeekly ? 'Generating...' : 'Weekly Report'}
              </Button>
              <Button
                onClick={handleExportMonthly}
                disabled={exportingMonthly}
                variant="outline"
                className="flex items-center gap-2 border-[#4A8EC6] text-[#4A8EC6] hover:bg-[#4A8EC6]/10 dark:border-[#7CB8E8] dark:text-[#7CB8E8] dark:hover:bg-[#7CB8E8]/10"
              >
                <CalendarRange className="h-4 w-4" />
                {exportingMonthly ? 'Generating...' : 'Monthly Report'}
              </Button>

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
                  className="flex items-center gap-2 border-[#6BC04A] text-[#6BC04A] hover:bg-[#6BC04A]/10 dark:border-[#7ACC58] dark:text-[#7ACC58] dark:hover:bg-[#7ACC58]/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  type="button"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Post'}
                </Button>
              </div>

              {/* Show Trends Button */}
              <Link href="/engagementtrends">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[#6BC04A] text-[#6BC04A] hover:bg-[#6BC04A]/10 dark:border-[#7ACC58] dark:text-[#7ACC58] dark:hover:bg-[#7ACC58]/10"
                >
                  <TrendingUp className="h-4 w-4" />
                  Show Trends
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
                <Card className="cursor-pointer border-2 border-[#4A8EC6]/20 shadow-lg transition-all hover:border-[#4A8EC6] hover:shadow-2xl hover:shadow-[#4A8EC6]/20 dark:border-[#5B9ED3]/20 dark:hover:border-[#5B9ED3] dark:hover:shadow-[#5B9ED3]/20">
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
                          <div key={event.id} className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-[#4A8EC6]/5 to-[#6BC04A]/5 p-3 dark:from-[#5B9ED3]/10 dark:to-[#7ACC58]/10 border border-[#4A8EC6]/10 dark:border-[#5B9ED3]/20">
                            <div
                              className="h-4 w-4 shrink-0 rounded-full shadow-sm ring-2 ring-white dark:ring-[#0f1419]"
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
                      <div className="relative h-48 rounded-lg border border-[#4A8EC6]/20 bg-white/50 backdrop-blur-sm p-4 dark:border-[#5B9ED3]/30 dark:bg-[#0f1419]/50">
                        <svg className="h-full w-full" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid meet">
                          {/* Background grid */}
                          <defs>
                            <pattern id={`grid-${topic.id}`} width="80" height="60" patternUnits="userSpaceOnUse">
                              <path d="M 80 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#4A8EC6]/20 dark:text-[#5B9ED3]/20" />
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
                        <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4 text-center border-2 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/30 shadow-sm">
                          <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                            {topic.actionables.misinformation}
                          </div>
                          <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-2">
                            {t('misinformation')}
                          </div>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-[#7CB8E8]/20 to-[#4A8EC6]/30 p-4 text-center border-2 border-[#4A8EC6]/40 dark:from-[#5B9ED3]/20 dark:to-[#4A8EC6]/20 dark:border-[#5B9ED3]/40 shadow-sm">
                          <div className="text-4xl font-bold text-[#2E6B9F] dark:text-[#7CB8E8]">
                            {topic.actionables.questions}
                          </div>
                          <div className="text-sm font-medium text-[#4A8EC6] dark:text-[#8FC5EE] mt-2">
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
