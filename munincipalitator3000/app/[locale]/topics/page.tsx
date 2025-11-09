'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { Hash, ArrowRight, FileDown, TrendingUp } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { topicsApi } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TopicsOverviewPage() {
    const t = useTranslations('TopicsOverviewPage');
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Color palette for different events
    const eventColors = ['#4A8EC6', '#6BC04A', '#F59E0B'];

    useEffect(() => {
        async function loadTopics() {
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
                setTopics(sortedTopics);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load topics:', err);
                setError('Failed to load topics data');
                setLoading(false);
            }
        }
        loadTopics();
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
                <div className="text-center">
                    <div className="h-32 w-32 mx-auto animate-spin rounded-full border-b-2 border-[#4A8EC6] dark:border-[#7CB8E8] polderr-glow-blue"></div>
                    <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">Loading topics...</p>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e8f4f8] via-white to-[#e8f5e9] p-6 dark:from-[#0a0e12] dark:via-[#0f1419] dark:to-[#0d1410]">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-zinc-700 dark:text-zinc-300">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Topics Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {topics.map((topic) => {
                        const chartData = topic.top_events && topic.top_events.length > 0 
                            ? mergeTimelines(topic.top_events) 
                            : [];
                        
                        console.log(`Topic ${topic.name}:`, {
                            top_events_count: topic.top_events?.length || 0,
                            chartData_length: chartData.length,
                            chartData: chartData.slice(0, 3) // Log first 3 points
                        });
                        
                        return (
                            <Card key={topic.id} className="border-2 border-[#4A8EC6]/20 transition-all hover:shadow-lg hover:border-[#4A8EC6] hover:shadow-[#4A8EC6]/20 dark:border-[#5B9ED3]/20 dark:hover:border-[#5B9ED3] dark:hover:shadow-[#5B9ED3]/20">
                            <CardHeader>
                                    <div className="mb-4 inline-flex rounded-lg p-3 bg-gradient-to-br from-[#4A8EC6]/10 to-[#6BC04A]/10 dark:from-[#5B9ED3]/20 dark:to-[#7ACC58]/20">
                                    <span className="text-4xl">{topic.icon}</span>
                                </div>
                                <CardTitle className="text-2xl">{topic.name}</CardTitle>
                                <CardDescription className="text-base">
                                        {topic.events?.length || 0} events • {topic.total_posts || 0} posts
                                </CardDescription>
                            </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Engagement Chart */}
                                    {chartData.length > 0 ? (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                                Top {topic.top_events?.length || 0} Events Engagement
                                            </h3>
                                            <div className="h-80 w-full bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
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
                                        </div>
                                    ) : (
                                        <div className="h-64 w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <p className="text-zinc-500 dark:text-zinc-400">No engagement data available</p>
                                        </div>
                                    )}

                                    {/* Stats and Action Button */}
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex gap-4">
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {topic.actionables?.misinformation || 0} misinformation
                                        </span>
                                            <span className="text-sm text-[#4A8EC6] dark:text-[#7CB8E8]">
                                            {topic.actionables?.questions || 0} questions
                                        </span>
                                    </div>
                                    <Link href={`/topics/${topic.id}`}>
                                            <Button className="bg-gradient-to-r from-[#4A8EC6] to-[#6BC04A] hover:from-[#5B9ED3] hover:to-[#7ACC58]">
                                            {t('viewTopic')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

